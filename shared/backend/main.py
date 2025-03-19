import threading
import time
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import psutil
import os
import requests
import logging
import sys
from pathlib import Path

# Add the current directory to the path so we can import firewall
current_dir = Path(__file__).parent
sys.path.append(str(current_dir))
import firewall

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn")

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Request: {request.method} {request.url.path}")
    try:
        response = await call_next(request)
        logger.info(f"Response: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Error processing request: {e}")
        raise

server_process = None
log_file = "/app/server_logs.txt"

# Initialize allowlists from environment variables or default to "0.0.0.0"
control_panel_allowlist = os.environ.get("CONTROL_PANEL_ALLOWLIST", "0.0.0.0")
llm_server_allowlist = os.environ.get("LLM_SERVER_ALLOWLIST", "0.0.0.0")

# Initialize firewall on startup
try:
    logger.info("Setting up initial firewall rules...")
    logger.info(f"Control Panel Allowlist: {control_panel_allowlist}")
    logger.info(f"LLM Server Allowlist: {llm_server_allowlist}")
    firewall.setup_firewall_rules(control_panel_allowlist, llm_server_allowlist)
except Exception as e:
    logger.error(f"Failed to initialize firewall: {e}")

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
    
    # Get GPU usage using nvidia-smi
    try:
        gpu_usage = 0
        
        # First check if nvidia-smi is available
        nvidia_smi_exists = subprocess.run(
            ["which", "nvidia-smi"], 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE
        ).returncode == 0
        
        if nvidia_smi_exists:
            # Get GPU utilization - this works with multiple GPUs
            nvidia_smi_output = subprocess.check_output(
                ["nvidia-smi", "--query-gpu=utilization.gpu", "--format=csv,noheader,nounits"],
                text=True, 
                stderr=subprocess.PIPE
            ).strip()
            
            # Parse the output - if multiple GPUs, take the max utilization
            if nvidia_smi_output:
                gpu_values = [float(x.strip()) for x in nvidia_smi_output.split('\n') if x.strip()]
                if gpu_values:
                    gpu_usage = int(max(gpu_values))  # Use the highest GPU usage if multiple GPUs
    except (subprocess.SubprocessError, ValueError, FileNotFoundError, PermissionError) as e:
        print(f"Error getting GPU stats: {e}")
        gpu_usage = 0
    
    return {
        "cpu": psutil.cpu_percent(),
        "ram": psutil.virtual_memory().percent,
        "gpu": gpu_usage,
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

# -----------------------
# List Models
# -----------------------
@app.get("/list-models/")
async def list_models():
    models_dir = "/models"
    if not os.path.isdir(models_dir):
        raise HTTPException(status_code=404, detail="Models directory not found")
    models = os.listdir(models_dir)  # List all files without filtering
    return {"models": models}

# -----------------------
# Allowlist Endpoints
# -----------------------
@app.get("/allowlist/")
async def get_allowlist():
    return {
        "control_panel_allowlist": control_panel_allowlist,
        "llm_server_allowlist": llm_server_allowlist
    }

@app.get("/firewall-rules/")
async def get_firewall_rules():
    """Get the current firewall rules"""
    rules = firewall.get_current_rules()
    return {
        "rules": rules,
        "control_panel_allowlist": control_panel_allowlist,
        "llm_server_allowlist": llm_server_allowlist
    }

def validate_ip_list(ip_list: str):
    """Validate a comma-separated list of IPs"""
    try:
        ips = ip_list.split(",")
        for ip in ips:
            ip = ip.strip()
            octets = ip.split(".")
            if len(octets) != 4:
                raise ValueError("Invalid IP format")
            for octet in octets:
                value = int(octet)
                if value < 0 or value > 255:
                    raise ValueError("Invalid IP value")
        return True
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid IP format: {str(e)}")

@app.post("/update-allowlist/")
async def update_allowlist(data: dict):
    global control_panel_allowlist, llm_server_allowlist
    
    # Update control panel allowlist if provided
    if "control_panel_allowlist" in data:
        new_control_panel_allowlist = data.get("control_panel_allowlist")
        if new_control_panel_allowlist:
            validate_ip_list(new_control_panel_allowlist)
            control_panel_allowlist = new_control_panel_allowlist
            logger.info(f"Updated control panel allowlist: {control_panel_allowlist}")
    
    # Update LLM server allowlist if provided
    if "llm_server_allowlist" in data:
        new_llm_server_allowlist = data.get("llm_server_allowlist")
        if new_llm_server_allowlist:
            validate_ip_list(new_llm_server_allowlist)
            llm_server_allowlist = new_llm_server_allowlist
            logger.info(f"Updated LLM server allowlist: {llm_server_allowlist}")
    
    # For backward compatibility
    if "allowlist" in data:
        new_allowlist = data.get("allowlist")
        if new_allowlist:
            validate_ip_list(new_allowlist)
            # Update both allowlists for backward compatibility
            control_panel_allowlist = new_allowlist
            llm_server_allowlist = new_allowlist
            logger.info(f"Updated both allowlists via legacy endpoint: {new_allowlist}")
    
    # Apply firewall rules with updated allowlists
    success = firewall.setup_firewall_rules(control_panel_allowlist, llm_server_allowlist)
    if not success:
        logger.error("Failed to apply firewall rules")
        return {
            "status": "Allowlist updated but firewall rules failed to apply", 
            "control_panel_allowlist": control_panel_allowlist,
            "llm_server_allowlist": llm_server_allowlist,
            "firewall_rules_applied": False
        }
    
    return {
        "status": "Allowlist updated successfully and firewall rules applied", 
        "control_panel_allowlist": control_panel_allowlist,
        "llm_server_allowlist": llm_server_allowlist,
        "firewall_rules_applied": True
    }
