import { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000";

function App() {
  const [url, setUrl] = useState("");
  const [scrapedContent, setScrapedContent] = useState("");
  const [contentLength, setContentLength] = useState(0);
  const [parseQuery, setParseQuery] = useState("");
  const [parsedResult, setParsedResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  // Main global message (for errors/success)
  const [message, setMessage] = useState({ type: "", text: "" });

  // NEW: Local message state specifically for the Sidebar
  const [sidebarHint, setSidebarHint] = useState("");

  const [progress, setProgress] = useState({ value: 0, text: "" });
  const [showDomContent, setShowDomContent] = useState(false);
  const [model, setModel] = useState("groq");
  const [stats, setStats] = useState({ scraped: 0, parsed: 0 });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // NEW: Helper to show sidebar hints
  const showExampleTip = (text) => {
    setSidebarHint(text);
    setTimeout(() => setSidebarHint(""), 5000);
  };

  const handleScrape = async () => {
    if (!url.trim()) {
      showMessage("error", "Please enter a URL");
      return;
    }

    setIsLoading(true);
    setProgress({ value: 25, text: "🕷️ Connecting to website..." });
    setScrapedContent("");
    setParsedResult("");

    try {
      setProgress({ value: 50, text: "🕷️ Scraping content..." });
      const response = await axios.post(`${API_URL}/api/scrape`, { url });
      setProgress({ value: 75, text: "🕷️ Processing content..." });

      if (response.data.success) {
        setScrapedContent(response.data.content);
        setContentLength(response.data.content_length);
        setProgress({ value: 100, text: "✅ Scraping complete!" });
        showMessage(
          "success",
          `Website scraped successfully! Content length: ${response.data.content_length} characters`,
        );
        setStats((prev) => ({ ...prev, scraped: prev.scraped + 1 }));
      } else {
        showMessage("error", response.data.error || "Failed to scrape website");
      }
    } catch (error) {
      console.error("Scrape error:", error);
      showMessage(
        "error",
        error.response?.data?.error ||
          "Failed to scrape website. Make sure the backend is running.",
      );
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress({ value: 0, text: "" }), 2000);
    }
  };

  const handleParse = async () => {
    if (!scrapedContent) {
      showMessage("error", "Please scrape a website first");
      return;
    }
    if (!parseQuery.trim()) {
      showMessage("error", "Please enter a query");
      return;
    }

    setIsParsing(true);
    setProgress({ value: 25, text: "🤖 Initializing AI processing..." });
    setParsedResult("");

    try {
      setProgress({ value: 50, text: "🤖 Analyzing content structure..." });
      const response = await axios.post(`${API_URL}/api/parse`, {
        content: scrapedContent,
        query: parseQuery,
        model: model,
      });

      setProgress({ value: 75, text: "🤖 Extracting information..." });

      if (response.data.success) {
        setParsedResult(response.data.result);
        setProgress({ value: 100, text: "✅ Parsing complete!" });
        showMessage("success", "Content parsed successfully!");
        setStats((prev) => ({ ...prev, parsed: prev.parsed + 1 }));
      } else {
        showMessage("error", response.data.error || "Failed to parse content");
      }
    } catch (error) {
      console.error("Parse error:", error);
      showMessage(
        "error",
        error.response?.data?.error ||
          "Failed to parse content. Make sure the backend and AI service are running.",
      );
    } finally {
      setIsParsing(false);
      setTimeout(() => setProgress({ value: 0, text: "" }), 2000);
    }
  };

  const handleReset = () => {
    setUrl("");
    setScrapedContent("");
    setContentLength(0);
    setParseQuery("");
    setParsedResult("");
    setMessage({ type: "", text: "" });
    setSidebarHint(""); // Clear sidebar hint too
    setProgress({ value: 0, text: "" });
    showMessage("success", "Reset complete!");
  };

  const handleClearResults = () => {
    setParsedResult("");
    setParseQuery("");
    showMessage("success", "Results cleared!");
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>Smart Scraper</h1>
        <p> Don't just scrap, scrap smart! 😉</p>
        <p>Get AI-powered insights from your scraped data!</p>
      </header>

      <div className="main-content">
        {/* Main Column */}
        <main>
          {/* URL Input Card */}
          <div className="card">
            <h2 className="section-header">🌐 Enter Website URL</h2>

            <div className="input-group">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                disabled={isLoading}
              />
            </div>

            <div className="btn-group">
              <button
                className="btn"
                onClick={handleScrape}
                disabled={isLoading || !url.trim()}
              >
                {isLoading ? <span className="spinner"></span> : "🕷️"}
                {isLoading ? "Scraping..." : "Scrape Website"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleReset}
                disabled={isLoading || isParsing}
              >
                🔄 Reset
              </button>
            </div>

            {/* Progress Bar */}
            {progress.value > 0 && (
              <div className="progress-container">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress.value}%` }}
                  ></div>
                </div>
                <p className="progress-text">{progress.text}</p>
              </div>
            )}

            {/* Main Messages (Global) */}
            {message.text && (
              <div className={`alert alert-${message.type}`}>
                {message.type === "success" && "✅"}
                {message.type === "error" && "❌"}
                {message.type === "warning" && "⚠️"}
                {message.type === "info" && "ℹ️"}
                {message.text}
              </div>
            )}

            {/* DOM Content Preview */}
            {scrapedContent && (
              <>
                <div
                  className="collapsible-header"
                  onClick={() => setShowDomContent(!showDomContent)}
                >
                  <span>📄 View DOM Content ({contentLength} characters)</span>
                  <span>{showDomContent ? "▲" : "▼"}</span>
                </div>
                {showDomContent && (
                  <div className="dom-preview">
                    {scrapedContent.substring(0, 2000)}
                    {scrapedContent.length > 2000 && "..."}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Parse Content Card */}
          {scrapedContent && (
            <div className="card">
              <h2 className="section-header">🤖 Parse Content</h2>

              <div className="input-group">
                <label>
                  Describe what you want to parse from the scraped content
                </label>
                <textarea
                  value={parseQuery}
                  onChange={(e) => setParseQuery(e.target.value)}
                  placeholder="e.g., Extract all product names and prices, Find contact information, List all article titles..."
                  disabled={isParsing}
                />
              </div>

              <div className="input-group">
                <label>AI Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                >
                  <option value="groq">Groq (Fast - Llama 3.3 70B)</option>
                </select>
              </div>

              <div className="btn-group">
                <button
                  className="btn"
                  onClick={handleParse}
                  disabled={isParsing || !parseQuery.trim()}
                >
                  {isParsing ? <span className="spinner"></span> : "🚀"}
                  {isParsing ? "Parsing..." : "Parse Content"}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleClearResults}
                  disabled={isParsing}
                >
                  🗑️ Clear Results
                </button>
              </div>

              {/* Parsed Results */}
              {parsedResult && (
                <div className="results-container">
                  <h3>📋 Parsed Results</h3>
                  <div className="results-content">{parsedResult}</div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Sidebar */}
        <aside className="sidebar">
          {/* Settings */}
          <div className="card">
            <h3>⚙️ Settings</h3>
            <div className="settings-group">
              <label>
                <input type="checkbox" defaultChecked />
                Headless Mode
              </label>
            </div>
            <div className="input-group">
              <label>AI Model</label>
              <select value={model} onChange={(e) => setModel(e.target.value)}>
                <option value="groq">Groq (Llama 3.3 70B)</option>
              </select>
            </div>
          </div>

          {/* Statistics */}
          <div className="card">
            <h3>📊 Statistics</h3>
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-label">Websites Scraped</div>
                <div className="stat-value">{stats.scraped}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Content Parsed</div>
                <div className="stat-value">{stats.parsed}</div>
              </div>
            </div>
          </div>

          {/* Quick Examples */}
          <div className="card">
            <h3>💡 Quick Examples</h3>
            <button
              className="btn btn-secondary sidebar-btn"
              onClick={() =>
                showExampleTip(
                  "Try scraping a news website like CNN, BBC, or Reuters",
                )
              }
            >
              📰 News Website
            </button>
            <button
              className="btn btn-secondary sidebar-btn"
              onClick={() =>
                showExampleTip(
                  "Try scraping product information from Amazon, eBay, or Shopify stores",
                )
              }
            >
              🛒 E-commerce Site
            </button>
            <button
              className="btn btn-secondary sidebar-btn"
              onClick={() =>
                showExampleTip(
                  "Try scraping company information, contact details, or services",
                )
              }
            >
              🏢 Company Website
            </button>

            {/* NEW: Sidebar Hint appears here specifically */}
            {sidebarHint && (
              <div className="sidebar-hint fade-in">ℹ️ {sidebarHint}</div>
            )}
          </div>

          {/* Quick Tips */}
          <div className="card">
            <h3>⚡ Quick Tips</h3>
            <ul className="tip-list">
              <li>Keep headless mode ON for faster scraping</li>
              <li>Be specific in your extraction requests</li>
              <li>Try different AI models for better results</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="footer">
        Made with Fastapi, Selenium, and React. Powered by Groq AI Integration.
      </footer>
    </div>
  );
}

export default App;
