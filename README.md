# Research Agent

A simple, easy-to-use platform for generating, managing, and analyzing research papers and code using AI agents.

## Project Structure

- **backend/**: FastAPI server for handling API requests, code generation, and workspace management.
- **frontend/**: React + TypeScript web app for uploading papers, viewing workspaces, and interacting with the backend.

## Quick Start

### Backend
1. Go to the `backend` folder.
2. (Optional) Create and activate a virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`
3. Install dependencies:
   - `pip install -r requirements.txt`
4. Start the server:
   - `uvicorn app.main:app --reload`

### Frontend
1. Go to the `frontend` folder.
2. Install dependencies:
   - `npm install`
3. Start the development server:
   - `npm run dev`

## Features
- Upload and analyze research papers
- Generate code from paper instructions using AI
- Manage workspaces and track status

## Requirements
- Python 3.8+
- Node.js 18+

## Notes
- Configure your API keys and environment variables as needed in the backend.
- For more details, see the `backend/README.md` and `frontend/README.md` files.
