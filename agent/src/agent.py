import os
import json
import time
import psutil
import requests
import subprocess
import threading
import platform
import winreg
from datetime import datetime, timedelta
from typing import Dict, List, Any
from dotenv import load_dotenv
import jwt

load_dotenv()

# Configuration
API_URL = os.getenv('API_URL', 'http://localhost:3000')
AGENT_SECRET = os.getenv('AGENT_SECRET', 'default-secret')
AGENT_ID = os.getenv('AGENT_ID', 'default')
MONITORING_INTERVAL = int(os.getenv('MONITORING_INTERVAL', '60'))
SECURITY_SCAN_INTERVAL = int(os.getenv('SCAN_INTERVAL', '3600'))

# Thresholds
CPU_THRESHOLD = float(os.getenv('CPU_THRESHOLD', '80'))
MEMORY_THRESHOLD = float(os.getenv('MEMORY_THRESHOLD', '80'))
DISK_THRESHOLD = float(os.getenv('DISK_THRESHOLD', '90'))

def get_auth_token() -> str:
    """Generate JWT token for API authentication."""
    return jwt.encode(
        {
            'agent_id': AGENT_ID,
            'timestamp': datetime.now().isoformat(),
            'type': 'agent'
        },
        AGENT_SECRET,
        algorithm='HS256'
    )

def run_powershell_command(command: str) -> str:
    """Run PowerShell command and return output."""
    try:
        result = subprocess.run(
            ['powershell', '-Command', command],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error running PowerShell command: {e}")
        return ""

def send_alert(alert_data: Dict[str, Any]) -> None:
    """Send alert to the API."""
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {get_auth_token()}'
    }
    
    try:
        response = requests.post(
            f'{API_URL}/api/agent/alert',
            json=alert_data,
            headers=headers
        )
        response.raise_for_status()
        print(f"Alert sent: {alert_data['title']}")
    except Exception as e:
        print(f"Error sending alert: {e}")

def send_security_results(endpoint: str, data: Dict[str, Any]) -> None:
    """Send security scan results to the API."""
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {get_auth_token()}'
    }
    
    try:
        if endpoint == 'vulnerabilities':
            response = requests.post(
                f'{API_URL}/api/security/agent/vulnerability-scan',
                json=data,
                headers=headers
            )
            response.raise_for_status()
            print("Successfully sent vulnerability scan results")
        elif endpoint == 'compliance':
            response = requests.post(
                f'{API_URL}/api/security/agent/compliance-check',
                json=data,
                headers=headers
            )
            response.raise_for_status()
            print("Successfully sent compliance check results")
    except Exception as e:
        print(f"Error sending {endpoint} results: {e}")

def check_system_metrics() -> None:
    """Monitor system metrics and send alerts if thresholds are exceeded."""
    while True:
        try:
            # CPU Usage
            cpu_percent = psutil.cpu_percent(interval=1)
            if cpu_percent > CPU_THRESHOLD:
                send_alert({
                    'title': 'High CPU Usage',
                    'description': f'CPU usage is at {cpu_percent}%',
                    'severity': 'warning',
                    'source': 'system',
                    'metric': 'cpu',
                    'value': cpu_percent,
                    'threshold': CPU_THRESHOLD,
                    'timestamp': datetime.now().isoformat()
                })

            # Memory Usage
            memory = psutil.virtual_memory()
            if memory.percent > MEMORY_THRESHOLD:
                send_alert({
                    'title': 'High Memory Usage',
                    'description': f'Memory usage is at {memory.percent}%',
                    'severity': 'warning',
                    'source': 'system',
                    'metric': 'memory',
                    'value': memory.percent,
                    'threshold': MEMORY_THRESHOLD,
                    'timestamp': datetime.now().isoformat()
                })

            # Disk Usage
            for partition in psutil.disk_partitions():
                try:
                    usage = psutil.disk_usage(partition.mountpoint)
                    if usage.percent > DISK_THRESHOLD:
                        send_alert({
                            'title': 'High Disk Usage',
                            'description': f'Disk usage on {partition.mountpoint} is at {usage.percent}%',
                            'severity': 'warning',
                            'source': 'system',
                            'metric': 'disk',
                            'value': usage.percent,
                            'threshold': DISK_THRESHOLD,
                            'timestamp': datetime.now().isoformat()
                        })
                except Exception:
                    continue

        except Exception as e:
            print(f"Error checking system metrics: {e}")

        time.sleep(MONITORING_INTERVAL)

def scan_windows_vulnerabilities() -> List[Dict[str, Any]]:
    """Scan for Windows vulnerabilities."""
    vulnerabilities = []
    
    # Check Windows Update status
    update_status = run_powershell_command("Get-WindowsUpdateLog")
    if "Failed" in update_status or "Error" in update_status:
        vulnerabilities.append({
            'title': 'Windows Update Issues Detected',
            'description': 'Windows Update service is not functioning properly',
            'severity': 'high',
            'cvss_score': 7.5,
            'affected_component': 'Windows Update Service',
            'affected_versions': [platform.version()],
            'remediation': 'Check Windows Update service and ensure it is running',
            'discovered_at': datetime.now().isoformat(),
            'status': 'open',
            'scan_source': 'windows',
            'asset_id': platform.node(),
            'asset_type': 'os',
            'tags': ['windows', 'updates']
        })

    # Add other vulnerability checks from security_scanner.py...
    # (Previous vulnerability checks remain the same)

    return vulnerabilities

def check_windows_compliance() -> List[Dict[str, Any]]:
    """Check Windows compliance settings."""
    controls = []
    
    # Add compliance checks from security_scanner.py...
    # (Previous compliance checks remain the same)

    return controls

def run_security_scans() -> None:
    """Run security scans at regular intervals."""
    while True:
        try:
            # Run vulnerability scans
            print("Starting vulnerability scans...")
            vulnerabilities = scan_windows_vulnerabilities()
            print(f"Found {len(vulnerabilities)} potential vulnerabilities")
            
            if vulnerabilities:
                send_security_results('vulnerabilities', {
                    'vulnerabilities': vulnerabilities
                })
            
            # Run compliance checks
            print("Starting compliance checks...")
            compliance_results = check_windows_compliance()
            print(f"Completed {len(compliance_results)} compliance checks")
            
            if compliance_results:
                send_security_results('compliance', {
                    'compliance': compliance_results
                })

        except Exception as e:
            print(f"Error during security scan: {e}")
            send_alert({
                'title': 'Security Scan Error',
                'description': f'Error during security scan: {str(e)}',
                'severity': 'error',
                'source': 'security',
                'timestamp': datetime.now().isoformat()
            })

        time.sleep(SECURITY_SCAN_INTERVAL)

def main():
    """Main function to start the agent."""
    print(f"Starting unified agent (ID: {AGENT_ID})...")
    
    try:
        # Start monitoring in a separate thread
        monitoring_thread = threading.Thread(target=check_system_metrics, daemon=True)
        monitoring_thread.start()
        print("System monitoring started")

        # Start security scanning in a separate thread
        security_thread = threading.Thread(target=run_security_scans, daemon=True)
        security_thread.start()
        print("Security scanning started")

        # Keep the main thread alive
        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        print("\nShutting down agent...")
    except Exception as e:
        print(f"Error in main thread: {e}")
        send_alert({
            'title': 'Agent Error',
            'description': f'Critical error in agent: {str(e)}',
            'severity': 'critical',
            'source': 'agent',
            'timestamp': datetime.now().isoformat()
        })

if __name__ == '__main__':
    main() 