import requests
import json

BASE_URL = ""
USERS = {
    "user": {"username": "user", "password": "user"},
    "admin": {"username": "admin", "password": "admin"}
}

current_user_role = None
current_token = None

def login(username, password):
    global current_token, current_user_role
    try:
        r = requests.post(f"{BASE_URL}/auth/login", json={"username": username, "password": password})
        r.raise_for_status()
        data = r.json()
        current_token = data['token']
        current_user_role = username # Assuming username is also the role for simplicity
        print(f"Logged in as {username}.")
        return True
    except requests.exceptions.RequestException as e:
        print(f"Login failed: {e}")
        current_token = None
        current_user_role = None
        return False

def generate_fractal():
    if not current_token:
        print("Please log in first.")
        return

    print("\n--- Generate Fractal ---")
    print("Enter parameters (leave blank for default/random):")
    width = input("Width (default 1920): ")
    height = input("Height (default 1080): ")
    iterations = input("Max Iterations (default 500): ")
    power = input("Power (default 2): ")
    c_real = input("C Real (default 0.285): ")
    c_imag = input("C Imag (default 0.01): ")
    scale = input("Scale (default 1): ")
    offset_x = input("Offset X (default 0): ")
    offset_y = input("Offset Y (default 0): ")
    color_scheme = input("Color Scheme (rainbow, grayscale, fire, hsl - default rainbow): ")

    params = {}
    if width: params["width"] = int(width)
    if height: params["height"] = int(height)
    if iterations: params["iterations"] = int(iterations)
    if power: params["power"] = float(power)
    if c_real: params["real"] = float(c_real)
    if c_imag: params["imag"] = float(c_imag)
    if scale: params["scale"] = float(scale)
    if offset_x: params["offsetX"] = float(offset_x)
    if offset_y: params["offsetY"] = float(offset_y)
    if color_scheme: params["color"] = color_scheme

    headers = {"Authorization": f"Bearer {current_token}"}
    try:
        r = requests.get(f"{BASE_URL}/fractal", headers=headers, params=params, timeout=180)
        r.raise_for_status()
        print("Fractal generated successfully!")
    except requests.exceptions.RequestException as e:
        print(f"Fractal generation failed: {e}")

def view_data(view_type="my_gallery"):
    if not current_token:
        print("Please log in first.")
        return

    endpoint = ""
    title = ""

    if view_type == "my_gallery":
        endpoint = "/gallery"
        title = "My Gallery"
    elif view_type == "all_history":
        if current_user_role != "admin":
            print("Admin privileges required to view all history.")
            return
        endpoint = "/admin/history"
        title = "All History"
    elif view_type == "all_gallery":
        if current_user_role != "admin":
            print("Admin privileges required to view all gallery.")
            return
        endpoint = "/admin/gallery"
        title = "All Gallery"
    else:
        print("Invalid view type.")
        return

    headers = {"Authorization": f"Bearer {current_token}"}
    try:
        r = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
        r.raise_for_status()
        data = r.json()
        if data:
            print(f"\n--- {title} ---")
            for entry in data:
                # Determine if it's a gallery or history entry to get correct timestamp field
                timestamp_field = 'added_at' if 'added_at' in entry else 'generated_at'
                user_info = f", User: {entry.get('username')}" if 'username' in entry else ''
                
                # Handle potentially None values for fractal details
                fractal_hash = entry.get('hash')
                display_hash = fractal_hash[:8] + '...' if fractal_hash else 'N/A (Deleted)'
                
                width = entry.get('width', 'N/A')
                height = entry.get('height', 'N/A')
                iterations = entry.get('iterations', 'N/A')
                power = entry.get('power', 'N/A')
                c_real = entry.get('c_real', 'N/A')
                c_imag = entry.get('c_imag', 'N/A')
                scale = entry.get('scale', 'N/A')
                offset_x = entry.get('offsetX', 'N/A')
                offset_y = entry.get('offsetY', 'N/A')
                color_scheme = entry.get('colorScheme', 'N/A')

                print(f"ID: {entry.get('id')}, Hash: {display_hash}{user_info}, Time: {entry.get(timestamp_field)}")
                print(f"  Params: W:{width}, H:{height}, Iter:{iterations}, Power:{power}, C:{c_real}+{c_imag}i, Scale:{scale}, Offset:{offset_x},{offset_y}, Color:{color_scheme}")
        else:
            print(f"No {title.lower()} items found.")
    except requests.exceptions.RequestException as e:
        print(f"Failed to retrieve {title.lower()}: {e}")

def delete_gallery_entry():
    if not current_token:
        print("Please log in first.")
        return

    gallery_id = input("Enter Gallery ID to delete: ")
    if not gallery_id.isdigit():
        print("Invalid ID. Please enter a number.")
        return

    headers = {"Authorization": f"Bearer {current_token}"}
    try:
        r = requests.delete(f"{BASE_URL}/gallery/{gallery_id}", headers=headers)
        r.raise_for_status()
        print(f"Gallery entry {gallery_id} deleted successfully.")
    except requests.exceptions.RequestException as e:
        print(f"Failed to delete gallery entry {gallery_id}: {e}")

def main_menu():
    global BASE_URL
    ip_address = input("Enter the server IP address (leave empty for localhost): ")
    if not ip_address:
        ip_address = "localhost"
    BASE_URL = f"http://{ip_address}:3000/api"

    while True:
        print("\n--- Main Menu ---")
        if current_user_role:
            print(f"Logged in as: {current_user_role}")
        else:
            print("Not logged in.")

        print("1. Select User (Login)")
        print("2. Generate Fractal")
        print("3. View My Gallery")
        if current_user_role == "admin":
            print("4. View All History (Admin)")
            print("5. View All Gallery (Admin)")
        print("6. Delete Gallery Entry")
        print("7. Exit")

        print()
        choice = input("Enter your choice: ")

        if choice == "1":
            print("\nSelect user:")
            print("  1. user")
            print("  2. admin")
            user_choice_num = input("\nEnter choice (1 or 2): ")
            selected_user = None
            if user_choice_num == "1":
                selected_user = "user"
            elif user_choice_num == "2":
                selected_user = "admin"
            else:
                print("Invalid choice.")

            if selected_user:
                login(USERS[selected_user]["username"], USERS[selected_user]["password"])
            input("\nPress Enter to continue...\n\n")
        elif choice == "2":
            generate_fractal()
            input("\nPress Enter to continue...\n\n")
        elif choice == "3":
            view_data(view_type="my_gallery")
            input("\nPress Enter to continue...\n\n")
        elif choice == "4" and current_user_role == "admin":
            view_data(view_type="all_history")
            input("\nPress Enter to continue...\n\n")
        elif choice == "5" and current_user_role == "admin":
            view_data(view_type="all_gallery")
            input("\nPress Enter to continue...\n\n")
        elif choice == "6":
            delete_gallery_entry()
            input("\nPress Enter to continue...\n\n")
        elif choice == "7":
            print("\nExiting CLI. Goodbye!")
            break
        else:
            print("\nInvalid choice. Please try again.")
            input("Press Enter to continue...\n\n")

if __name__ == "__main__":
    main_menu()