# Stage 1: convert the HuggingFace model to ONNX
# PyTorch and optimum are only needed here — they are NOT copied to the final image.
FROM python:3.11-slim AS converter

ARG MODEL_NAME=intfloat/multilingual-e5-small

RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir "optimum[onnxruntime]" transformers

RUN HF_HOME=/tmp/hf_cache optimum-cli export onnx \
        --model ${MODEL_NAME} \
        --task feature-extraction \
        /onnx_output/ \
    && ls /onnx_output/model.onnx


# Stage 2: lean runtime image
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    TRANSFORMERS_CACHE=/cache \
    HF_HOME=/cache

ARG MODEL_NAME=intfloat/multilingual-e5-small
ENV MODEL_NAME=${MODEL_NAME}

WORKDIR /app

RUN useradd --create-home appuser \
    && mkdir -p /cache \
    && chown -R appuser:appuser /cache

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the converted model from the converter stage
COPY --from=converter /onnx_output/model.onnx /cache/model.onnx

COPY app ./app

EXPOSE 8000

USER appuser

ENV WEB_CONCURRENCY=1

CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "app.main:app", "--bind", "0.0.0.0:8000", "--workers", "1", "--timeout", "120"]
