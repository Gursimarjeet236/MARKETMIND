import sys
import os

# Add the backend_fastapi directory to the path so we can import from it
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend_fastapi'))

from main import app as fastapi_app

app = fastapi_app
