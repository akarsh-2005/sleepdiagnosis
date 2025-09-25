import requests
import json

# Test the API
url = "http://localhost:8000/analyze"
files = {'audio': open('test_audio.wav', 'rb')}

try:
    response = requests.post(url, files=files)
    print("Status Code:", response.status_code)
    print("Response:", json.dumps(response.json(), indent=2))
except Exception as e:
    print("Error:", e)
finally:
    files['audio'].close()