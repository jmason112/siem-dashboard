import os
import sys
import time
import socket
import platform
import psutil
import requests
import argparse
import logging
from datetime import datetime
from src.security_scan import run_security_scan
from src.osquery_manager import OSQueryManager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_system_info():
    """Get current system information"""
    hostname = socket.gethostname()
    os_name = platform.system() + " " + platform.release()
    
    # Get CPU usage
    cpu_usage = psutil.cpu_percent(interval=1)
    
    # Get memory info
    memory = psutil.virtual_memory()
    memory_total = memory.total
    memory_used = memory.used
    memory_percent = memory.percent
    
    # Get disk info
    disk = psutil.disk_usage('/')
    disk_total = disk.total
    disk_used = disk.used
    disk_percent = disk.percent
    
    # Get network interfaces
    network_info = []
    for interface, addresses in psutil.net_if_addrs().items():
        for addr in addresses:
            if addr.family == socket.AF_INET:  # IPv4 addresses only
                network_info.append({
                    "interface": interface,
                    "address": addr.address
                })
    
    return {
        "hostname": hostname,
        "os": os_name,
        "cpu_usage": cpu_usage,
        "memory_total": memory_total,
        "memory_used": memory_used,
        "memory_percent": memory_percent,
        "disk_total": disk_total,
        "disk_used": disk_used,
        "disk_percent": disk_percent,
        "ip_addresses": network_info
    }

def register_agent(api_url, user_id):
    """Register the agent with the server"""
    hostname = socket.gethostname()
    registration_url = f"{api_url}/api/agents/deploy?userId={user_id}"
    
    payload = {
        "name": hostname
    }
    
    print(f"Attempting to register agent at: {registration_url}")
    print(f"Request payload: {payload}")
    
    try:
        response = requests.post(registration_url, json=payload)
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.text}")
        
        if response.status_code == 200:
            agent_data = response.json()
            agent_id = agent_data.get('agentId')
            # Use userId as token for now since we don't have token generation yet
            token = user_id
            print(f"Agent registered successfully with ID: {agent_id}")
            return agent_id, token
        else:
            print(f"Failed to register agent: {response.status_code} - {response.text}")
            return None, None
            
    except Exception as e:
        print(f"Error registering agent: {str(e)}")
        return None, None

def update_agent_status(api_url, agent_id, user_id, token, status="running", system_info=None):
    """Update agent status with the server"""
    if not agent_id:
        return False
        
    status_url = f"{api_url}/api/agents/{agent_id}/status"
    
    payload = {
        "status": status,
        "systemInfo": system_info or get_system_info(),
        "lastActive": datetime.utcnow().isoformat()
    }
    
    params = {
        "userId": user_id
    }
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.post(status_url, json=payload, params=params, headers=headers)
        if response.status_code == 200:
            return True
        else:
            print(f"Failed to update status: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"Error updating status: {str(e)}")
        return False

def send_osquery_data(api_url, agent_id, user_id, token, data):
    """Send OSQuery data to the server"""
    if not agent_id:
        return False
        
    osquery_url = f"{api_url}/api/agents/{agent_id}/osquery"
    
    params = {
        "userId": user_id
    }
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.post(osquery_url, json=data, params=params, headers=headers)
        if response.status_code == 200:
            return True
        else:
            print(f"Failed to send OSQuery data: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"Error sending OSQuery data: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Security Monitoring Agent')
    parser.add_argument('-u', '--user_id', required=True, help='User ID for agent registration')
    parser.add_argument('--api_url', default='http://localhost:3000', help='API URL')
    args = parser.parse_args()
    
    print("Starting security monitoring agent...")
    
    # Initialize OSQuery manager
    osquery = OSQueryManager()
    
    # Register agent
    agent_id, token = register_agent(args.api_url, args.user_id)
    if not agent_id:
        print("Failed to register agent. Exiting.")
        sys.exit(1)
    
    # Main monitoring loop
    try:
        while True:
            # Update agent status
            system_info = get_system_info()
            if not update_agent_status(args.api_url, agent_id, args.user_id, token, system_info=system_info):
                print("Failed to update agent status")
            
            # Collect and send OSQuery data
            osquery_data = osquery.collect_all_data()
            if not send_osquery_data(args.api_url, agent_id, args.user_id, token, osquery_data):
                print("Failed to send OSQuery data")
            
            # Run security scan
            scan_results = run_security_scan()
            
            # Send scan results
            if scan_results:
                try:
                    scan_url = f"{args.api_url}/api/security/agent/vulnerability-scan"
                    headers = {
                        "Authorization": f"Bearer {token}"
                    }
                    response = requests.post(
                        scan_url,
                        json=scan_results,
                        params={"userId": args.user_id},
                        headers=headers
                    )
                    if response.status_code != 200:
                        print(f"Failed to send scan results: {response.status_code} - {response.text}")
                except Exception as e:
                    print(f"Error sending scan results: {str(e)}")
            
            # Wait before next update
            time.sleep(60)  # Update every minute
            
    except KeyboardInterrupt:
        print("\nStopping agent...")
        update_agent_status(args.api_url, agent_id, args.user_id, token, status="stopped")
        sys.exit(0)

if __name__ == "__main__":
    main() 