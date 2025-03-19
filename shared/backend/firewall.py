import subprocess
import logging

logger = logging.getLogger("firewall")

def setup_firewall_rules(control_panel_allowlist, llm_server_allowlist):
    """
    Setup firewall rules for the control panel (ports 3000, 8000) and LLM server (port 1337)
    """
    try:
        # Clear existing rules
        subprocess.run(["iptables", "-F"], check=True)
        
        # Default policies
        subprocess.run(["iptables", "-P", "INPUT", "DROP"], check=True)
        subprocess.run(["iptables", "-P", "FORWARD", "DROP"], check=True)
        subprocess.run(["iptables", "-P", "OUTPUT", "ACCEPT"], check=True)
        
        # Allow loopback
        subprocess.run(["iptables", "-A", "INPUT", "-i", "lo", "-j", "ACCEPT"], check=True)
        
        # Allow established connections
        subprocess.run(["iptables", "-A", "INPUT", "-m", "state", "--state", "ESTABLISHED,RELATED", "-j", "ACCEPT"], check=True)
        
        # Allow SSH from anywhere (port 22)
        subprocess.run(["iptables", "-A", "INPUT", "-p", "tcp", "--dport", "22", "-j", "ACCEPT"], check=True)
        
        # Process Control Panel allowlist (ports 3000 and 8000)
        process_allowlist(control_panel_allowlist, [3000, 8000])
        
        # Process LLM Server allowlist (port 1337)
        process_allowlist(llm_server_allowlist, [1337])
        
        logger.info("Firewall rules set up successfully")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Error setting up firewall rules: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error setting up firewall rules: {e}")
        return False

def process_allowlist(allowlist, ports):
    """
    Process an allowlist string and apply firewall rules for the specified ports
    """
    # If allowlist is 0.0.0.0, allow from any IP
    if allowlist == "0.0.0.0":
        for port in ports:
            subprocess.run([
                "iptables", "-A", "INPUT", "-p", "tcp", "--dport", str(port), "-j", "ACCEPT"
            ], check=True)
        return
    
    # For specific IPs
    for ip in allowlist.split(","):
        ip = ip.strip()
        for port in ports:
            subprocess.run([
                "iptables", "-A", "INPUT", "-p", "tcp", "-s", ip, "--dport", str(port), "-j", "ACCEPT"
            ], check=True)

def get_current_rules():
    """Get current iptables rules for debugging"""
    try:
        result = subprocess.run(["iptables", "-L", "-n"], capture_output=True, text=True, check=True)
        return result.stdout
    except Exception as e:
        logger.error(f"Error getting firewall rules: {e}")
        return f"Error: {str(e)}"