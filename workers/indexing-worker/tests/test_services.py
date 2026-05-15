from __future__ import annotations

import os
import sys
import unittest
from unittest.mock import MagicMock, patch

os.environ.setdefault("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
os.environ.setdefault("KB_SERVICE_URL", "http://kb-service-test")
os.environ.setdefault("EMBEDDING_SERVICE_URL", "http://embedding-service-test")
os.environ.setdefault("INTERNAL_SERVICE_KEY", "test-key")
os.environ.setdefault("QDRANT_URL", "http://qdrant-test:6333")

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import services


class TestChunkText(unittest.TestCase):

    def test_short_text_returns_single_chunk(self):
        text = "This is a short legal text."
        chunks = services.chunk_text(text, chunk_size=500, overlap=50)
        self.assertEqual(len(chunks), 1)
        self.assertEqual(chunks[0], text)

    def test_long_text_splits_into_multiple_chunks(self):
        words = ["word"] * 1200
        text = " ".join(words)
        chunks = services.chunk_text(text, chunk_size=500, overlap=50)
        self.assertGreater(len(chunks), 1)

    def test_chunk_size_respected(self):
        words = ["word"] * 600
        text = " ".join(words)
        chunks = services.chunk_text(text, chunk_size=500, overlap=50)
        for chunk in chunks:
            self.assertLessEqual(len(chunk.split()), 500)

    def test_overlap_means_chunks_share_words(self):
        words = [f"w{i}" for i in range(600)]
        text = " ".join(words)
        chunks = services.chunk_text(text, chunk_size=500, overlap=50)
        self.assertGreater(len(chunks), 1)
        last_words_first = chunks[0].split()[-50:]
        first_words_second = chunks[1].split()[:50]
        self.assertEqual(last_words_first, first_words_second)

    def test_empty_text_returns_one_chunk(self):
        chunks = services.chunk_text("", chunk_size=500, overlap=50)
        self.assertEqual(len(chunks), 1)

    def test_exact_chunk_size_returns_single_chunk(self):
        words = ["word"] * 500
        text = " ".join(words)
        chunks = services.chunk_text(text, chunk_size=500, overlap=50)
        self.assertEqual(len(chunks), 1)


class TestGetEmbeddings(unittest.TestCase):

    @patch("services.requests.post")
    def test_returns_embeddings_list(self, mock_post):
        fake_vector = [0.1] * 384
        mock_post.return_value = MagicMock(
            status_code=200,
            json=lambda: {"embeddings": [fake_vector, fake_vector]},
        )
        embeddings = services.get_embeddings(["text one", "text two"])
        self.assertEqual(len(embeddings), 2)
        self.assertEqual(len(embeddings[0]), 384)

    @patch("services.requests.post")
    def test_calls_correct_endpoint(self, mock_post):
        mock_post.return_value = MagicMock(
            status_code=200,
            json=lambda: {"embeddings": [[0.0] * 384]},
        )
        services.get_embeddings(["test"])
        url = mock_post.call_args[0][0]
        self.assertIn("/api/v1/embed", url)


class TestUpsertArticleChunks(unittest.TestCase):

    @patch("services.get_embeddings")
    @patch("services._qdrant")
    def test_upserts_correct_number_of_chunks(self, mock_qdrant, mock_embed):
        words = ["word"] * 600
        article = {
            "id": "article-1",
            "full_text": " ".join(words),
            "law_name": "Labor Code",
            "article_number": "Art. 1",
            "domain": "labor",
            "language": "en",
        }
        mock_embed.return_value = [[0.1] * 384, [0.2] * 384]
        mock_qdrant.upsert.return_value = None

        count = services.upsert_article_chunks(article)
        self.assertEqual(count, 2)
        mock_qdrant.upsert.assert_called_once()

    @patch("services.get_embeddings")
    @patch("services._qdrant")
    def test_short_article_single_chunk(self, mock_qdrant, mock_embed):
        article = {
            "id": "article-2",
            "full_text": "Short article text.",
            "law_name": "Civil Code",
            "article_number": "Art. 5",
            "domain": "commercial",
            "language": "en",
        }
        mock_embed.return_value = [[0.3] * 384]
        mock_qdrant.upsert.return_value = None

        count = services.upsert_article_chunks(article)
        self.assertEqual(count, 1)


class TestIndexArticles(unittest.TestCase):

    @patch("services.upsert_article_chunks", return_value=3)
    @patch("services.get_article")
    @patch("services.ensure_collection_exists")
    def test_indexes_all_articles(self, mock_ensure, mock_get, mock_upsert):
        mock_get.return_value = {
            "id": "art-1", "full_text": "text", "law_name": "L",
            "article_number": "1", "domain": "labor", "language": "en",
        }
        total = services.index_articles(["art-1", "art-2"])
        self.assertEqual(total, 6)
        self.assertEqual(mock_upsert.call_count, 2)

    @patch("services.get_article", side_effect=Exception("Network error"))
    @patch("services.ensure_collection_exists")
    def test_skips_failed_articles(self, mock_ensure, mock_get):
        total = services.index_articles(["art-1"])
        self.assertEqual(total, 0)


if __name__ == "__main__":
    unittest.main()
