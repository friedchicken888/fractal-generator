import requests
import time
import random

URL = "http://3.104.30.61:3000/fractal"

COLOUR_SCHEMES = ["rainbow", "grayscale", "fire", "hsl"]

DURATION = 10 * 60  # 5 minutes
start_time = time.time()
request_count = 0

while time.time() - start_time < DURATION:
    # Random Julia parameters
    params = {
        "width": 1920,
        "height": 1080,
        "iterations": random.randint(500, 3000),
        "power": 2,
        "scale": round(random.uniform(0.3, 1.5), 3),
        # "offsetX": round(random.uniform(-1.5, 1.5), 3),
        # "offsetY": round(random.uniform(-1.5, 1.5), 3),
        "color": random.choice(COLOUR_SCHEMES),
        "real": round(random.uniform(-1.5, 1.5), 3),
        "imag": round(random.uniform(-1.5, 1.5), 3)
    }

    request_count += 1
    print(f"\nRequest {request_count} with params {params}")

    req_start = time.time()
    resp = requests.get(URL, params=params)
    req_time = time.time() - req_start

    print(f"Request {request_count} done in {req_time:.2f} seconds, "
          f"size={len(resp.content)} bytes")

print(f"\n✅ Sent {request_count} requests in 10 minutes.")
