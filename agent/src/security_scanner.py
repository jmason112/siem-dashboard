import subprocess
import json
import platform
import socket
import os
import requests
from datetime import datetime
import wmi
from dotenv import load_dotenv
import jwt

# Load environment variables
load_dotenv()

class SecurityScanner:
    def __init__(self, api_url: str = None):
        self.api_url = api_url or os.getenv('API_URL', 'http://localhost:3000')
        self.agent_id = os.getenv('AGENT_ID', 'windows-agent-1')
        self.agent_secret = os.getenv('AGENT_SECRET', 'default-secret')
        self.wmi = wmi.WMI()
        
    def get_auth_token(self) -> str:
        """Generate JWT token for API authentication."""
        return jwt.encode(
            {
                'agent_id': self.agent_id,
                'timestamp': datetime.now().isoformat(),
                'type': 'agent'
            },
            self.agent_secret,
            algorithm='HS256'
        )
        
    def scan_system(self) -> dict:
        """Perform a comprehensive system scan"""
        vulnerabilities = []
        hostname = socket.gethostname()
        scan_time = datetime.now().isoformat()
        
        # Check Windows Defender status
        try:
            defender_status = subprocess.run(
                ["powershell", "Get-MpComputerStatus"],
                capture_output=True,
                text=True
            )
            if "RealTimeProtectionEnabled : False" in defender_status.stdout:
                vulnerabilities.append({
                    "title": "Windows Defender Disabled",
                    "description": "Real-time protection is disabled in Windows Defender",
                    "severity": "critical",
                    "cvss_score": 9.0,
                    "status": "open",
                    "asset_id": hostname,
                    "asset_type": "windows_host",
                    "detection_time": scan_time,
                    "last_seen": scan_time,
                    "remediation": "Enable Windows Defender real-time protection",
                    "references": [],
                    "scan_source": "windows_security_scan",
                    "affected_component": "Windows Defender",
                    "affected_versions": ["current"],
                    "tags": ["antivirus", "windows_defender"]
                })
        except Exception as e:
            print(f"Error checking Windows Defender: {e}")

        # Check Windows Firewall
        try:
            firewall_status = subprocess.run(
                ["powershell", "Get-NetFirewallProfile"],
                capture_output=True,
                text=True
            )
            if "Enabled : False" in firewall_status.stdout:
                vulnerabilities.append({
                    "title": "Windows Firewall Disabled",
                    "description": "Windows Firewall is disabled on one or more profiles",
                    "severity": "high",
                    "cvss_score": 8.0,
                    "status": "open",
                    "asset_id": hostname,
                    "asset_type": "windows_host",
                    "detection_time": scan_time,
                    "last_seen": scan_time,
                    "remediation": "Enable Windows Firewall for all profiles",
                    "references": [],
                    "scan_source": "windows_security_scan",
                    "affected_component": "Windows Firewall",
                    "affected_versions": ["current"],
                    "tags": ["firewall", "network_security"]
                })
        except Exception as e:
            print(f"Error checking firewall: {e}")

        # Check Windows Update status
        try:
            update_status = subprocess.run(
                ["powershell", "Get-WindowsUpdateLog"],
                capture_output=True,
                text=True
            )
            if "Failed" in update_status.stdout or "Error" in update_status.stdout:
                vulnerabilities.append({
                    "title": "Windows Update Issues",
                    "description": "Windows Update service is not functioning properly",
                    "severity": "high",
                    "cvss_score": 7.5,
                    "status": "open",
                    "asset_id": hostname,
                    "asset_type": "windows_host",
                    "detection_time": scan_time,
                    "last_seen": scan_time,
                    "remediation": "Check Windows Update service and ensure it is running",
                    "references": [],
                    "scan_source": "windows_security_scan",
                    "affected_component": "Windows Update",
                    "affected_versions": ["current"],
                    "tags": ["windows_update", "patching"]
                })
        except Exception as e:
            print(f"Error checking Windows Update: {e}")

        # Check installed software
        try:
            for product in self.wmi.Win32_Product():
                # Check if software is outdated (example criteria)
                if product.InstallDate:
                    install_date = datetime.strptime(product.InstallDate, "%Y%m%d")
                    if (datetime.now() - install_date).days > 365:  # Older than 1 year
                        vulnerabilities.append({
                            "title": f"Outdated Software: {product.Name}",
                            "description": f"Software version {product.Version} is over 1 year old",
                            "severity": "medium",
                            "cvss_score": 5.0,
                            "status": "open",
                            "asset_id": hostname,
                            "asset_type": "windows_host",
                            "detection_time": scan_time,
                            "last_seen": scan_time,
                            "remediation": f"Update {product.Name} to the latest version",
                            "references": [],
                            "scan_source": "software_audit",
                            "affected_component": product.Name,
                            "affected_versions": [product.Version],
                            "tags": ["outdated_software", "version_control"]
                        })
        except Exception as e:
            print(f"Error checking installed software: {e}")

        # Check running services
        try:
            services = subprocess.run(
                ["powershell", "Get-Service | Where-Object {$_.StartType -eq 'Automatic' -and $_.Status -eq 'Stopped'}"],
                capture_output=True,
                text=True
            )
            if services.stdout.strip():
                vulnerabilities.append({
                    "title": "Critical Services Not Running",
                    "description": "One or more automatic services are not running",
                    "severity": "medium",
                    "cvss_score": 6.0,
                    "status": "open",
                    "asset_id": hostname,
                    "asset_type": "windows_host",
                    "detection_time": scan_time,
                    "last_seen": scan_time,
                    "remediation": "Review and start required services",
                    "references": [],
                    "scan_source": "service_audit",
                    "affected_component": "Windows Services",
                    "affected_versions": ["current"],
                    "tags": ["services", "availability"]
                })
        except Exception as e:
            print(f"Error checking services: {e}")

        return {"vulnerabilities": vulnerabilities}

    def send_results(self, results: dict):
        """Send scan results to the API"""
        try:
            response = requests.post(
                f"{self.api_url}/api/security/agent/vulnerability-scan",
                json=results,
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {self.get_auth_token()}'
                }
            )
            response.raise_for_status()
            print("Successfully sent scan results to API")
        except Exception as e:
            print(f"Error sending results to API: {e}")

if __name__ == "__main__":
    try:
        scanner = SecurityScanner()
        results = scanner.scan_system()
        scanner.send_results(results)
        print(f"Found {len(results['vulnerabilities'])} vulnerabilities")
    except Exception as e:
        print(f"Error: {e}")
        exit(1) 