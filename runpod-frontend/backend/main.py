import threading
import time
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import psutil
import os
import requests

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

server_process = None

# -----------------------
# Start Server Endpoint
# -----------------------
@app.post("/start-server/")
async def start_server(request: Request):
    global server_process

    params = await request.json()
    custom_params = params.get("custom_params", "").strip()

    if server_process and server_process.poll() is None:
        raise HTTPException(status_code=400, detail="Server is already running.")

    log_file = "/app/server_logs.txt"
    binary_path = "/app/server/linux-cuda-cu12.2.0/undreamai_server"

    if not os.path.exists(binary_path):
        raise HTTPException(status_code=500, detail="undreamai_server binary not found")

    command = [
        binary_path,
        "-m", params.get("model", "model"),
        "--host", params.get("host", "0.0.0.0"),
        "--port", str(params.get("port", 1337)),
        "-ngl", str(params.get("ngl", 30)),
        "--template", params.get("template", "chatml")
    ]

    # Append custom params if provided
    if custom_params:
        command.extend(custom_params.split())

    print(f"➡️ Starting command: {' '.join(command)}")

    with open(log_file, "w") as log:
        server_process = subprocess.Popen(
            command,
            stdout=log,
            stderr=log,
            cwd="/app",
            preexec_fn=os.setpgrp
        )

    return {"status": "Server started successfully", "log_file": log_file}


# -----------------------
# Model Download Endpoint
# -----------------------
@app.post("/download-model/")
async def download_model(data: dict):
    model_url = data.get("url")
    if not model_url:
        raise HTTPException(status_code=400, detail="Model URL is required.")

    model_path = "/models/model"
    response = requests.get(model_url)
    
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to download model.")

    with open(model_path, 'wb') as file:
        file.write(response.content)
    
    return {"status": "Model downloaded successfully"}

# -----------------------
# Server Stats Endpoint
# -----------------------
@app.get("/stats/")
async def get_stats():
    global server_process
    return {
        "cpu": psutil.cpu_percent(),
        "ram": psutil.virtual_memory().percent,
        "gpu": 0,
        "server_running": server_process and server_process.poll() is None
    }

# -----------------------
# Log Viewing Endpoint
# -----------------------
@app.get("/logs/")
async def get_logs():
    try:
        with open("/app/server_logs.txt", "r") as log_file:
            return log_file.read()
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Log file not found")
