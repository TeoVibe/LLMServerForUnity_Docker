#!/bin/bash
set -e

mkdir -p /run/sshd

if [ -z "$(ls -A /models)" ]; then
    if [ -z "$MODEL_URL" ]; then
        echo "MODEL_URL is not set. Skipping download."
    else
        echo "/models directory is empty. Downloading model from $MODEL_URL..."
        wget -O /models/model "$MODEL_URL"
    fi
else
    echo "/models directory is not empty. Skipping download."
fi

if [ "$#" -eq 0 ]; then
    exec /usr/sbin/sshd -D
else
    exec "$@"
fi
