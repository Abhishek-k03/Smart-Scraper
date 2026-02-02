# AI Web Scraper

A small project that scrapes website content, cleans it, and uses AI models to parse and extract structured data. The repo contains a Python FastAPI backend and a React + Vite frontend.

## Tech Stack

- **Backend:** Python, FastAPI, Uvicorn
- **Scraping / Parsing:** BeautifulSoup, lxml, Selenium, custom `scrape.py` and `parse.py`
- **AI Integrations:** Groq (via API key) and Ollama (local Ollama runtime via `langchain-ollama`)
- **Frontend:** React, Vite, Axios

## Features

- Scrape a target URL and return cleaned page content
- Parse scraped content using either Groq (remote API) or Ollama (local)\* (Setup local Ollama to use and add model as options in App.jsx)
- Minimal React UI to submit URLs and view parsed results

## Prerequisites

- Python 3.10+ installed
- Node.js + npm installed (for frontend)
- (Optional) Ollama running locally if you plan to use the `ollama` parser
- A Groq API key if you plan to use the `groq` parser

## Quick Start

1. Install backend dependencies

```bash
python -m pip install -r requirements.txt
```

2. Start the backend API (development)

```bash
# from project root
python backend_api.py
```

Alternatively run with Uvicorn directly:

```bash
uvicorn backend_api:app --reload --host 0.0.0.0 --port 8000
```

3. Install and run the frontend

```bash
cd frontend
npm install
npm run dev
```

The React frontend (Vite) will typically run on `http://localhost:5173` and the backend FastAPI on `http://localhost:8000`.

## API Endpoints

- `GET /` - Basic welcome message
- `GET /health` - Health check
- `POST /api/scrape` - Scrape a URL and return cleaned content
  - Body (JSON):

```json
{
  "url": "https://example.com"
}
```

- `POST /api/parse` - Parse provided content using AI
  - Body (JSON):

```json
{
  "content": "<cleaned html/text content>",
  "query": "Extract contact info",
  "model": "groq" // or "ollama"
}
```

Example curl (scrape):

```bash
curl -X POST http://localhost:8000/api/scrape -H "Content-Type: application/json" -d '{"url":"https://example.com"}'
```

Example curl (parse):

```bash
curl -X POST http://localhost:8000/api/parse -H "Content-Type: application/json" -d '{"content":"<text>","query":"List skills","model":"groq"}'
```

## Environment Variables

The project uses `python-dotenv`. Create a `.env` file in the project root to store secrets.

- `GROQ_API_KEY` — required if using the `groq` parser in `parse.py`
- (Optional) Any Ollama-related config — Ollama typically runs locally and `langchain-ollama` expects a local Ollama runtime

Example `.env`:

```env
GROQ_API_KEY=your_groq_api_key_here
# other keys as needed
```

## Troubleshooting

- If scraping returns empty content, check that the target page allows requests and that dynamic content is handled (Selenium is available in this project for JS-heavy pages).
- If `parse_with_groq` returns an error mentioning `GROQ_API_KEY`, ensure the key is set in `.env` or environment variables.
- If using Ollama and you see connection errors, ensure the Ollama service is running locally.

## Contributing

- Open issues for bugs or feature requests.
- For changes, create a PR against `main`.

## Files of interest

- `backend_api.py` — FastAPI backend and route handlers
- `scrape.py` — scraping helpers (BeautifulSoup / Selenium)
- `parse.py` — Groq and Ollama parsing logic
- `frontend/` — React + Vite frontend source

---

If you'd like, I can also add example Postman collections, or wire up a simple Docker Compose to run the frontend, backend, and an Ollama container together.
