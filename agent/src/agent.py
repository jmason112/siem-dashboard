import os
import time
import json
import uuid
import requests
import argparse
from datetime import datetime
import platform
import psutil
import socket

class SecurityAgent:
    def __init__(self, agent_id=None, name=None, api_url=None):
        self.agent_id = agent_id or str(uuid.uuid4())
        self.name = name or socket.gethostname()
        self.backend_url = api_url or os.getenv('BACKEND_URL', 'http://localhost:3000')
        self.status = 'running'

    def get_system_info(self):
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        return {
            'hostname': socket.gethostname(),
            'os': platform.system() + ' ' + platform.release(),
            'cpu_usage': cpu_percent,
            'memory_total': memory.total,
            'memory_used': memory.used,
            'memory_percent': memory.percent,
            'disk_total': disk.total,
            'disk_used': disk.used,
            'disk_percent': disk.percent
        }

    def register_agent(self):
        try:
            print(f"Attempting to register agent at: {self.backend_url}/api/agents/deploy")
            print(f"Request payload: {{'name': {self.name}}}")
            
            response = requests.post(
                f'{self.backend_url}/api/agents/deploy',
                json={
                    'name': self.name,
                },
                headers={
                    'Content-Type': 'application/json'
                }
            )
            
            print(f"Response status: {response.status_code}")
            print(f"Response body: {response.text}")
            
            response.raise_for_status()
            data = response.json()
            self.agent_id = data.get('id')
            print(f"Agent registered successfully with ID: {self.agent_id}")
        except requests.exceptions.RequestException as e:
            print(f"Failed to register agent: {e}")
            print(f"Response details: {getattr(e.response, 'text', 'No response text')}")
            raise

    def update_status(self):
        try:
            requests.post(
                f'{self.backend_url}/api/agents/{self.agent_id}/heartbeat',
                json={
                    'status': self.status,
                    'systemInfo': self.get_system_info(),
                    'lastActive': datetime.utcnow().isoformat()
                }
            )
        except requests.exceptions.RequestException as e:
            print(f"Failed to update status: {e}")

    def run(self):
        print("Starting security monitoring agent...")
        self.register_agent()

        while self.status == 'running':
            try:
                self.update_status()
                # Check if we should stop
                response = requests.get(f'{self.backend_url}/api/agents/status/{self.agent_id}')
                print(f"Status response: {response.text}")  # Debug line
                
                status_data = response.json()
                if isinstance(status_data, dict) and status_data.get('status') == 'stopped':
                    self.status = 'stopped'
                    print("Received stop signal, shutting down...")
                    break
                
                time.sleep(5)
            except Exception as e:
                print(f"Error in agent loop: {e}")
                print(f"Response content: {getattr(response, 'text', 'No response content')}")
                time.sleep(5)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Security Monitoring Agent')
    parser.add_argument('-i', '--id', help='Agent ID')
    parser.add_argument('-n', '--name', help='Agent Name')
    parser.add_argument('-a', '--api', help='API URL')
    parser.add_argument('-t', '--interval', type=int, default=5, help='Update interval in seconds')
    
    args = parser.parse_args()
    
    agent = SecurityAgent(
        agent_id=args.id,
        name=args.name,
        api_url=args.api
    )
    
    try:
        agent.run()
    except KeyboardInterrupt:
        print("\nShutting down agent...")
        agent.status = 'stopped'
        agent.update_status() 