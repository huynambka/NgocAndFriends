import requests
import json
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


def create_session():
    session = requests.Session()
    retries = Retry(total=5, backoff_factor=0.2,
                    status_forcelist=[502, 503, 504])
    adapter = HTTPAdapter(max_retries=retries)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    return session


url = "http://localhost:3000/api/v1/user/create"

try:
    session = create_session()

    for i in range(1, 27):
        response = session.post(url, json={
            "username": chr(64+i),
            "name": f"Nguyen Van {chr(64+i)}",
            "email": f"{chr(64+i)}@gmail.com",
            "password": "123456",
        })

        if (response.status_code == 201):
            print(f"User created for name: {chr(64+i)}", end="\r")
        else:
            print(f"Error creating user for name: {chr(64+i)}", end="\n")
except requests.exceptions.RequestException as e:
    print("An error occurred while sending the request:", e)
