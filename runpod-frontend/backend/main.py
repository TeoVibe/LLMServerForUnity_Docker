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
log_file = "/app/server_logs.txt"

# -----------------------
# Server Endpoints
# -----------------------
@app.post("/start-server/")
async def start_server(request: Request):
    global server_process

    params = await request.json()
    custom_params = params.get("custom_params", "").strip()

    if server_process and server_process.poll() is None:
        raise HTTPException(status_code=400, detail="Server is already running.")

    # Clear logs before starting the server
    with open(log_file, "w") as log:
        log.write("")  

    binary_path = "/app/server/linux-cuda-cu12.2.0/undreamai_server"

    if not os.path.exists(binary_path):
        raise HTTPException(status_code=500, detail="undreamai_server binary not found")

    model_path = f"/models/{params.get('model', 'model')}"

    command = [
        binary_path,
        "-m", model_path,
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

@app.post("/stop-server/")
async def stop_server():
    global server_process

    if not server_process or server_process.poll() is not None:
        raise HTTPException(status_code=400, detail="Server is not currently running.")

    try:
        server_process.terminate()
        server_process.wait()  # Wait for the process to exit
        server_process = None

        # Clear logs when the server is stopped
        with open(log_file, "w") as log:
            log.write("")

        return {"status": "Server stopped successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to stop server: {e}")

# -----------------------
# Model Download Endpoint
# -----------------------
@app.post("/download-model/")
async def download_model(data: dict):
    model_url = data.get("url")
    filename = data.get("filename", "model")  # Use custom filename if provided

    if not model_url:
        raise HTTPException(status_code=400, detail="Model URL is required.")

    # Save model with dynamic name
    model_path = f"/models/{filename}.gguf"
    response = requests.get(model_url)

    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to download model.")

    with open(model_path, 'wb') as file:
        file.write(response.content)
    
    return {"status": f"Model downloaded successfully as {filename}.gguf"}

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
        with open(log_file, "r") as log_file_data:
            return log_file_data.read()
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Log file not found")
