"""Data wrapper for sensor access.

This module provides a small abstraction layer around the sensor client. It
keeps higher-level code from directly depending on the client's internal access
methods.
"""

class DataWrapper:
    """Wraps a sensor client and exposes simple data access methods.

    The wrapper helps keep the rest of the backend decoupled from the exact
    implementation of the sensor client.

    Attributes:
        client: Sensor client instance used to retrieve sensor data.
    """

    def __init__(self, client):
        """Initialises the data wrapper.

        Args:
            client: Sensor client instance that provides access to sensor data.
        """
        self.client = client

    def get_all(self, sensor_name):
        """Returns all readings for a specific sensor.

        Args:
            sensor_name (str): Name of the sensor to retrieve.

        Returns:
            list | dict | None: Sensor readings returned by the client.
        """
        return self.client.get_sensor(sensor_name)