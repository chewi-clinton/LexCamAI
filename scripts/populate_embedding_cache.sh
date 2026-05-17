#!/usr/bin/env bash
set -euo pipefail

# Populate the named Docker volume `embedding_cache` with model files
# Usage: ./scripts/populate_embedding_cache.sh [image]
# Default image: lexcam/embedding-service:from-test

IMAGE=${1:-lexcam/embedding-service:from-test}

echo "Using image: $IMAGE"

TMPDIR=$(mktemp -d)
cleanup() {
  rm -rf "$TMPDIR"
}
trap cleanup EXIT

echo "Creating temporary container from image to extract model..."
CID=$(docker create "$IMAGE")
echo "Copying /cache/model.onnx from container $CID to host temp"
docker cp "$CID":/cache/model.onnx "$TMPDIR"/model.onnx
docker rm "$CID" >/dev/null

echo "Creating temporary container with embedding_cache volume mounted..."
VCONTAINER=$(docker create --name tmp_embedding_volume -v embedding_cache:/cache busybox)
echo "Copying model into volume"
docker cp "$TMPDIR"/model.onnx tmp_embedding_volume:/cache/model.onnx
docker rm tmp_embedding_volume >/dev/null

echo "Model copied into volume 'embedding_cache'"

echo "Done"
