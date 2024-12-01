import os
import sys
import time
import json
import logging
import asyncio
import psutil
import jwt
import websockets
from datetime import datetime
from dotenv import load_dotenv
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('agent.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('SIEM-Agent')

class SystemMonitor:
    def __init__(self):
        self.last_cpu_times = psutil.cpu_times()
        self.last_check = time.time()

    def get_system_metrics(self):
        """Collect system metrics including CPU, memory, disk, and network usage."""
        try:
            # CPU metrics
            cpu_percent = psutil.cpu_percent(interval=1)
            cpu_times = psutil.cpu_times()
            
            # Memory metrics
            memory = psutil.virtual_memory()
            
            # Disk metrics
            disk = psutil.disk_usage('/')
            
            # Network metrics
            network = psutil.net_io_counters()
            
            return {
                'timestamp': datetime.now().isoformat(),
                'cpu': {
                    'percent': cpu_percent,
                    'times': cpu_times._asdict()
                },
                'memory': {
                    'total': memory.total,
                    'available': memory.available,
                    'percent': memory.percent
                },
                'disk': {
                    'total': disk.total,
                    'used': disk.used,
                    'free': disk.free,
                    'percent': disk.percent
                },
                'network': {
                    'bytes_sent': network.bytes_sent,
                    'bytes_recv': network.bytes_recv,
                    'packets_sent': network.packets_sent,
                    'packets_recv': network.packets_recv
                }
            }
        except Exception as e:
            logger.error(f"Error collecting system metrics: {e}")
            return None

class SecurityMonitor:
    def __init__(self):
        self.suspicious_processes = set()
        self.baseline_connections = set()

    def check_processes(self):
        """Monitor for suspicious processes and resource usage."""
        alerts = []
        try:
            for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
                try:
                    # Check for high resource usage
                    if proc.info['cpu_percent'] > 80 or proc.info['memory_percent'] > 80:
                        alerts.append({
                            'title': 'High Resource Usage Detected',
                            'description': f"Process {proc.info['name']} (PID: {proc.info['pid']}) "
                                         f"is using high resources: CPU {proc.info['cpu_percent']}%, "
                                         f"Memory {proc.info['memory_percent']}%",
                            'severity': 'medium',
                            'source': 'process_monitor',
                            'timestamp': datetime.now().isoformat()
                        })
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
        except Exception as e:
            logger.error(f"Error monitoring processes: {e}")
        return alerts

    def check_network_connections(self):
        """Monitor for suspicious network connections."""
        alerts = []
        try:
            current_connections = set()
            for conn in psutil.net_connections(kind='inet'):
                if conn.status == 'ESTABLISHED':
                    connection = f"{conn.laddr.ip}:{conn.laddr.port}->{conn.raddr.ip}:{conn.raddr.port}"
                    current_connections.add(connection)
                    
                    if connection not in self.baseline_connections:
                        alerts.append({
                            'title': 'New Network Connection Detected',
                            'description': f"New connection established: {connection}",
                            'severity': 'low',
                            'source': 'network_monitor',
                            'timestamp': datetime.now().isoformat()
                        })
            
            self.baseline_connections = current_connections
        except Exception as e:
            logger.error(f"Error monitoring network connections: {e}")
        return alerts

class FileSystemMonitor(FileSystemEventHandler):
    def __init__(self, callback):
        self.callback = callback

    def on_modified(self, event):
        if not event.is_directory:
            self.callback({
                'title': 'File System Change Detected',
                'description': f"File modified: {event.src_path}",
                'severity': 'low',
                'source': 'filesystem_monitor',
                'timestamp': datetime.now().isoformat()
            })

class SIEMAgent:
    def __init__(self):
        self.system_monitor = SystemMonitor()
        self.security_monitor = SecurityMonitor()
        self.server_url = os.getenv('SERVER_URL', 'ws://localhost:3000')
        self.agent_secret = os.getenv('AGENT_SECRET')
        self.update_interval = int(os.getenv('UPDATE_INTERVAL', '60'))
        
        # Set up file system monitoring
        self.event_handler = FileSystemMonitor(self.send_alert)
        self.observer = Observer()
        self.observer.schedule(self.event_handler, path='.', recursive=False)

    def generate_token(self):
        """Generate JWT token for authentication with server."""
        try:
            return jwt.encode(
                {
                    'agent_id': os.getenv('AGENT_ID', 'default'),
                    'timestamp': datetime.now().isoformat()
                },
                self.agent_secret,
                algorithm='HS256'
            )
        except Exception as e:
            logger.error(f"Error generating token: {e}")
            return None

    async def send_alert(self, alert_data):
        """Send alert to the SIEM server."""
        try:
            token = self.generate_token()
            if not token:
                return

            async with websockets.connect(
                f"{self.server_url}/ws",
                extra_headers={'Authorization': f'Bearer {token}'}
            ) as websocket:
                await websocket.send(json.dumps(alert_data))
                logger.info(f"Alert sent: {alert_data['title']}")
        except Exception as e:
            logger.error(f"Error sending alert: {e}")

    async def run(self):
        """Main agent loop."""
        self.observer.start()
        try:
            while True:
                # Collect system metrics
                metrics = self.system_monitor.get_system_metrics()
                if metrics:
                    await self.send_alert({
                        'title': 'System Metrics Update',
                        'description': 'Regular system metrics collection',
                        'severity': 'info',
                        'source': 'system_monitor',
                        'data': metrics,
                        'timestamp': datetime.now().isoformat()
                    })

                # Check for security events
                process_alerts = self.security_monitor.check_processes()
                network_alerts = self.security_monitor.check_network_connections()

                # Send all alerts
                for alert in process_alerts + network_alerts:
                    await self.send_alert(alert)

                await asyncio.sleep(self.update_interval)
        except KeyboardInterrupt:
            self.observer.stop()
            logger.info("Agent stopped by user")
        except Exception as e:
            logger.error(f"Error in agent main loop: {e}")
        finally:
            self.observer.join()

if __name__ == '__main__':
    agent = SIEMAgent()
    asyncio.run(agent.run()) 