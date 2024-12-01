import os
import time
import psutil
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

API_URL = os.getenv('API_URL', 'http://localhost:3000')
AGENT_SECRET = os.getenv('AGENT_SECRET', 'default-secret')

def send_alert(alert_data):
    try:
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {AGENT_SECRET}'
        }
        response = requests.post(f'{API_URL}/api/agent/alert', json=alert_data, headers=headers)
        response.raise_for_status()
        print(f"Alert sent successfully: {alert_data['title']}")
    except Exception as e:
        print(f"Error sending alert: {e}")

def monitor_system():
    while True:
        try:
            # CPU Usage Check
            cpu_percent = psutil.cpu_percent(interval=1)
            if cpu_percent > 80:
                send_alert({
                    'title': 'High CPU Usage',
                    'description': f'CPU usage is at {cpu_percent}%',
                    'severity': 'critical',
                    'source': 'System Monitor',
                    'sourceIp': '127.0.0.1',
                    'tags': ['performance', 'cpu'],
                    'affectedAssets': ['system']
                })

            # Memory Usage Check
            memory = psutil.virtual_memory()
            if memory.percent > 80:
                send_alert({
                    'title': 'High Memory Usage',
                    'description': f'Memory usage is at {memory.percent}%',
                    'severity': 'warning',
                    'source': 'System Monitor',
                    'sourceIp': '127.0.0.1',
                    'tags': ['performance', 'memory'],
                    'affectedAssets': ['system']
                })

            # Disk Usage Check
            disk = psutil.disk_usage('/')
            if disk.percent > 80:
                send_alert({
                    'title': 'High Disk Usage',
                    'description': f'Disk usage is at {disk.percent}%',
                    'severity': 'warning',
                    'source': 'System Monitor',
                    'sourceIp': '127.0.0.1',
                    'tags': ['storage', 'disk'],
                    'affectedAssets': ['system']
                })

            time.sleep(60)  # Check every minute
        except Exception as e:
            print(f"Error monitoring system: {e}")
            time.sleep(60)  # Wait before retrying

if __name__ == '__main__':
    print("System monitoring agent started...")
    monitor_system() 