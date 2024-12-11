import os
import platform
import psutil
import socket
import logging
from datetime import datetime

def check_open_ports():
    """Check for open network ports"""
    open_ports = []
    for conn in psutil.net_connections(kind='inet'):
        if conn.status == 'LISTEN':
            open_ports.append({
                'port': conn.laddr.port,
                'address': conn.laddr.ip,
                'pid': conn.pid
            })
    return open_ports

def check_running_processes():
    """Check for potentially suspicious processes"""
    suspicious = []
    for proc in psutil.process_iter(['pid', 'name', 'exe', 'cmdline']):
        try:
            pinfo = proc.info
            # Check if process is running from temp directory
            if pinfo['exe'] and ('temp' in pinfo['exe'].lower() or 'tmp' in pinfo['exe'].lower()):
                suspicious.append({
                    'pid': pinfo['pid'],
                    'name': pinfo['name'],
                    'path': pinfo['exe'],
                    'cmdline': ' '.join(pinfo['cmdline'] or [])
                })
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass
    return suspicious

def check_system_integrity():
    """Check system integrity and security settings"""
    integrity_checks = {
        'firewall_enabled': True,  # Placeholder - implement actual check
        'antivirus_running': True,  # Placeholder - implement actual check
        'updates_pending': False,   # Placeholder - implement actual check
        'system_modified': False    # Placeholder - implement actual check
    }
    return integrity_checks

def run_security_scan():
    """Run a complete security scan"""
    try:
        scan_results = {
            'timestamp': datetime.utcnow().isoformat(),
            'hostname': socket.gethostname(),
            'os': platform.system() + ' ' + platform.release(),
            'open_ports': check_open_ports(),
            'suspicious_processes': check_running_processes(),
            'system_integrity': check_system_integrity(),
            'vulnerabilities': []  # Placeholder for actual vulnerability scan
        }

        # Generate findings based on scan results
        findings = []
        
        # Check open ports
        for port in scan_results['open_ports']:
            if port['port'] > 49152:  # Check for high ports
                findings.append({
                    'type': 'open_port',
                    'severity': 'medium',
                    'description': f"High port {port['port']} open on {port['address']}",
                    'details': port
                })

        # Check suspicious processes
        for proc in scan_results['suspicious_processes']:
            findings.append({
                'type': 'suspicious_process',
                'severity': 'high',
                'description': f"Suspicious process running from {proc['path']}",
                'details': proc
            })

        # Add findings to scan results
        scan_results['findings'] = findings
        return scan_results

    except Exception as e:
        logging.error(f"Error during security scan: {str(e)}")
        return None 