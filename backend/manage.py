import argparse
import json
import os
import requests
from dotenv import load_dotenv

load_dotenv()

DEFAULT_BACKEND_URL = "http://127.0.0.1:5001"
BACKEND_URL = os.getenv("BACKEND_URL", DEFAULT_BACKEND_URL)
REQUEST_TIMEOUT_SECONDS = 10


def call_backend_route(route, force_refresh=False, timeout=REQUEST_TIMEOUT_SECONDS):
   
    url = f"{BACKEND_URL}{route}"

    params = {}
    if force_refresh:
        params["refresh"] = "true"

    try:
        response = requests.get(url, params=params, timeout=timeout)
        response.raise_for_status()
        return response.json()

    except requests.exceptions.ConnectionError:
        return {
            "error": "Could not connect to backend server.",
            "hint": "Make sure Flask is running with: python app.py",
            "url": url,
        }

    except requests.exceptions.Timeout:
        return {
            "error": "Backend request timed out.",
            "url": url,
        }

    except requests.exceptions.HTTPError as error:
        return {
            "error": "Backend returned an HTTP error.",
            "status_code": response.status_code,
            "details": str(error),
            "url": url,
        }

    except ValueError:
        return {
            "error": "Backend response was not valid JSON.",
            "raw_response": response.text,
            "url": url,
        }


def print_json(data):
    """
    Pretty-print CLI output as readable JSON.
    """
    print(json.dumps(data, indent=2))


def main():
    parser = argparse.ArgumentParser(
        description="Developer CLI for testing Quantique Exchange backend routes."
    )

    parser.add_argument(
        "command",
        choices=["health", "summary", "data", "latest"],
        help="Backend route to call.",
    )

    parser.add_argument(
        "--refresh",
        action="store_true",
        help="Force refresh cached backend data where supported.",
    )

    args = parser.parse_args()

    route_map = {
        "health": "/health",
        "summary": "/summary",
        "latest": "/latest",
        "data": "/data",
    }

    result = call_backend_route(
        route=route_map[args.command],
        force_refresh=args.refresh,
        timeout=20 if args.command == "data" else REQUEST_TIMEOUT_SECONDS,
    )

    print_json(result)


if __name__ == "__main__":
    main()