import requests
import time
import threading

class SensorClient:
    def __init__(self):
        self.base_url = "YOUR_API_BASE_URL"
        self.api_token = "YOUR_API_KEY"
        self.data = {}
        self.start_polling()

    def fetch_endpoint(self, endpoint):
        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "apikey": self.api_token
        }

        response = requests.get(f"{self.base_url}/{endpoint}", headers=headers)

        if response.status_code == 200:
            self.data[endpoint] = response.json()

    def poll(self):
        while True:
            for endpoint in ["door_sensors", "motion_sensors"]:
                self.fetch_endpoint(endpoint)
            time.sleep(5)

    def start_polling(self):
        thread = threading.Thread(target=self.poll, daemon=True)
        thread.start()

    def get_sensor(self, name):
        return self.data