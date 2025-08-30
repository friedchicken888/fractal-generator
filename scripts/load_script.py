import requests
import time
import random

# Fractal API URL
BASE_URL = ""
LOGIN_URL = ""
FRACTAL_URL = ""

# Credentials
USERNAME = "user"
PASSWORD = "user"

# Color schemes
COLOUR_SCHEMES = ["rainbow", "grayscale", "fire", "hsl"]

def login():
    """Logs in to the API and returns the JWT token."""
    print(f"Logging in as {USERNAME}...")
    try:
        resp = requests.post(LOGIN_URL, json={"username": USERNAME, "password": PASSWORD})
        if resp.status_code == 200:
            token = resp.json().get('token')
            print("Login successful.")
            return token
        else:
            print(f"Login failed with status {resp.status_code}: {resp.text}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Login request failed: {e}")
        return None

def run_load_test(token, duration_seconds):
    """Runs the load test for a given duration."""
    headers = {"Authorization": f"Bearer {token}"}
    start_time = time.time()
    request_count = 0

    loop_condition = True
    while loop_condition:
        # Random Julia parameters
        params = {
            "width": 1920,
            "height": 1080,
            "maxIterations": random.randint(100, 3000),
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
            resp = requests.get(FRACTAL_URL, params=params, headers=headers, timeout=180)
            req_time = time.time() - req_start

            if resp.status_code == 200:
                print(f"Request {request_count} done in {req_time:.2f}s, size={len(resp.content)} bytes")
            elif resp.status_code == 499:
                print(f"Request {request_count} aborted (time limit exceeded) after {req_time:.2f}s")
            else:
                print(f"Request {request_count} failed with status {resp.status_code}, content: {resp.text}")

        except requests.exceptions.RequestException as e:
            req_time = time.time() - req_start
            print(f"Request {request_count} failed after {req_time:.2f}s: {e}")
        
        if duration_seconds is not None:
            if time.time() - start_time >= duration_seconds:
                loop_condition = False

    total_duration_minutes = (time.time() - start_time) / 60
    print(f"\nSent {request_count} requests in {total_duration_minutes:.1f} minutes.")

if __name__ == "__main__":
    ip_address = input("Enter the server IP address: ")
    BASE_URL = f"http://{ip_address}:3000"
    LOGIN_URL = f"{BASE_URL}/api/auth/login"
    FRACTAL_URL = f"{BASE_URL}/api/fractal"

    duration_input = input("Enter the duration in minutes (leave empty for indefinite): ")
    duration_seconds = None
    if duration_input:
        try:
            duration_seconds = int(duration_input) * 60
        except ValueError:
            print("Invalid duration. Running indefinitely.")

    jwt_token = login()
    if jwt_token:
        run_load_test(jwt_token, duration_seconds)