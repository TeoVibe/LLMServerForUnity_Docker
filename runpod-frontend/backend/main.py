import threading
import time
from fastapi import FastAPI, HTTPException
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

@app.post("/start-server/")
async def start_server(params: dict):
    global server_process

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

    print(f"➡️ Starting command: {' '.join(command)}")

    with open(log_file, "w") as log:
        try:
            server_process = subprocess.Popen(
                command,
                stdout=log,
                stderr=log,
                cwd="/app",
                preexec_fn=os.setpgrp  # Ensures process gets its own process group
            )

            # Introduce a background thread to handle zombie cleanup
            def reap_zombies():
                while True:
                    try:
                        pid, status = os.waitpid(-1, os.WNOHANG)
                        if pid == 0:
                            time.sleep(1)
                    except ChildProcessError:
                        break

            threading.Thread(target=reap_zombies, daemon=True).start()

        except Exception as e:
            print(f"❌ Error starting server: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    return {"status": "Server started successfully", "log_file": log_file}


# Model Download Endpoint
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

# Server Stats Endpoint
@app.get("/stats/")
async def get_stats():
    return {
        "cpu": psutil.cpu_percent(),
        "ram": psutil.virtual_memory().percent,
        "gpu": 0
    }