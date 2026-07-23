import secrets
import string

def generate_random_string(length=32):
    characters = string.ascii_letters + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))

def main():
    access_token = generate_random_string()
    api_key = generate_random_string()

    print(f"ACCESS_TOKEN={access_token}")
    print(f"API_KEY={api_key}")

if __name__ == "__main__":
    main()