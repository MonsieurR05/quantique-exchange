class DataWrapper:
    def __init__(self, client):
        self.client = client

    def get_all(self, sensor_name):
        return self.client.get_sensor(sensor_name)