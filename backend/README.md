# Flask Backend Template

This is a minimal Flask backend template designed to work with a React frontend.

## Setup

1. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Server

```bash
python app.py
```

The backend will be available at `http://localhost:5000`.

## API Endpoints

- `GET /api/health` — Health check endpoint.
- `GET /api/greet` — Sample endpoint returning a greeting message.

CORS is enabled for all routes to allow requests from your React frontend. 