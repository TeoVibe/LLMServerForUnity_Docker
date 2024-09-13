FROM nvidia/cuda:12.2.0-base-ubuntu22.04

WORKDIR /app

COPY . /app

RUN apt-get update && apt-get install -y \
    libstdc++6 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*