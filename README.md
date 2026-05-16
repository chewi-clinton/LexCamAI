# LexCamAI

## Embedding model storage

The embedding service now expects the ONNX model to live outside git, with a
GitHub Releases asset as the preferred source.

Use a release tag such as `embedding-model-v1`, upload the model as
`model.onnx`, and set these repository variables for the build workflow:

- `EMBEDDING_MODEL_RELEASE_TAG`
- `EMBEDDING_MODEL_SHA256`

The image build downloads the asset from:
`https://github.com/<owner>/<repo>/releases/download/<tag>/model.onnx`
