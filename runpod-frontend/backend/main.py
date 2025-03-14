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
    allow_origins=["*"],  # Or specify domains like ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],  # This ensures OPTIONS requests are handled
    allow_headers=["*"]
)

server_process = None

# Start Server Endpoint
@app.post("/start-server/")
async def start_server(params: dict):
    global server_process
    if server_process and server_process.poll() is None:
        raise HTTPException(status_code=400, detail="Server is already running.")

    command = [
        "/app/undreamai_server",
        "-m", params.get("model", "model"),
        "--host", params.get("host", "0.0.0.0"),
        "--port", str(params.get("port", 1337)),
        "-ngl", str(params.get("ngl", 30)),
        "--template", params.get("template", "chatml")
    ]

    # Use cwd to ensure the working directory is /app/
    server_process = subprocess.Popen(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd="/app"  # Ensures the working directory is correct
    )

    return {"status": "Server started successfully"}

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
