#!/usr/bin/env python3
"""
Railway app.py entry point for SleepDiagnosis
Railway auto-detects this file and starts the application
"""

import os
import sys

# Add backend directory to Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

# Import and expose the FastAPI app
from main import app

# Railway will automatically start this with uvicorn
# No need for __main__ block as Railway handles the server startup