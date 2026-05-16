FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /workspace

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential git curl ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu transformers onnx onnxruntime optimum sentence-transformers

COPY services/embedding-service/scripts/convert_to_onnx.py /workspace/convert_to_onnx.py

ENTRYPOINT ["python", "/workspace/convert_to_onnx.py"]
