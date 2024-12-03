import os
import json
import time
import nmap
import requests
import subprocess
from datetime import datetime, timedelta
from typing import Dict, List, Any
from dotenv import load_dotenv
import jwt
from importlib.metadata import distributions

load_dotenv()

API_URL = os.getenv('API_URL', 'http://localhost:3000')
AGENT_SECRET = os.getenv('AGENT_SECRET', 'default-secret')
SCAN_INTERVAL = int(os.getenv('SCAN_INTERVAL', '3600'))  # Default 1 hour

def get_auth_token() -> str:
    """Generate JWT token for API authentication."""
    return jwt.encode(
        {
            'agent_id': os.getenv('AGENT_ID', 'default'),
            'timestamp': datetime.now().isoformat()
        },
        AGENT_SECRET,
        algorithm='HS256'
    )

def run_nmap_scan(target: str) -> List[Dict[str, Any]]:
    """Run Nmap scan and return vulnerabilities."""
    try:
        nm = nmap.PortScanner()
        nm.scan(target, arguments='-sV -sC --script vuln')
        
        vulnerabilities = []
        
        for host in nm.all_hosts():
            for proto in nm[host].all_protocols():
                ports = nm[host][proto].keys()
                for port in ports:
                    port_info = nm[host][proto][port]
                    if 'script' in port_info:
                        for script_name, script_output in port_info['script'].items():
                            if 'VULNERABLE' in script_output:
                                vulnerabilities.append({
                                    'title': f"{script_name} vulnerability in {port_info['name']}",
                                    'description': script_output,
                                    'severity': 'high',  # Default to high for detected vulnerabilities
                                    'cvss_score': 7.5,  # Default CVSS score for detected vulnerabilities
                                    'affected_component': f"{port_info['name']} {port_info.get('version', '')}",
                                    'affected_versions': [port_info.get('version', 'unknown')],
                                    'remediation': 'Update the affected service to the latest version',
                                    'discovered_at': datetime.now().isoformat(),
                                    'status': 'open',
                                    'scan_source': 'nmap',
                                    'asset_id': host,
                                    'asset_type': 'host',
                                    'tags': ['network', 'port-scan']
                                })
        
        return vulnerabilities
    except Exception as e:
        print(f"Error during nmap scan: {e}")
        return []

def check_windows_security() -> List[Dict[str, Any]]:
    """Check Windows security settings."""
    controls = []
    
    # Check Windows Defender status using PowerShell
    try:
        defender_status = subprocess.check_output(
            ['powershell', 'Get-MpComputerStatus | Select-Object -ExpandProperty AntivirusEnabled'],
            text=True
        ).strip()
        
        controls.append({
            'framework': 'ISO27001',
            'control_id': 'A.12.2.1',
            'control_name': 'Antivirus Protection',
            'description': 'Windows Defender status check',
            'status': 'compliant' if defender_status.lower() == 'true' else 'non_compliant',
            'evidence': f"Windows Defender enabled: {defender_status}",
            'last_checked': datetime.now().isoformat(),
            'next_check': (datetime.now() + timedelta(days=1)).isoformat(),
            'risk_level': 'high'
        })
    except Exception as e:
        print(f"Error checking Windows Defender: {e}")

    # Check Windows Firewall status using PowerShell
    try:
        firewall_status = subprocess.check_output(
            ['powershell', 'Get-NetFirewallProfile | Select-Object -ExpandProperty Enabled'],
            text=True
        ).strip()
        
        controls.append({
            'framework': 'ISO27001',
            'control_id': 'A.13.1.1',
            'control_name': 'Network Security',
            'description': 'Windows Firewall status check',
            'status': 'compliant' if 'True' in firewall_status else 'non_compliant',
            'evidence': f"Windows Firewall profiles enabled: {firewall_status}",
            'last_checked': datetime.now().isoformat(),
            'next_check': (datetime.now() + timedelta(days=1)).isoformat(),
            'risk_level': 'high'
        })
    except Exception as e:
        print(f"Error checking Windows Firewall: {e}")

    # Check password policy using net accounts
    try:
        password_policy = subprocess.check_output(
            ['powershell', '(net accounts | Select-String "Minimum password length") -replace "Minimum password length",""'],
            text=True
        ).strip()
        
        try:
            min_length = int(''.join(filter(str.isdigit, password_policy)))
        except (ValueError, TypeError):
            min_length = 0
            
        controls.append({
            'framework': 'SOC2',
            'control_id': 'CC6.1',
            'control_name': 'Password Policy',
            'description': 'Password minimum length check',
            'status': 'compliant' if min_length >= 8 else 'non_compliant',
            'evidence': f"Minimum password length: {min_length}",
            'last_checked': datetime.now().isoformat(),
            'next_check': (datetime.now() + timedelta(days=30)).isoformat(),
            'risk_level': 'medium'
        })
    except Exception as e:
        print(f"Error checking password policy: {e}")
        controls.append({
            'framework': 'SOC2',
            'control_id': 'CC6.1',
            'control_name': 'Password Policy',
            'description': 'Password minimum length check',
            'status': 'non_compliant',
            'evidence': f"Unable to check password policy: {str(e)}",
            'last_checked': datetime.now().isoformat(),
            'next_check': (datetime.now() + timedelta(days=1)).isoformat(),
            'risk_level': 'high'
        })

    # Check Windows Update service using PowerShell
    try:
        update_status = subprocess.check_output(
            ['powershell', 'Get-Service -Name wuauserv | Select-Object -ExpandProperty Status'],
            text=True
        ).strip()
        
        controls.append({
            'framework': 'SOC2',
            'control_id': 'CC7.1',
            'control_name': 'System Updates',
            'description': 'Windows Update service status',
            'status': 'compliant' if update_status.lower() == 'running' else 'non_compliant',
            'evidence': f"Windows Update service state: {update_status}",
            'last_checked': datetime.now().isoformat(),
            'next_check': (datetime.now() + timedelta(days=1)).isoformat(),
            'risk_level': 'high'
        })
    except Exception as e:
        print(f"Error checking Windows Updates: {e}")

    return controls

def check_installed_software() -> List[Dict[str, Any]]:
    """Check installed software for known vulnerabilities."""
    vulnerabilities = []
    
    # Check Python packages using importlib.metadata
    try:
        for dist in distributions():
            if not dist.version:
                vulnerabilities.append({
                    'title': f"Unversioned package: {dist.metadata['Name']}",
                    'description': f"Package {dist.metadata['Name']} has no version specified",
                    'severity': 'medium',
                    'cvss_score': 5.0,  # Default medium score
                    'affected_component': dist.metadata['Name'],
                    'affected_versions': ['unknown'],
                    'remediation': "Specify a version for this package",
                    'discovered_at': datetime.now().isoformat(),
                    'status': 'open',
                    'scan_source': 'pip',
                    'asset_id': 'python-packages',
                    'asset_type': 'software',
                    'tags': ['python', 'dependencies']
                })
    except Exception as e:
        print(f"Error checking Python packages: {e}")

    # Scan Windows programs using PowerShell
    try:
        installed_programs = subprocess.check_output(
            ['powershell', 'Get-WmiObject -Class Win32_Product | Select-Object Name, Version'],
            text=True
        ).strip()
        
        for line in installed_programs.split('\n'):
            if line and 'Name' not in line:  # Skip header
                parts = line.strip().split()
                if len(parts) >= 2:
                    name = ' '.join(parts[:-1])
                    version = parts[-1]
                    vulnerabilities.append({
                        'title': f"Software scan: {name}",
                        'description': f"Installed program: {name} version {version}",
                        'severity': 'info',
                        'cvss_score': 0.0,
                        'affected_component': name,
                        'affected_versions': [version],
                        'remediation': "Keep software updated",
                        'discovered_at': datetime.now().isoformat(),
                        'status': 'open',
                        'scan_source': 'windows',
                        'asset_id': 'installed-programs',
                        'asset_type': 'software',
                        'tags': ['windows', 'programs']
                    })
    except Exception as e:
        print(f"Error scanning Windows programs: {e}")

    return vulnerabilities

def map_cvss_to_severity(cvss_score: float) -> str:
    """Map CVSS score to severity level."""
    if cvss_score >= 9.0:
        return 'critical'
    elif cvss_score >= 7.0:
        return 'high'
    elif cvss_score >= 4.0:
        return 'medium'
    else:
        return 'low'

def send_results(endpoint: str, data: Dict[str, Any]) -> None:
    """Send results to the API."""
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {get_auth_token()}'
    }
    
    try:
        # If sending vulnerabilities, chunk them into smaller batches
        if endpoint == 'vulnerabilities' and 'vulnerabilities' in data:
            chunk_size = 50  # Send 50 vulnerabilities at a time
            vulnerabilities = data['vulnerabilities']
            total_chunks = (len(vulnerabilities) + chunk_size - 1) // chunk_size
            
            for i in range(0, len(vulnerabilities), chunk_size):
                chunk = vulnerabilities[i:i + chunk_size]
                chunk_data = {'vulnerabilities': chunk}
                response = requests.post(
                    f'{API_URL}/api/security/agent/vulnerability-scan',
                    json=chunk_data,
                    headers=headers
                )
                response.raise_for_status()
                print(f"Successfully sent chunk {(i//chunk_size)+1}/{total_chunks} of vulnerability scan results")
        elif endpoint == 'compliance' and 'compliance' in data:
            # For compliance data, send as is
            response = requests.post(
                f'{API_URL}/api/security/agent/compliance-check',
                json=data,
                headers=headers
            )
            response.raise_for_status()
            print(f"Successfully sent compliance check results")
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
            vulnerabilities = []
            
            # Network scan
            print("Running network scan...")
            net_vulns = run_nmap_scan('localhost')
            vulnerabilities.extend(net_vulns)
            
            # Software scan
            print("Scanning installed software...")
            sw_vulns = check_installed_software()
            vulnerabilities.extend(sw_vulns)
            
            print(f"Found {len(vulnerabilities)} potential vulnerabilities")
            if vulnerabilities:
                send_results('vulnerabilities', {
                    'vulnerabilities': vulnerabilities
                })
            
            # Run compliance checks
            print("Starting compliance checks...")
            compliance_results = check_windows_security()
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