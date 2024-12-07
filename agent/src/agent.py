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
    def __init__(self, agent_id=None, name=None, api_url=None):
        self.agent_id = agent_id or str(uuid.uuid4())
        self.name = name or socket.gethostname()
        self.backend_url = api_url or os.getenv('BACKEND_URL', 'http://localhost:3000')
        self.status = 'running'
        
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
                f'{self.backend_url}/api/alerts',  # Changed endpoint to match existing routes
                json=alert,
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

    def check_system_health(self):
        system_info = self.get_system_info()
        
        # Check CPU usage
        if system_info['cpu_usage'] > self.thresholds['cpu']:
            self.generate_alert(
                'system',
                'critical',
                f"High CPU usage detected: {system_info['cpu_usage']}%",
                {'cpu_usage': system_info['cpu_usage']}
            )

        # Check memory usage
        if system_info['memory_percent'] > self.thresholds['memory']:
            self.generate_alert(
                'system',
                'warning',
                f"High memory usage detected: {system_info['memory_percent']}%",
                {'memory_usage': system_info['memory_percent']}
            )

        # Check disk usage
        if system_info['disk_percent'] > self.thresholds['disk']:
            self.generate_alert(
                'system',
                'warning',
                f"High disk usage detected: {system_info['disk_percent']}%",
                {'disk_usage': system_info['disk_percent']}
            )

        # Demo security alerts (random generation for testing)
        if random.random() < 0.05:  # 5% chance each check
            security_alerts = [
                {
                    'type': 'security',
                    'severity': 'critical',
                    'message': 'Suspicious login attempt detected',
                    'data': {'source_ip': '192.168.1.' + str(random.randint(2, 254))}
                },
                {
                    'type': 'security',
                    'severity': 'warning',
                    'message': 'Multiple failed authentication attempts',
                    'data': {'attempts': random.randint(5, 20)}
                },
                {
                    'type': 'security',
                    'severity': 'info',
                    'message': 'New user account created',
                    'data': {'username': 'user' + str(random.randint(1, 100))}
                }
            ]
            alert = random.choice(security_alerts)
            self.generate_alert(
                alert['type'],
                alert['severity'],
                alert['message'],
                alert['data']
            )

    def check_status(self):
        try:
            response = requests.get(f'{self.backend_url}/api/agents/status/{self.agent_id}')
            if response.ok:
                data = response.json()
                print(f"Status check response: {data}")  # Debug log
                current_status = data.get('status')
                if current_status != self.status:
                    print(f"Status changed from {self.status} to {current_status}")
                return current_status
            return None
        except Exception as e:
            print(f"Error checking status: {e}")
            return None

    def run(self):
        print("Starting security monitoring agent...")
        self.register_agent()

        while self.status == 'running':
            try:
                self.update_status()
                self.check_system_health()
                
                # Check if we should stop
                server_status = self.check_status()
                if server_status == 'stopped':
                    print("Received stop signal from server, shutting down...")
                    self.status = 'stopped'
                    # Send final status update
                    self.update_status()
                    break
                elif server_status == 'running':
                    # Only update our status if it's explicitly running
                    self.status = 'running'
                
                time.sleep(5)
            except Exception as e:
                print(f"Error in agent loop: {e}")
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