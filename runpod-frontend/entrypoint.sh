#!/bin/bash
set -e

mkdir -p /run/sshd

cd /app/backend
uvicorn main:app --host 0.0.0.0 --port 8000 &

cd /app/frontend
npm run preview -- --host 0.0.0.0 --port 3000 &

if [ "$#" -eq 0 ]; then
    exec /usr/sbin/sshd -D
else
    exec "$@"
fi
