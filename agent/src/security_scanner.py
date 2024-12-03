import os
import json
import time
import requests
import subprocess
from datetime import datetime, timedelta
from typing import Dict, List, Any
from dotenv import load_dotenv
import jwt
import platform
import winreg

load_dotenv()

API_URL = os.getenv('API_URL', 'http://localhost:3000')
AGENT_SECRET = os.getenv('AGENT_SECRET', 'default-secret')
SCAN_INTERVAL = int(os.getenv('SCAN_INTERVAL', '3600'))

def get_auth_token() -> str:
    """Generate JWT token for API authentication."""
    return jwt.encode(
        {
            'agent_id': os.getenv('AGENT_ID', 'default'),
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

    # Check Firewall Status
    firewall_status = run_powershell_command("Get-NetFirewallProfile | Select-Object Name, Enabled")
    if "False" in firewall_status:
        vulnerabilities.append({
            'title': 'Windows Firewall Disabled',
            'description': 'One or more Windows Firewall profiles are disabled',
            'severity': 'critical',
            'cvss_score': 9.0,
            'affected_component': 'Windows Firewall',
            'affected_versions': [platform.version()],
            'remediation': 'Enable Windows Firewall for all profiles',
            'discovered_at': datetime.now().isoformat(),
            'status': 'open',
            'scan_source': 'windows',
            'asset_id': platform.node(),
            'asset_type': 'firewall',
            'tags': ['windows', 'firewall']
        })

    # Check Antivirus Status
    av_status = run_powershell_command("Get-MpComputerStatus | Select-Object AMRunningMode, AntivirusEnabled")
    if "False" in av_status or "Disabled" in av_status:
        vulnerabilities.append({
            'title': 'Windows Defender Issues',
            'description': 'Windows Defender is not properly configured or disabled',
            'severity': 'critical',
            'cvss_score': 9.5,
            'affected_component': 'Windows Defender',
            'affected_versions': [platform.version()],
            'remediation': 'Enable Windows Defender and ensure it is running properly',
            'discovered_at': datetime.now().isoformat(),
            'status': 'open',
            'scan_source': 'windows',
            'asset_id': platform.node(),
            'asset_type': 'antivirus',
            'tags': ['windows', 'antivirus']
        })

    # Check for Insecure Services
    services = run_powershell_command("Get-Service | Where-Object {$_.StartType -eq 'Automatic' -and $_.Status -eq 'Stopped'}")
    if services:
        vulnerabilities.append({
            'title': 'Critical Services Not Running',
            'description': f'Some critical Windows services are not running: {services}',
            'severity': 'medium',
            'cvss_score': 5.0,
            'affected_component': 'Windows Services',
            'affected_versions': [platform.version()],
            'remediation': 'Start the required services and configure them properly',
            'discovered_at': datetime.now().isoformat(),
            'status': 'open',
            'scan_source': 'windows',
            'asset_id': platform.node(),
            'asset_type': 'services',
            'tags': ['windows', 'services']
        })

    return vulnerabilities

def check_windows_compliance() -> List[Dict[str, Any]]:
    """Check Windows compliance settings."""
    controls = []
    
    # Password Policy Check
    try:
        password_policy = run_powershell_command("net accounts")
        min_length = 0
        if "Minimum password length" in password_policy:
            min_length = int(''.join(filter(str.isdigit, password_policy.split("Minimum password length")[1].split("\n")[0])))
        
        controls.append({
            'framework': 'ISO27001',
            'control_id': 'A.9.4.3',
            'control_name': 'Password Management',
            'description': 'Password minimum length check',
            'status': 'compliant' if min_length >= 8 else 'non_compliant',
            'evidence': f"Minimum password length: {min_length}",
            'last_checked': datetime.now().isoformat(),
            'next_check': (datetime.now() + timedelta(days=30)).isoformat(),
            'risk_level': 'high',
            'tags': ['windows', 'password']
        })
    except Exception as e:
        print(f"Error checking password policy: {e}")

    # BitLocker Status
    try:
        bitlocker_status = run_powershell_command("Get-BitLockerVolume | Select-Object -ExpandProperty ProtectionStatus")
        controls.append({
            'framework': 'ISO27001',
            'control_id': 'A.10.1.1',
            'control_name': 'Disk Encryption',
            'description': 'BitLocker encryption status',
            'status': 'compliant' if 'On' in bitlocker_status else 'non_compliant',
            'evidence': f"BitLocker status: {bitlocker_status}",
            'last_checked': datetime.now().isoformat(),
            'next_check': (datetime.now() + timedelta(days=7)).isoformat(),
            'risk_level': 'high',
            'tags': ['windows', 'encryption']
        })
    except Exception as e:
        print(f"Error checking BitLocker status: {e}")

    # Windows Defender Status
    try:
        defender_status = run_powershell_command("Get-MpComputerStatus | Select-Object -ExpandProperty AntivirusEnabled")
        controls.append({
            'framework': 'SOC2',
            'control_id': 'CC6.8',
            'control_name': 'Malware Protection',
            'description': 'Windows Defender status check',
            'status': 'compliant' if 'True' in defender_status else 'non_compliant',
            'evidence': f"Windows Defender enabled: {defender_status}",
            'last_checked': datetime.now().isoformat(),
            'next_check': (datetime.now() + timedelta(days=1)).isoformat(),
            'risk_level': 'high',
            'tags': ['windows', 'antivirus']
        })
    except Exception as e:
        print(f"Error checking Windows Defender: {e}")

    # Automatic Updates
    try:
        update_status = run_powershell_command("Get-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\WindowsUpdate\\Auto Update' -Name AUOptions")
        controls.append({
            'framework': 'SOC2',
            'control_id': 'CC7.1',
            'control_name': 'System Updates',
            'description': 'Windows Automatic Updates configuration',
            'status': 'compliant' if '4' in update_status else 'non_compliant',
            'evidence': f"Windows Update configuration: {update_status}",
            'last_checked': datetime.now().isoformat(),
            'next_check': (datetime.now() + timedelta(days=7)).isoformat(),
            'risk_level': 'medium',
            'tags': ['windows', 'updates']
        })
    except Exception as e:
        print(f"Error checking Windows Update configuration: {e}")

    return controls

def send_results(endpoint: str, data: Dict[str, Any]) -> None:
    """Send results to the API."""
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {get_auth_token()}'
    }
    
    try:
        if endpoint == 'vulnerabilities' and 'vulnerabilities' in data:
            response = requests.post(
                f'{API_URL}/api/security/agent/vulnerability-scan',
                json=data,
                headers=headers
            )
            response.raise_for_status()
            print("Successfully sent vulnerability scan results")
        elif endpoint == 'compliance' and 'compliance' in data:
            response = requests.post(
                f'{API_URL}/api/security/agent/compliance-check',
                json=data,
                headers=headers
            )
            response.raise_for_status()
            print("Successfully sent compliance check results")
        else:
            print(f"Unknown endpoint: {endpoint}")
    except Exception as e:
        print(f"Error sending {endpoint} results: {e}")

def main():
    """Main scanning function."""
    print("Starting security scanner...")
    
    while True:
        try:
            # Run vulnerability scans
            print("Starting vulnerability scans...")
            vulnerabilities = scan_windows_vulnerabilities()
            print(f"Found {len(vulnerabilities)} potential vulnerabilities")
            
            if vulnerabilities:
                send_results('vulnerabilities', {
                    'vulnerabilities': vulnerabilities
                })
            
            # Run compliance checks
            print("Starting compliance checks...")
            compliance_results = check_windows_compliance()
            print(f"Completed {len(compliance_results)} compliance checks")
            
            if compliance_results:
                send_results('compliance', {
                    'compliance': compliance_results
                })
            
        except Exception as e:
            print(f"Error during security scan: {e}")
        
        print(f"Waiting {SCAN_INTERVAL} seconds before next scan...")
        time.sleep(SCAN_INTERVAL)

if __name__ == '__main__':
    main() 