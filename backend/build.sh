#!/usr/bin/env bash
# Render build script
set -e
pip install -r requirements.txt
python -m spacy download en_core_web_sm
echo "Build complete"
