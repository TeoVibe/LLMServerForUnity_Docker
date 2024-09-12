# Use the NVIDIA CUDA base image with Ubuntu 22.04 and CUDA 12.2.0
FROM nvidia/cuda:12.2.0-base-ubuntu22.04

# Set the working directory inside the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install necessary dependencies
RUN apt-get update && apt-get install -y \
    libstdc++6 \
    libgomp1 \
    net-tools \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Expose the port the server will listen on
EXPOSE 1337


