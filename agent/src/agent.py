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
import random  # For demo alerts

class SecurityAgent:
    def __init__(self, agent_id=None, name=None, api_url=None, user_id=None):
        self.agent_id = agent_id or str(uuid.uuid4())
        self.name = name or socket.gethostname()
        self.backend_url = api_url or os.getenv('BACKEND_URL', 'http://localhost:3000')
        self.status = 'running'
        self.user_id = user_id or os.getenv('USER_ID')  # Get userId from environment or parameter
        
        if not self.user_id:
            raise ValueError("user_id must be provided either through parameter or USER_ID environment variable")
        
        # Add alert thresholds
        self.thresholds = {
            'cpu': 80,
            'memory': 90,
            'disk': 85
        }

    def get_system_info(self):
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Get all IP addresses
        hostname = socket.gethostname()
        ip_addresses = []
        try:
            # Get all network interfaces
            for interface, addrs in psutil.net_if_addrs().items():
                for addr in addrs:
                    # Only get IPv4 addresses
                    if addr.family == socket.AF_INET:
                        ip_addresses.append({
                            'interface': interface,
                            'address': addr.address
                        })
        except Exception as e:
            print(f"Error getting IP addresses: {e}")
            ip_addresses = []
        
        return {
            'hostname': hostname,
            'os': platform.system() + ' ' + platform.release(),
            'cpu_usage': cpu_percent,
            'memory_total': memory.total,
            'memory_used': memory.used,
            'memory_percent': memory.percent,
            'disk_total': disk.total,
            'disk_used': disk.used,
            'disk_percent': disk.percent,
            'ip_addresses': ip_addresses
        }

    def register(self):
        """Register agent with backend."""
        try:
            payload = {
                'name': self.name
            }
            response = requests.post(
                f'{self.backend_url}/api/agents/deploy',
                json=payload,
                params={'userId': self.user_id},
                headers={'Content-Type': 'application/json'}
            )
            print(f"Attempting to register agent at: {response.url}")
            print(f"Request payload: {payload}")
            print(f"Response status: {response.status_code}")
            print(f"Response body: {response.text}")
            
            if response.ok:
                data = response.json()
                self.agent_id = data.get('agentId')
                print(f"Agent registered successfully with ID: {self.agent_id}")
                return True
            return False
        except requests.exceptions.RequestException as e:
            print(f"Failed to register agent: {e}")
            return False

    def update_status(self):
        """Update agent status in backend."""
        try:
            status_data = {
                'status': self.status,
                'systemInfo': self.get_system_info(),
                'lastActive': datetime.utcnow().isoformat()
            }
            
            response = requests.post(
                f'{self.backend_url}/api/agents/{self.agent_id}/status',
                json=status_data,
                params={'userId': self.user_id},
                headers={'Content-Type': 'application/json'}
            )
            response.raise_for_status()
            print(f"Status updated successfully: {self.status}")
        except requests.exceptions.RequestException as e:
            print(f"Failed to update status: {e}")

    def check_status(self):
        """Check agent status from backend."""
        try:
            response = requests.get(
                f'{self.backend_url}/api/agents/{self.agent_id}/status',
                params={'userId': self.user_id},
                headers={'Content-Type': 'application/json'}
            )
            response.raise_for_status()
            status_data = response.json()
            return status_data.get('status', 'unknown')
        except requests.exceptions.RequestException as e:
            print(f"Failed to check status: {e}")
            return 'unknown'

    def generate_alert(self, alert_type, severity, message, data=None):
        alert = {
            'title': f"{alert_type.title()} Alert: {message[:50]}",  # First 50 chars as title
            'description': message,
            'severity': self._map_severity(severity),  # Map to allowed values
            'source': self.name,
            'sourceIp': socket.gethostname(),
            'timestamp': datetime.utcnow().isoformat(),
            'tags': [alert_type, severity],
            'affectedAssets': [self.name],
            'status': 'new'
        }
        
        try:
            response = requests.post(
                f'{self.backend_url}/api/alerts',
                json=alert,
                params={'userId': self.user_id},
                headers={'Content-Type': 'application/json'}
            )
            response.raise_for_status()
            print(f"Alert sent: {message}")
        except requests.exceptions.RequestException as e:
            print(f"Failed to send alert: {e}")

    def _map_severity(self, severity):
        # Map agent severity levels to backend severity levels
        severity_map = {
            'critical': 'critical',
            'warning': 'warning',
            'info': 'info',
            # Add any other mappings needed
        }
        return severity_map.get(severity.lower(), 'info')  # Default to info if unknown severity

    def run(self):
        """Main agent loop."""
        print("Starting security monitoring agent...")
        
        # Register with backend
        if not self.register():
            print("Failed to register agent. Exiting.")
            return

        while True:
            try:
                # Update system status
                self.update_status()
                
                # Check our status from backend
                backend_status = self.check_status()
                if backend_status == 'stopped':
                    print("Agent has been stopped by backend. Exiting.")
                    break
                
                # Get current system info
                system_info = self.get_system_info()
                
                # Check CPU usage
                if system_info['cpu_usage'] > self.thresholds['cpu']:
                    self.generate_alert(
                        'system',
                        'warning',
                        f"High CPU usage: {system_info['cpu_usage']}%"
                    )
                
                # Check memory usage
                if system_info['memory_percent'] > self.thresholds['memory']:
                    self.generate_alert(
                        'system',
                        'warning',
                        f"High memory usage: {system_info['memory_percent']}%"
                    )
                
                # Check disk usage
                if system_info['disk_percent'] > self.thresholds['disk']:
                    self.generate_alert(
                        'system',
                        'warning',
                        f"High disk usage: {system_info['disk_percent']}%"
                    )
                
                # Sleep for a bit
                time.sleep(60)
                
            except KeyboardInterrupt:
                print("\nStopping agent...")
                self.status = 'stopped'
                self.update_status()
                break
            except Exception as e:
                print(f"Error in agent loop: {e}")
                time.sleep(5)  # Wait a bit before retrying

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Security Monitoring Agent')
    parser.add_argument('-u', '--user-id', help='User ID for authentication')
    args = parser.parse_args()
    
    agent = SecurityAgent(user_id=args.user_id)
    agent.run() 