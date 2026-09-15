# Vehicle Rental Backend

This is the FastAPI backend for the Vehicle Rental Management Platform.

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv .venv
   ```

2. Activate the virtual environment:
   - Windows: `.venv\Scripts\activate`
   - Linux/Mac: `source .venv/bin/activate`

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Environment Variables:
   Copy `.env.example` to `.env` and fill in the values.
   ```bash
   cp .env.example .env
   ```

5. Run the development server:
   ```bash
   uvicorn main:app --reload
   ```

The API will be available at `http://localhost:8000`.
Swagger documentation is automatically generated at `http://localhost:8000/docs`.
