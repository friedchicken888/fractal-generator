import requests
import time

URL = "http://:3000/fractal" # need to enter ec2 ip address
PARAMS = {
    "width": 1920,
    "height": 1080,
    "iterations": 2000,   # tweak higher if you want more CPU load
    "power": 2,
    "scale": 0.5,
    "offsetX": 0,
    "offsetY": 0,
    "color": "rainbow"
}

DURATION = 5 * 60  # 5 minutes in seconds
start_time = time.time()
request_count = 0

while time.time() - start_time < DURATION:
    request_count += 1
    print(f"Request {request_count} starting...")
    req_start = time.time()
    resp = requests.get(URL, params=PARAMS)
    req_time = time.time() - req_start
    print(f"Request {request_count} done in {req_time:.2f} seconds, "
          f"size={len(resp.content)} bytes")

print(f"Sent {request_count} requests in 5 minutes.")
