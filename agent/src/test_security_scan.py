import os
import jwt
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

API_URL = os.getenv('API_URL', 'http://localhost:3000')
AGENT_SECRET = os.getenv('AGENT_SECRET', 'default-secret')

def get_auth_token() -> str:
    """Generate JWT token for API authentication."""
    print(f"Using agent secret: {AGENT_SECRET}")  # Debug log
    token = jwt.encode(
        {
            'agent_id': os.getenv('AGENT_ID', 'default'),
            'timestamp': datetime.now().isoformat(),
            'type': 'agent'
        },
        AGENT_SECRET,
        algorithm='HS256'
    )
    print(f"Generated token: {token}")  # Debug log
    return token

def send_test_data():
    """Send test vulnerability and compliance data."""
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {get_auth_token()}'
    }
    print(f"Using headers: {headers}")  # Debug log

    # Sample vulnerability data
    vulnerabilities = [
        {
            'title': 'Critical SQL Injection Vulnerability',
            'description': 'A SQL injection vulnerability was found in the login form',
            'severity': 'critical',
            'cvss_score': 9.8,
            'affected_component': 'Web Application',
            'affected_versions': ['1.0.0', '1.1.0'],
            'remediation': 'Update to version 1.2.0 or implement input validation',
            'discovered_at': datetime.now().isoformat(),
            'status': 'open',
            'scan_source': 'test',
            'asset_id': 'web-server-1',
            'asset_type': 'web-application',
            'tags': ['web', 'sql-injection']
        },
        {
            'title': 'Outdated SSL Certificate',
            'description': 'The SSL certificate is using an outdated encryption algorithm',
            'severity': 'high',
            'cvss_score': 7.5,
            'affected_component': 'HTTPS Server',
            'affected_versions': ['TLS 1.0'],
            'remediation': 'Update to TLS 1.3',
            'discovered_at': datetime.now().isoformat(),
            'status': 'open',
            'scan_source': 'test',
            'asset_id': 'web-server-1',
            'asset_type': 'network',
            'tags': ['ssl', 'encryption']
        },
        {
            'title': 'Weak Password Policy',
            'description': 'Password policy does not enforce sufficient complexity',
            'severity': 'medium',
            'cvss_score': 5.0,
            'affected_component': 'Authentication System',
            'affected_versions': ['current'],
            'remediation': 'Implement stronger password requirements',
            'discovered_at': datetime.now().isoformat(),
            'status': 'in_progress',
            'scan_source': 'test',
            'asset_id': 'auth-server',
            'asset_type': 'authentication',
            'tags': ['password', 'policy']
        }
    ]

    # Sample compliance data
    compliance_checks = [
        {
            'framework': 'ISO27001',
            'control_id': 'A.9.4.3',
            'control_name': 'Password Management',
            'description': 'Password management system should enforce strong passwords',
            'status': 'non_compliant',
            'evidence': 'Current password policy allows weak passwords',
            'last_checked': datetime.now().isoformat(),
            'next_check': (datetime.now() + timedelta(days=30)).isoformat(),
            'risk_level': 'high',
            'remediation_plan': 'Implement new password policy',
            'tags': ['authentication', 'password']
        },
        {
            'framework': 'SOC2',
            'control_id': 'CC6.1',
            'control_name': 'Encryption in Transit',
            'description': 'Data should be encrypted during transmission',
            'status': 'compliant',
            'evidence': 'All communications use TLS 1.3',
            'last_checked': datetime.now().isoformat(),
            'next_check': (datetime.now() + timedelta(days=90)).isoformat(),
            'risk_level': 'medium',
            'tags': ['encryption', 'network']
        },
        {
            'framework': 'GDPR',
            'control_id': 'Article 32',
            'control_name': 'Data Protection',
            'description': 'Personal data must be protected with appropriate measures',
            'status': 'partially_compliant',
            'evidence': 'Some systems need encryption upgrades',
            'last_checked': datetime.now().isoformat(),
            'next_check': (datetime.now() + timedelta(days=15)).isoformat(),
            'risk_level': 'high',
            'remediation_plan': 'Upgrade encryption on remaining systems',
            'tags': ['data-protection', 'encryption']
        }
    ]

    try:
        # Test authentication first
        print("Testing authentication...")
        test_response = requests.get(
            f'{API_URL}/api/security/agent/test',
            headers=headers
        )
        test_response.raise_for_status()
        print("Authentication test successful:", test_response.json())

        # Send vulnerability data
        print("Sending test vulnerability data...")
        response = requests.post(
            f'{API_URL}/api/security/agent/vulnerability-scan',
            json={'vulnerabilities': vulnerabilities},
            headers=headers
        )
        response.raise_for_status()
        print("Successfully sent vulnerability data")

        # Send compliance data
        print("Sending test compliance data...")
        response = requests.post(
            f'{API_URL}/api/security/agent/compliance-check',
            json={'compliance': compliance_checks},
            headers=headers
        )
        response.raise_for_status()
        print("Successfully sent compliance data")

    except Exception as e:
        print(f"Error sending test data: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response status: {e.response.status_code}")
            print(f"Response body: {e.response.text}")

if __name__ == '__main__':
    send_test_data() 