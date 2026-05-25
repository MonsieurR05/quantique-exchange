"""Polling client for retrieving UAL IoT sensor data.

This module defines a simple sensor client that repeatedly fetches sensor
endpoint data in the background. It is mainly used as an experimental or helper
client for accessing live sensor readings.
"""

import threading
import time

import requests


class SensorClient:
    """Fetches and stores live sensor data from configured API endpoints.

    The client starts a background polling thread when initialised. The thread
    repeatedly requests sensor endpoints and stores the latest response data in
    memory.

    Attributes:
        base_url (str): Base URL for the sensor API.
        api_token (str): API token used for authenticated requests.
        data (dict): Latest response data stored by endpoint name.
    """

    def __init__(self):
        """Initialises the sensor client and starts background polling."""
        self.base_url = "YOUR_API_BASE_URL"
        self.api_token = "YOUR_API_KEY"
        self.data = {}
        self.start_polling()

    def fetch_endpoint(self, endpoint):
        """Fetches data from a single sensor endpoint.

        Args:
            endpoint (str): Sensor endpoint name to request.

        Side Effects:
            Updates `self.data` with the latest JSON response if the request
            succeeds.
        """
        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "apikey": self.api_token,
        }

        response = requests.get(
            f"{self.base_url}/{endpoint}",
            headers=headers,
            timeout=8,
        )

        if response.status_code == 200:
            self.data[endpoint] = response.json()

    def poll(self):
        """Continuously polls selected sensor endpoints.

        The method runs inside a background thread and refreshes sensor data
        every five seconds.
        """
        while True:
            for endpoint in ["door_sensors", "motion_sensors"]:
                self.fetch_endpoint(endpoint)

            time.sleep(5)

    def start_polling(self):
        """Starts background polling in a daemon thread."""
        thread = threading.Thread(target=self.poll, daemon=True)
        thread.start()

    def get_sensor(self, name):
        """Returns stored sensor data.

        Args:
            name (str): Sensor name requested by the caller. This argument is
            currently kept for compatibility with DataWrapper.

        Returns:
            dict: Latest cached sensor data grouped by endpoint.
        """
        return self.data