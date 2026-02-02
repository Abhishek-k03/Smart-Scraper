from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

from scrape import scrape_website, extract_body_content, clean_body_content
from parse import parse_with_groq, perse_with_Ollama

app = FastAPI(
    title="AI Web Scraper API",
    description="API for scraping websites and parsing content using AI",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store scraped content in memory (for demo purposes)
scraped_data = {}

class ScrapeRequest(BaseModel):
    url: str

class ParseRequest(BaseModel):
    content: str
    query: str
    model: Optional[str] = "groq"  # "groq" or "ollama"

class ScrapeResponse(BaseModel):
    success: bool
    content: Optional[str] = None
    content_length: Optional[int] = None
    error: Optional[str] = None

class ParseResponse(BaseModel):
    success: bool
    result: Optional[str] = None
    error: Optional[str] = None


@app.get("/")
async def root():
    return {"message": "AI Web Scraper API is running", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/api/scrape", response_model=ScrapeResponse)
async def scrape(request: ScrapeRequest):
    """Scrape a website and return cleaned content"""
    try:
        if not request.url:
            raise HTTPException(status_code=400, detail="URL is required")
        
        # Add protocol if missing
        url = request.url
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        print(f"Scraping URL: {url}")
        
        # Scrape the website
        html_content = scrape_website(url)
        
        if not html_content:
            return ScrapeResponse(
                success=False,
                error="Failed to scrape website. Please check the URL and try again."
            )
        
        # Extract and clean body content
        body_content = extract_body_content(html_content)
        cleaned_content = clean_body_content(body_content)
        
        if not cleaned_content:
            return ScrapeResponse(
                success=False,
                error="No content found on the website."
            )
        
        return ScrapeResponse(
            success=True,
            content=cleaned_content,
            content_length=len(cleaned_content)
        )
        
    except Exception as e:
        print(f"Scrape error: {str(e)}")
        return ScrapeResponse(
            success=False,
            error=f"Error scraping website: {str(e)}"
        )


@app.post("/api/parse", response_model=ParseResponse)
async def parse(request: ParseRequest):
    """Parse scraped content using AI"""
    try:
        if not request.content:
            raise HTTPException(status_code=400, detail="Content is required")
        
        if not request.query:
            raise HTTPException(status_code=400, detail="Query is required")
        
        print(f"Parsing content with query: {request.query}")
        print(f"Using model: {request.model}")
        
        # Use the appropriate parser
        if request.model == "ollama":
            result = perse_with_Ollama(request.content, request.query)
        else:
            result = parse_with_groq(request.content, request.query)
        
        if not result or result == "No matching information found":
            return ParseResponse(
                success=True,
                result="No matching information found. Try being more specific in your query."
            )
        
        return ParseResponse(
            success=True,
            result=result
        )
        
    except Exception as e:
        print(f"Parse error: {str(e)}")
        return ParseResponse(
            success=False,
            error=f"Error parsing content: {str(e)}"
        )


if __name__ == "__main__":
    print("Starting AI Web Scraper API...")
    print("API will be available at: http://localhost:8000")
    print("API docs available at: http://localhost:8000/docs")
    uvicorn.run("backend_api:app", host="0.0.0.0", port=8000, reload=True)
