import requests
import time
import random

# Fractal API URL
URL = "http://:3000/fractal"

# Color schemes
COLOUR_SCHEMES = ["rainbow", "grayscale", "fire", "hsl"]

# Duration to run the test (seconds)
DURATION = 10 * 60
start_time = time.time()
request_count = 0

while time.time() - start_time < DURATION:
    # Random Julia parameters
    params = {
        "width": 1920,
        "height": 1080,
        "iterations": random.randint(100, 3000),
        "power": 2,
        "scale": round(random.uniform(0.3, 1.5), 3),
        "offsetX": round(random.uniform(-1.5, 1.5), 3),
        "offsetY": round(random.uniform(-1.5, 1.5), 3),
        "color": random.choice(COLOUR_SCHEMES),
        "real": round(random.uniform(-1.5, 1.5), 3),
        "imag": round(random.uniform(-1.5, 1.5), 3)
    }

    request_count += 1
    print(f"\nRequest {request_count} with params {params}")

    req_start = time.time()
    try:
        # Set a generous timeout in case the server takes a long time
        resp = requests.get(URL, params=params, timeout=180)
        req_time = time.time() - req_start

        if resp.status_code == 200:
            print(f"Request {request_count} done in {req_time:.2f}s, size={len(resp.content)} bytes")
        elif resp.status_code == 499:
            print(f"Request {request_count} aborted (time limit exceeded) after {req_time:.2f}s")
        else:
            print(f"Request {request_count} failed with status {resp.status_code}, content: {resp.text}")

    except requests.exceptions.RequestException as e:
        req_time = time.time() - req_start
        print(f"❌ Request {request_count} failed after {req_time:.2f}s: {e}")

print(f"\nSent {request_count} requests in {DURATION/60:.1f} minutes.")
