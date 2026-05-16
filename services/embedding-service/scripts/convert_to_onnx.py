"""Helper to convert a Hugging Face / Sentence-Transformers model to ONNX.

This script attempts to use the transformers ONNX conversion tooling. Converting
requires PyTorch and the conversion tools; run this locally and upload the
generated `model.onnx` file as an external artifact, such as a GitHub Releases
asset, before building the Docker image.

Usage (example / recommended):

1. Create a Python venv with PyTorch and transformers installed:

   pip install torch sentence-transformers transformers onnx onnxruntime

2. Run this script:

    python services/embedding-service/scripts/convert_to_onnx.py --model intfloat/multilingual-e5-small --output model.onnx

Notes:
- Conversion commands and compatibility depend on the model architecture.
- If this script cannot perform an automated conversion on your platform,
  follow Hugging Face or sentence-transformers conversion guides to produce
  an ONNX file and upload it as your release asset.
"""

import argparse
import shutil
import subprocess
import sys
from pathlib import Path


def export_with_torch(model_id: str, output: Path) -> None:
    import torch
    from transformers import AutoModel, AutoTokenizer

    tokenizer = AutoTokenizer.from_pretrained(model_id, use_fast=True)
    model = AutoModel.from_pretrained(model_id)
    model.eval()

    sample = tokenizer(
        ["This is a sample text for ONNX export."],
        padding=True,
        truncation=True,
        max_length=128,
        return_tensors="pt",
    )

    output.parent.mkdir(parents=True, exist_ok=True)
    if output.exists():
        output.unlink()
    data_file = Path(str(output) + ".data")
    if data_file.exists():
        data_file.unlink()

    torch.onnx.export(
        model,
        (sample["input_ids"], sample["attention_mask"]),
        str(output),
        input_names=["input_ids", "attention_mask"],
        output_names=["last_hidden_state"],
        dynamic_axes={
            "input_ids": {0: "batch_size", 1: "sequence"},
            "attention_mask": {0: "batch_size", 1: "sequence"},
            "last_hidden_state": {0: "batch_size", 1: "sequence"},
        },
        opset_version=18,
        do_constant_folding=True,
        external_data=False,
    )
    if data_file.exists():
        data_file.unlink()
    print("Torch ONNX export complete; wrote:", output)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--model", required=True, help="Hugging Face model id")
    p.add_argument("--output", required=True, help="Path to write model.onnx")
    args = p.parse_args()

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)

    # Try using the transformers.onnx CLI if available
    cli = shutil.which("transformers-onnx") or shutil.which("transformers.onnx")
    if cli:
        print("Found transformers ONNX CLI; attempting conversion using it...")
        cmd = [sys.executable, "-m", "transformers.onnx", "--model", args.model, str(output)]
        subprocess.check_call(cmd)
        print("Conversion complete; wrote:", output)
        return

    print("transformers ONNX CLI not found; falling back to torch.onnx export.")
    export_with_torch(args.model, output)


if __name__ == "__main__":
    main()
