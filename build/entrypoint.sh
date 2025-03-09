#!/bin/bash
set -e

mkdir -p /run/sshd

if [ ! -f /models/model ]; then
    if [ -z "$MODEL_URL" ]; then
        echo "MODEL_URL is not set. Skipping download."
    else
        echo "File not found, downloading from $MODEL_URL..."
        wget -O /models/model "$MODEL_URL"
    fi
else
    echo "File already exists, skipping download."
fi

exec /usr/sbin/sshd -D
