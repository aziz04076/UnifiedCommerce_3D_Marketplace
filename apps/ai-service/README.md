# UnifiedCommerce AI Service

FastAPI-based AI microservice providing:

- **Semantic Search** — `sentence-transformers` embeddings (TF-IDF fallback)  
- **Hybrid Recommendations** — Content + collaborative filtering  
- **Dynamic Pricing** — Demand-signal-based price suggestions  
- **RAG Chatbot** — Policy-aware shopping assistant  
- **Sentiment Analysis** — Review sentiment scoring

## Running the service

```bash
# 1. Create & activate virtual environment
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # Mac/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the service
uvicorn main:app --reload --port 8000
```

The service starts on **http://localhost:8000**.  
Interactive API docs: **http://localhost:8000/docs**

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `AI_SERVICE_URL` | `http://localhost:8000` | Set in `apps/web/.env.local` to change the target |
| `EMBED_MODEL` | `all-MiniLM-L6-v2` | HuggingFace sentence-transformer model name |

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health + model status |
| POST | `/api/search` | Semantic product search |
| POST | `/api/recommend` | Hybrid product recommendations |
| POST | `/api/price-suggest` | Dynamic pricing suggestion |
| POST | `/api/chat` | RAG shopping chatbot |
| POST | `/api/sentiment` | Review sentiment batch analysis |

## Next.js integration

The Next.js frontend at `apps/web` calls these via API routes that automatically fall back to local heuristics if this service is offline:

- `POST /api/ai/search`
- `POST /api/ai/recommend`
- `POST /api/ai/price-suggest`
- `POST /api/ai/chat`
