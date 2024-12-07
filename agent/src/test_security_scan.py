import os
import jwt
import requests
import socket
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
    try:
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {get_auth_token()}'
        }
        print(f"Using headers: {headers}")  # Debug log

        # Get hostname for agent identification
        hostname = socket.gethostname()
        current_time = datetime.now().isoformat()
        
        # Sample compliance data
        compliance_checks = [
            {
                'framework': 'ISO27001',
                'control_id': 'A.9.4.3',
                'control_name': 'Password Management',
                'description': 'Password management system should enforce strong passwords',
                'status': 'non_compliant',
                'evidence': 'Current password policy allows weak passwords',
                'last_checked': current_time,
                'next_check': (datetime.now() + timedelta(days=30)).isoformat(),
                'risk_level': 'high',
                'remediation_plan': 'Implement new password policy',
                'tags': ['authentication', 'password'],
                'hostname': hostname
            },
            {
                'framework': 'SOC2',
                'control_id': 'CC6.1',
                'control_name': 'Encryption in Transit',
                'description': 'Data should be encrypted during transmission',
                'status': 'compliant',
                'evidence': 'All communications use TLS 1.3',
                'last_checked': current_time,
                'next_check': (datetime.now() + timedelta(days=90)).isoformat(),
                'risk_level': 'medium',
                'tags': ['encryption', 'network'],
                'hostname': hostname
            },
            {
                'framework': 'GDPR',
                'control_id': 'Article 32',
                'control_name': 'Data Protection 1',
                'description': 'Personal data must be protected with appropriate measures',
                'status': 'partially_compliant',
                'evidence': 'Some systems need encryption upgrades',
                'last_checked': current_time,
                'next_check': (datetime.now() + timedelta(days=15)).isoformat(),
                'risk_level': 'high',
                'remediation_plan': 'Upgrade encryption on remaining systems',
                'tags': ['data-protection', 'encryption'],
                'hostname': hostname
            }
        ]

        # Send compliance data first to check for issues
        print("\nSending test compliance data...")
        compliance_response = requests.post(
            f'{API_URL}/api/security/agent/compliance-check',
            json={'compliance': compliance_checks},
            headers=headers
        )
        
        # Print detailed response for debugging
        print(f"Compliance Response Status: {compliance_response.status_code}")
        print(f"Compliance Response Body: {compliance_response.text}")
        compliance_response.raise_for_status()
        print("Successfully sent compliance data")

        # Send vulnerability data
        print("\nSending test vulnerability data...")
        vuln_response = requests.post(
            f'{API_URL}/api/security/agent/vulnerability-scan',
            json={'vulnerabilities': vulnerabilities},
            headers=headers
        )
        vuln_response.raise_for_status()
        print("Successfully sent vulnerability data")

    except requests.exceptions.RequestException as e:
        print(f"\nError sending test data: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response status: {e.response.status_code}")
            print(f"Response body: {e.response.text}")
            print(f"Request body: {e.request.body}")
        raise

if __name__ == '__main__':
    try:
        send_test_data()
    except Exception as e:
        print(f"Script failed: {str(e)}")
        exit(1) 