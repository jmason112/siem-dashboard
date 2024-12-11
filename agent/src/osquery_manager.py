import os
import json
import subprocess
import platform
import logging
import shutil
from datetime import datetime

class OSQueryManager:
    def __init__(self):
        self.osqueryi_path = self._find_osquery()
        if not self.osqueryi_path:
            logging.warning("OSQuery not found. Some functionality will be limited.")
            
        self.queries = {
            'processes': 'SELECT pid, name, path, cmdline, state, parent, uid FROM processes;',
            'users': 'SELECT uid, username, directory, shell FROM users;',
            'network_connections': '''
                SELECT DISTINCT processes.name, processes.path,
                    listening.port, listening.address, listening.protocol
                FROM processes
                JOIN listening_ports AS listening
                ON processes.pid = listening.pid;
            ''',
            'startup_items': '''
                SELECT name, path, source, status 
                FROM startup_items WHERE status != 'disabled';
            ''',
            'scheduled_tasks': 'SELECT name, action, path, enabled FROM scheduled_tasks;',
            'system_info': '''
                SELECT hostname, cpu_brand, physical_memory, hardware_vendor,
                    hardware_model, hardware_serial
                FROM system_info;
            '''
        }

    def _find_osquery(self):
        """Find OSQuery executable in common locations"""
        if platform.system() == 'Windows':
            common_paths = [
                r'C:\Program Files\osquery\osqueryi.exe',
                r'C:\ProgramData\osquery\osqueryi.exe',
                r'C:\osquery\osqueryi.exe'
            ]
            # Also check PATH
            osqueryi = shutil.which('osqueryi.exe')
            if osqueryi:
                common_paths.append(osqueryi)
        else:
            common_paths = [
                '/usr/bin/osqueryi',
                '/usr/local/bin/osqueryi',
                '/opt/osquery/bin/osqueryi'
            ]
            # Also check PATH
            osqueryi = shutil.which('osqueryi')
            if osqueryi:
                common_paths.append(osqueryi)

        for path in common_paths:
            if path and os.path.isfile(path):
                return path
        return None

    def run_query(self, query):
        """Run an OSQuery query and return the results as JSON"""
        if not self.osqueryi_path:
            logging.error("OSQuery not installed or not found")
            return None
            
        try:
            cmd = [self.osqueryi_path, '--json', query]
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                logging.error(f"OSQuery error: {result.stderr}")
                return None
                
            return json.loads(result.stdout)
        except Exception as e:
            logging.error(f"Error running OSQuery: {str(e)}")
            return None

    def format_process_data(self, data):
        """Format process data for SIEM dashboard"""
        if not data:
            return []
            
        formatted = []
        for process in data:
            formatted.append({
                'type': 'process',
                'timestamp': datetime.utcnow().isoformat(),
                'data': {
                    'pid': process.get('pid'),
                    'name': process.get('name'),
                    'path': process.get('path'),
                    'command': process.get('cmdline'),
                    'state': process.get('state'),
                    'parent_pid': process.get('parent'),
                    'user_id': process.get('uid')
                }
            })
        return formatted

    def format_network_data(self, data):
        """Format network connection data for SIEM dashboard"""
        if not data:
            return []
            
        formatted = []
        for conn in data:
            formatted.append({
                'type': 'network_connection',
                'timestamp': datetime.utcnow().isoformat(),
                'data': {
                    'process_name': conn.get('name'),
                    'process_path': conn.get('path'),
                    'local_port': conn.get('port'),
                    'local_address': conn.get('address'),
                    'protocol': conn.get('protocol')
                }
            })
        return formatted

    def format_system_info(self, data):
        """Format system information for SIEM dashboard"""
        if not data or not data[0]:
            return None
            
        info = data[0]
        return {
            'type': 'system_info',
            'timestamp': datetime.utcnow().isoformat(),
            'data': {
                'hostname': info.get('hostname'),
                'cpu': info.get('cpu_brand'),
                'memory': info.get('physical_memory'),
                'vendor': info.get('hardware_vendor'),
                'model': info.get('hardware_model'),
                'serial': info.get('hardware_serial')
            }
        }

    def collect_all_data(self):
        """Collect all OSQuery data and format it for the SIEM"""
        if not self.osqueryi_path:
            return {
                'processes': [],
                'network': [],
                'system': None
            }
            
        data = {
            'processes': self.format_process_data(
                self.run_query(self.queries['processes'])
            ),
            'network': self.format_network_data(
                self.run_query(self.queries['network_connections'])
            ),
            'system': self.format_system_info(
                self.run_query(self.queries['system_info'])
            )
        }
        return data 