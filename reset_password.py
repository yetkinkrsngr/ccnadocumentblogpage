import requests
import json

url = "http://localhost:5153/api/auth/dev/set-admin-user-password"
data = {
    "email": "yetkinkrsngr@gmail.com",
    "password": "Admin123!"
}

response = requests.post(url, json=data)
print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")
