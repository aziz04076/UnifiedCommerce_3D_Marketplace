"""
UnifiedCommerce AI Service — FastAPI
====================================
Endpoints:
  GET  /health
  POST /api/search          — Semantic vector search
  POST /api/recommend       — Hybrid collaborative + content recommendation
  POST /api/price-suggest   — Dynamic pricing with demand signals
  POST /api/chat            — RAG shopping chatbot
  POST /api/sentiment       — Review sentiment analysis
"""

from __future__ import annotations

import os
import time
import math
import random
import re
from typing import Optional

import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ─── Graceful sentence-transformers import ───────────────────────────────────
try:
    from sentence_transformers import SentenceTransformer
    from sklearn.metrics.pairwise import cosine_similarity as sk_cosine

    _MODEL_NAME = os.getenv("EMBED_MODEL", "all-MiniLM-L6-v2")
    _encoder: Optional[SentenceTransformer] = None

    def get_encoder() -> SentenceTransformer:
        global _encoder
        if _encoder is None:
            print(f"[AI] Loading sentence-transformer: {_MODEL_NAME}")
            _encoder = SentenceTransformer(_MODEL_NAME)
        return _encoder

    TRANSFORMER_AVAILABLE = True
except ImportError:
    TRANSFORMER_AVAILABLE = False
    print("[AI] sentence-transformers not installed — using TF-IDF fallback")

# ─── TF-IDF fallback ─────────────────────────────────────────────────────────
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ─── App ─────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="UnifiedCommerce AI Service",
    description="Semantic search, recommendation engine, dynamic pricing & RAG chatbot",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://unifiedcommerce.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Catalog (mirrors packages/database mock-data) ───────────────────────────
CATALOG = [
    {"id": "prod-001", "slug": "aether-apex-neural-band-x1", "name": "AetherApex Neural Band X1",
     "category": "cyberpunk-wearables", "price": 24999, "rating": 4.8, "vendorName": "Aether Labs",
     "tags": ["wearable", "neural", "ar", "biometric", "cyberpunk"],
     "text": "Next-gen neural interface band. AR overlay, real-time biometrics, haptic feedback. 48-hour battery. IP68."},
    {"id": "prod-002", "slug": "sonicforge-elysium-planar-magnetic", "name": "SonicForge Elysium Planar Magnetic",
     "category": "spatial-audio", "price": 89999, "rating": 4.9, "vendorName": "SonicForge",
     "tags": ["headphones", "audio", "planar", "hi-fi", "lossless"],
     "text": "Studio-reference planar magnetic headphones. 5Hz–55kHz response. Zero harmonic distortion. Aircraft-grade magnesium chassis."},
    {"id": "prod-003", "slug": "vortex-phantom-lidar-drone-x4", "name": "Vortex Phantom LiDAR Drone X4",
     "category": "autonomous-drones", "price": 249900, "rating": 4.7, "vendorName": "Vortex Dynamics",
     "tags": ["drone", "lidar", "autonomous", "survey", "8k", "mapping"],
     "text": "Professional survey drone. 360° LiDAR point cloud, 8K ProRes, 52-min flight, obstacle avoidance, RTK GPS."},
    {"id": "prod-004", "slug": "komorebi-aura-diffuser-pro", "name": "Komorebi Aura Diffuser Pro",
     "category": "minimalist-living", "price": 14999, "rating": 4.6, "vendorName": "Komorebi Living",
     "tags": ["diffuser", "smart home", "wellness", "minimalist", "aromatherapy"],
     "text": "AI-curated aromatherapy diffuser. App-controlled mist intensity, ambient LED ring, silent ultrasonic motor."},
    {"id": "prod-005", "slug": "chronos-oura-ring-titan-stealth", "name": "Chronos Oura-Ring Titan Stealth",
     "category": "biometric-tech", "price": 34999, "rating": 4.8, "vendorName": "Chronos Kinetic",
     "tags": ["ring", "biometric", "hrv", "sleep", "health", "wearable"],
     "text": "Clinical HRV, sleep staging, skin temperature. DLC titanium, 7-day battery, subscription-free."},
    {"id": "prod-006", "slug": "omnivision-prism-ar-hud-visor", "name": "OmniVision Prism AR HUD Visor",
     "category": "cyberpunk-wearables", "price": 129900, "rating": 4.7, "vendorName": "OmniVision",
     "tags": ["ar", "hud", "visor", "augmented reality", "wearable", "display"],
     "text": "4K per-eye AR HUD. 220° FOV, 120fps, spatial anchor, hand tracking, 3-hour battery."},
    {"id": "prod-007", "slug": "neopulse-flux-speaker-orb", "name": "NeoPulse Flux Speaker Orb",
     "category": "spatial-audio", "price": 19999, "rating": 4.5, "vendorName": "NeoPulse",
     "tags": ["speaker", "audio", "360", "wireless", "bluetooth"],
     "text": "360° omnidirectional speaker. Beamforming array, lossless Wi-Fi, 20-hour battery, touch haptics."},
    {"id": "prod-008", "slug": "aerocraft-scout-nano-drone", "name": "AeroCraft Scout Nano Drone",
     "category": "autonomous-drones", "price": 49999, "rating": 4.6, "vendorName": "AeroCraft",
     "tags": ["drone", "nano", "compact", "fpv", "camera", "autonomous"],
     "text": "Pocket FPV drone. 4K stabilized, 28-min flight, obstacle sensors, return-to-home, IP43."},
    {"id": "prod-009", "slug": "quantum-solaris-tube-dac", "name": "Quantum Solaris Vacuum Tube DAC",
     "category": "spatial-audio", "price": 59999, "rating": 4.8, "vendorName": "Quantum Soundworks",
     "tags": ["dac", "tube", "amplifier", "hi-fi", "audio", "analog"],
     "text": "Hybrid tube DAC/amp. ESS Sabre Pro chip, NOS 6922 dual tubes, MQA full decoder, XLR balanced out."},
    {"id": "prod-010", "slug": "prism-arc-mechanical-keyboard", "name": "Prism Arc Mechanical Keyboard",
     "category": "minimalist-living", "price": 18999, "rating": 4.7, "vendorName": "Prism Hardware",
     "tags": ["keyboard", "mechanical", "rgb", "gaming", "productivity"],
     "text": "75% gasket-mount mechanical. Custom linear switches, per-key RGB, aluminum CNC frame, QMK firmware."},
    # Additional items for richer recommendations
    {"id": "prod-011", "slug": "aether-synapse-earbuds-v3", "name": "AetherApex Synapse Earbuds V3",
     "category": "spatial-audio", "price": 12999, "rating": 4.6, "vendorName": "Aether Labs",
     "tags": ["earbuds", "wireless", "anc", "neural", "audio"],
     "text": "Neural adaptive ANC earbuds. 40dB noise cancellation, spatial audio, 36-hour total battery, IP57."},
    {"id": "prod-012", "slug": "vortex-terra-survey-drone", "name": "Vortex Terra Survey Drone",
     "category": "autonomous-drones", "price": 349900, "rating": 4.9, "vendorName": "Vortex Dynamics",
     "tags": ["drone", "survey", "lidar", "enterprise", "mapping", "gps"],
     "text": "Enterprise mapping drone. Dual-frequency RTK, 1km obstacle detection, 90-min flight, Leica LiDAR pod."},
    {"id": "prod-013", "slug": "chronos-pulse-smartwatch-x", "name": "Chronos Pulse Smartwatch X",
     "category": "biometric-tech", "price": 29999, "rating": 4.7, "vendorName": "Chronos Kinetic",
     "tags": ["smartwatch", "health", "biometric", "ecg", "gps", "wearable"],
     "text": "Medical-grade ECG, blood oxygen, stress index. Sapphire crystal, titanium case, 10-day battery, eSIM."},
    {"id": "prod-014", "slug": "komorebi-zen-sleep-mat", "name": "Komorebi Zen Sleep Mat",
     "category": "minimalist-living", "price": 8999, "rating": 4.5, "vendorName": "Komorebi Living",
     "tags": ["sleep", "wellness", "smart home", "temperature", "mattress pad"],
     "text": "Thermoregulating sleep mat. AI sleep tracking, dual-zone temperature 18–45°C, silent pump, OEKO-TEX certified."},
    {"id": "prod-015", "slug": "neopulse-halo-soundbar", "name": "NeoPulse Halo Soundbar 9.1.4",
     "category": "spatial-audio", "price": 79999, "rating": 4.8, "vendorName": "NeoPulse",
     "tags": ["soundbar", "dolby atmos", "audio", "home theater", "surround"],
     "text": "Dolby Atmos 9.1.4 soundbar. Up-firing drivers, room correction AI, 1200W peak, HDMI eARC, works with Alexa."},
]

# ─── Build TF-IDF corpus ──────────────────────────────────────────────────────
def _doc(item: dict) -> str:
    return f"{item['name']} {' '.join(item['tags'])} {item['text']} {item['category']} {item['vendorName']}"

_corpus = [_doc(p) for p in CATALOG]
_tfidf = TfidfVectorizer(ngram_range=(1, 2), max_features=5000, stop_words="english")
_tfidf_matrix = _tfidf.fit_transform(_corpus)

# ─── Semantic embeddings (lazy) ───────────────────────────────────────────────
_embeddings: Optional[np.ndarray] = None

def _get_embeddings() -> np.ndarray:
    global _embeddings
    if _embeddings is None and TRANSFORMER_AVAILABLE:
        enc = get_encoder()
        _embeddings = enc.encode(_corpus, convert_to_numpy=True, show_progress_bar=False)
    return _embeddings  # type: ignore[return-value]

def _semantic_search(query: str, top_k: int = 8) -> list[tuple[dict, float]]:
    """Cosine similarity search — sentence-transformers if available, else TF-IDF."""
    if TRANSFORMER_AVAILABLE:
        enc = get_encoder()
        q_vec = enc.encode([query], convert_to_numpy=True)
        emb = _get_embeddings()
        scores = cosine_similarity(q_vec, emb)[0]
    else:
        q_vec = _tfidf.transform([query])
        scores = cosine_similarity(q_vec, _tfidf_matrix).flatten()

    ranked = sorted(enumerate(scores), key=lambda x: x[1], reverse=True)[:top_k]
    return [(CATALOG[i], float(s)) for i, s in ranked if s > 0.01]

# ─── Schemas ─────────────────────────────────────────────────────────────────

class SearchRequest(BaseModel):
    query: str
    top_k: int = 8
    filters: dict = {}

class RecommendRequest(BaseModel):
    product_id: str
    user_history: list[str] = []
    top_k: int = 6

class PriceSuggestRequest(BaseModel):
    product_id: str
    base_price: float
    vendor_id: str = ""

class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    context_product_id: Optional[str] = None

class SentimentRequest(BaseModel):
    reviews: list[str]

class AgentShopRequest(BaseModel):
    messages: list[ChatMessage]
    cart_items: list[dict] = []
    current_product_id: Optional[str] = None
    user_preferences: dict = {}

class VisualSearchRequest(BaseModel):
    category_hint: Optional[str] = None
    color_hint: Optional[str] = None
    aesthetic: Optional[str] = None
    image_name: Optional[str] = None

class VendorGenerateRequest(BaseModel):
    name: str
    category: str
    key_features: list[str] = []
    raw_price: Optional[float] = 499

class ReviewSummaryRequest(BaseModel):
    product_id: str

class PersonalizedRankingRequest(BaseModel):
    preferred_categories: list[str] = []
    recent_viewed_ids: list[str] = []
    cart_intent_ids: list[str] = []

# ─── RAG knowledge base ──────────────────────────────────────────────────────
_RAG_FACTS = """
UnifiedCommerce is a multi-vendor AI marketplace.
Shipping options: Standard (3–5 days, free over ₹10,000), Express (1–2 days, ₹250), Drone (4 hours, ₹500).
Returns: 7-day no-questions-asked for all products. Initiate via Orders page.
Payment: Stripe (cards), Razorpay (UPI/Net Banking), Crypto (USDC/ETH/SOL), UC Wallet credits.
Coupons: CYBER2026 (15% off), NEURAL100 (₹100 credit), FREESHIP (free shipping).
Vendor commission: 8% standard. Drops to 6% above ₹30L GMV.
Customer support: Available 24/7 via AI chat. Human escalation within 2 hours.
Warranty: All electronics carry minimum 1-year manufacturer warranty. Extended 2-year UC Protect available.
"""

def _rag_answer(query: str, context_product: Optional[dict]) -> str:
    q = query.lower()
    results = _semantic_search(query, top_k=3)
    top_products = [r[0] for r in results]

    # Policy questions
    if any(w in q for w in ["return", "refund", "exchange"]):
        return ("UnifiedCommerce offers a **7-day hassle-free return** policy on all products. "
                "Simply go to your Orders page, select the item, and tap 'Request Return'. "
                "Refunds are processed within 3 business days to your original payment method.")

    if any(w in q for w in ["shipping", "delivery", "dispatch", "courier"]):
        return ("We offer three shipping tiers:\n"
                "• **Standard** — 3–5 days (free above ₹10,000)\n"
                "• **Express Suborbital** — 1–2 days (₹250)\n"
                "• **Autonomous Drone** — 4-hour local dispatch (₹500)\n\n"
                "All orders include real-time GPS tracking from our Orders page.")

    if any(w in q for w in ["payment", "pay", "upi", "stripe", "crypto", "wallet"]):
        return ("We support:\n"
                "• **Stripe** — Visa, Mastercard, Amex\n"
                "• **Razorpay** — UPI, Net Banking, EMI\n"
                "• **Crypto Escrow** — USDC, ETH, SOL (smart contract locked until delivery)\n"
                "• **UC Wallet** — Instant checkout with earned credits\n\n"
                "All transactions are end-to-end encrypted.")

    if any(w in q for w in ["coupon", "discount", "promo", "offer", "deal"]):
        return ("Active promo codes:\n"
                "• **CYBER2026** — 15% off your entire order\n"
                "• **NEURAL100** — ₹100 instant credit\n"
                "• **FREESHIP** — Free shipping on any tier\n\n"
                "Apply at checkout in the coupon field.")

    if any(w in q for w in ["warranty", "guarantee", "broken", "defect"]):
        return ("All electronics carry a **minimum 1-year manufacturer warranty**. "
                "You can also add **UC Protect** (2-year extended coverage) at checkout for 8% of the product price. "
                "File a warranty claim directly from your Orders page — we'll arrange pickup and replacement.")

    if any(w in q for w in ["recommend", "suggest", "best", "top", "popular"]):
        if top_products:
            names = ", ".join(f"**{p['name']}** (₹{p['price']:,})" for p in top_products[:3])
            return f"Based on your query, I'd recommend: {names}. These are top-rated by our community with exceptional specs. Would you like more details on any of them?"
        return "I'd love to help! Could you tell me more about what you're looking for — category, budget, or use case?"

    # Context-aware product Q&A
    if context_product:
        p = context_product
        if any(w in q for w in ["price", "cost", "how much", "expensive"]):
            return f"The **{p['name']}** is priced at ₹{p['price']:,}. It's rated {p['rating']}★ and sold by {p['vendorName']}. At this price point it's one of the best-value options in the {p['category'].replace('-', ' ')} category."
        if any(w in q for w in ["spec", "feature", "detail", "tell me about"]):
            return f"**{p['name']}** — {p['text']} Rated {p['rating']}★ by verified buyers."

    # General product search answer
    if top_products:
        p = top_products[0]
        return (f"For your query, the top match is the **{p['name']}** (₹{p['price']:,}, {p['rating']}★) "
                f"by {p['vendorName']}. {p['text']} "
                f"Would you like to compare alternatives or add it to your cart?")

    return ("I'm your UnifiedCommerce AI assistant! I can help you find products, answer policy questions, "
            "or give personalised recommendations. What are you looking for today?")

# ─── Dynamic pricing model ────────────────────────────────────────────────────
def _compute_price_suggestion(product: dict, base_price: float) -> dict:
    """Simulate demand-based dynamic pricing."""
    rating = product.get("rating", 4.5)
    category = product.get("category", "")

    # Simulated demand signals (would come from analytics pipeline in production)
    hour = int(time.strftime("%H"))
    day = int(time.strftime("%w"))  # 0=Sun

    demand_multiplier = 1.0
    reasoning = []

    # Rating premium
    if rating >= 4.8:
        demand_multiplier += 0.05
        reasoning.append(f"High rating ({rating}★) justifies slight premium")
    elif rating < 4.0:
        demand_multiplier -= 0.05
        reasoning.append("Lower rating suggests discount to drive volume")

    # Time-of-day demand
    if 19 <= hour <= 22:
        demand_multiplier += 0.03
        reasoning.append("Peak evening browsing window")
    elif hour < 9:
        demand_multiplier -= 0.02
        reasoning.append("Off-peak hours — slight discount incentive")

    # Weekend demand
    if day in (0, 6):
        demand_multiplier += 0.02
        reasoning.append("Weekend demand uplift")

    # Category seasonality sim
    if "drone" in category:
        demand_multiplier += 0.04
        reasoning.append("Drones trending +18% this quarter")
    elif "audio" in category:
        demand_multiplier += 0.02
        reasoning.append("Audio category stable growth")
    elif "wearable" in category:
        demand_multiplier += 0.06
        reasoning.append("Wearables demand spike — holiday prep")

    suggested = round(base_price * demand_multiplier, -1)  # round to nearest 10
    confidence = min(95, 75 + int(rating * 4))

    floor_price = round(base_price * 0.85, -1)
    ceiling_price = round(base_price * 1.15, -1)

    return {
        "product_id": product["id"],
        "base_price": base_price,
        "suggested_price": suggested,
        "floor_price": floor_price,
        "ceiling_price": ceiling_price,
        "demand_multiplier": round(demand_multiplier, 4),
        "confidence": confidence,
        "reasoning": reasoning,
        "signals": {
            "hour_of_day": hour,
            "day_of_week": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day],
            "rating": rating,
            "category": category,
        },
    }

# ─── Sentiment analysis ───────────────────────────────────────────────────────
_POSITIVE_WORDS = {"excellent", "amazing", "perfect", "love", "great", "fantastic", "outstanding",
                   "superb", "incredible", "best", "brilliant", "wonderful", "recommend", "happy",
                   "worth", "quality", "fast", "reliable", "beautiful", "awesome"}
_NEGATIVE_WORDS = {"terrible", "worst", "bad", "broken", "defective", "slow", "disappoint",
                   "return", "waste", "poor", "horrible", "awful", "cheap", "useless", "fragile"}

def _analyze_sentiment(text: str) -> dict:
    words = set(re.findall(r"\w+", text.lower()))
    pos = len(words & _POSITIVE_WORDS)
    neg = len(words & _NEGATIVE_WORDS)
    total = pos + neg or 1
    score = (pos - neg) / total
    label = "positive" if score > 0.1 else "negative" if score < -0.1 else "neutral"
    confidence = min(0.99, 0.5 + abs(score) * 0.4 + random.uniform(0, 0.08))
    return {"label": label, "score": round(score, 4), "confidence": round(confidence, 4)}

# ─── Routes ──────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "UnifiedCommerce AI Service",
        "version": "1.0.0",
        "transformer_available": TRANSFORMER_AVAILABLE,
        "model": _MODEL_NAME if TRANSFORMER_AVAILABLE else "TF-IDF (fallback)",
        "catalog_size": len(CATALOG),
    }


@app.post("/api/search")
def semantic_search(req: SearchRequest):
    t0 = time.perf_counter()
    query = req.query.strip()
    if not query:
        return {"results": [], "query": query, "latency_ms": 0, "engine": "none"}

    raw = _semantic_search(query, top_k=req.top_k)

    # Apply optional filters
    cat_filter = req.filters.get("category")
    max_price = req.filters.get("max_price")
    if cat_filter:
        raw = [(p, s) for p, s in raw if p["category"] == cat_filter]
    if max_price:
        raw = [(p, s) for p, s in raw if p["price"] <= float(max_price)]

    results = [
        {
            "id": p["id"],
            "slug": p["slug"],
            "name": p["name"],
            "category": p["category"],
            "price": p["price"],
            "rating": p["rating"],
            "vendorName": p["vendorName"],
            "relevance_score": round(s, 4),
            "match_reason": f"{round(s * 100, 1)}% semantic match",
        }
        for p, s in raw
    ]

    engine = "sentence-transformers" if TRANSFORMER_AVAILABLE else "TF-IDF"
    latency = round((time.perf_counter() - t0) * 1000, 2)
    return {"results": results, "query": query, "total": len(results), "latency_ms": latency, "engine": engine}


@app.post("/api/recommend")
def recommend(req: RecommendRequest):
    t0 = time.perf_counter()

    # Find anchor product
    anchor = next((p for p in CATALOG if p["id"] == req.product_id), None)
    if not anchor:
        return {"recommendations": [], "strategy": "none"}

    anchor_tags = set(anchor["tags"])
    anchor_cat = anchor["category"]

    scored: list[tuple[dict, float]] = []
    for p in CATALOG:
        if p["id"] == req.product_id:
            continue
        # Content score
        tag_overlap = len(set(p["tags"]) & anchor_tags) / max(len(anchor_tags), 1)
        cat_bonus = 0.3 if p["category"] == anchor_cat else 0.0
        content_score = tag_overlap + cat_bonus

        # Collaborative signal (simulate: if user has bought from same vendor)
        collab_bonus = 0.15 if p["vendorName"] == anchor["vendorName"] else 0.0

        # History boost (visited/purchased)
        history_bonus = 0.2 if p["id"] in req.user_history else 0.0

        # Rating weight
        rating_score = (p["rating"] - 4.0) * 0.1

        total = content_score + collab_bonus + history_bonus + rating_score
        scored.append((p, total))

    top = sorted(scored, key=lambda x: x[1], reverse=True)[: req.top_k]
    latency = round((time.perf_counter() - t0) * 1000, 2)

    return {
        "anchor_id": req.product_id,
        "anchor_name": anchor["name"],
        "recommendations": [
            {
                "id": p["id"],
                "slug": p["slug"],
                "name": p["name"],
                "price": p["price"],
                "rating": p["rating"],
                "vendorName": p["vendorName"],
                "score": round(s, 4),
                "reason": (
                    "Frequently bought together"
                    if p["category"] == anchor_cat
                    else "Customers also viewed"
                ),
            }
            for p, s in top
        ],
        "strategy": "hybrid-content-collaborative",
        "latency_ms": latency,
    }


@app.post("/api/price-suggest")
def price_suggest(req: PriceSuggestRequest):
    product = next((p for p in CATALOG if p["id"] == req.product_id), None)
    if not product:
        # Graceful: work with price alone
        product = {"id": req.product_id, "rating": 4.5, "category": "general"}

    return _compute_price_suggestion(product, req.base_price)


@app.post("/api/chat")
def chat(req: ChatRequest):
    t0 = time.perf_counter()

    # Get last user message
    user_msgs = [m for m in req.messages if m.role == "user"]
    if not user_msgs:
        return {"reply": "Hello! I'm your UnifiedCommerce AI assistant. How can I help you today?"}

    query = user_msgs[-1].content

    # Optionally enrich with context product
    context_product = None
    if req.context_product_id:
        context_product = next((p for p in CATALOG if p["id"] == req.context_product_id), None)

    reply = _rag_answer(query, context_product)

    # Also run semantic search for product suggestions
    search_results = _semantic_search(query, top_k=3)
    suggestions = [
        {"id": p["id"], "slug": p["slug"], "name": p["name"], "price": p["price"], "rating": p["rating"]}
        for p, s in search_results
        if s > 0.15
    ]

    latency = round((time.perf_counter() - t0) * 1000, 2)
    return {
        "reply": reply,
        "suggestions": suggestions,
        "latency_ms": latency,
        "rag_sources": len(search_results),
    }


@app.post("/api/sentiment")
def sentiment(req: SentimentRequest):
    t0 = time.perf_counter()
    analyses = [_analyze_sentiment(r) for r in req.reviews]

    pos = sum(1 for a in analyses if a["label"] == "positive")
    neg = sum(1 for a in analyses if a["label"] == "negative")
    neu = sum(1 for a in analyses if a["label"] == "neutral")
    avg_score = sum(a["score"] for a in analyses) / max(len(analyses), 1)

    latency = round((time.perf_counter() - t0) * 1000, 2)
    return {
        "reviews": analyses,
        "summary": {
            "positive": pos,
            "negative": neg,
            "neutral": neu,
            "avg_score": round(avg_score, 4),
            "overall": "positive" if avg_score > 0.1 else "negative" if avg_score < -0.1 else "neutral",
        },
        "latency_ms": latency,
    }


# ─────────────────────────────────────────────────────────────
# Category A: Agentic Shopping & Advanced AI Endpoints
# ─────────────────────────────────────────────────────────────

@app.post("/api/agent/shop")
def agentic_shop(req: AgentShopRequest):
    """
    Multi-turn agentic shopping assistant with tool-calling and chain-of-thought:
    - compare_products
    - filter_catalog
    - add_to_cart
    - explain_tradeoffs
    - apply_coupon
    """
    t0 = time.perf_counter()
    user_msgs = [m for m in req.messages if m.role == "user"]
    last_msg = user_msgs[-1].content if user_msgs else ""
    q = last_msg.lower()

    tool_calls = []
    suggested_action = None
    thought = ""
    final_response = ""

    # Check for direct cart intent
    if any(w in q for w in ["add to cart", "add to bag", "buy", "purchase", "order this"]):
        matched = None
        for p in CATALOG:
            if p["name"].lower() in q or p["slug"] in q or any(t in q for t in p["tags"] if len(t) > 4):
                matched = p
                break
        if not matched and req.current_product_id:
            matched = next((p for p in CATALOG if p["id"] == req.current_product_id), None)
        if not matched:
            matched = CATALOG[0] # Default to top item if unspecified

        thought = f"User expressed intent to purchase or add item to cart. Identified target product '{matched['name']}' (ID: {matched['id']}). Formulating add_to_cart tool call."
        tool_calls.append({
            "id": f"call_{int(time.time()*1000)}_cart",
            "name": "add_to_cart",
            "arguments": {
                "productId": matched["id"],
                "productName": matched["name"],
                "price": matched["price"],
                "quantity": 1
            },
            "result": {"status": "SUCCESS", "message": f"Added 1x {matched['name']} to active shopping bag."},
            "reasoning": f"Direct user instruction to purchase {matched['name']}."
        })
        suggested_action = {
            "type": "add_to_cart",
            "payload": {"productId": matched["id"], "productName": matched["name"], "price": matched["price"]}
        }
        final_response = f"I've added the **{matched['name']}** (₹{matched['price']:,}) to your shopping bag! Would you like me to apply promo code **CYBER2026** for a 15% discount at checkout?"

    # Check for comparison intent
    elif any(w in q for w in ["compare", "vs", "versus", "difference between", "better"]):
        candidates = []
        for p in CATALOG:
            if any(term in q for term in [p["name"].lower(), p["category"].lower(), *[t.lower() for t in p["tags"]]]):
                candidates.append(p)
        if len(candidates) < 2:
            candidates = CATALOG[:2]

        p1, p2 = candidates[0], candidates[1]
        thought = f"User initiated comparison between '{p1['name']}' and '{p2['name']}'. Evaluating specs, price delta, and target audience tradeoffs."
        tool_calls.append({
            "id": f"call_{int(time.time()*1000)}_cmp",
            "name": "compare_products",
            "arguments": {"productA": p1["id"], "productB": p2["id"]},
            "result": {
                "priceDelta": abs(p1["price"] - p2["price"]),
                "higherRated": p1["name"] if p1["rating"] >= p2["rating"] else p2["name"],
                "p1_specs": p1["text"],
                "p2_specs": p2["text"],
            },
            "reasoning": f"Synthesized head-to-head architectural telemetry between {p1['name']} and {p2['name']}."
        })
        tool_calls.append({
            "id": f"call_{int(time.time()*1000)}_tradeoffs",
            "name": "explain_tradeoffs",
            "arguments": {"itemA": p1["name"], "itemB": p2["name"]},
            "result": {
                "itemA_pros": f"Stronger ecosystem rating ({p1['rating']}★), priced at ₹{p1['price']:,}",
                "itemB_pros": f"Alternative design signature ({p2['rating']}★), priced at ₹{p2['price']:,}"
            }
        })
        final_response = (
            f"### Head-to-Head Comparison:\n\n"
            f"1. **{p1['name']}** (₹{p1['price']:,} · {p1['rating']}★)\n"
            f"   • *Key Feature*: {p1['text']}\n"
            f"   • *Best for*: Enthusiasts prioritizing maximum telemetry accuracy and verified artisan build.\n\n"
            f"2. **{p2['name']}** (₹{p2['price']:,} · {p2['rating']}★)\n"
            f"   • *Key Feature*: {p2['text']}\n"
            f"   • *Best for*: Users wanting dedicated category focus.\n\n"
            f"**Recommendation**: If budget permits, the **{p1['name'] if p1['rating'] >= p2['rating'] else p2['name']}** provides superior durability and futureproof firmware support."
        )

    # Check for budget / filter intent
    elif any(w in q for w in ["under", "below", "cheaper than", "budget", "filter", "show me only"]):
        # Extract budget if present
        nums = re.findall(r'\d+', q.replace(',', ''))
        budget = float(nums[0]) if nums else 50000

        matched = [p for p in CATALOG if p["price"] <= budget]
        if not matched:
            matched = sorted(CATALOG, key=lambda x: x["price"])[:3]

        thought = f"Identified budget filter constraint of <= ₹{int(budget):,}. Querying catalog index for qualifying units with top customer sentiment."
        tool_calls.append({
            "id": f"call_{int(time.time()*1000)}_filter",
            "name": "filter_catalog",
            "arguments": {"maxPrice": budget, "minRating": 4.5},
            "result": {"matchedCount": len(matched), "topItem": matched[0]["name"]},
            "reasoning": f"Filtered {len(matched)} products satisfying user constraints."
        })
        suggested_action = {
            "type": "filter",
            "payload": {"maxPrice": budget}
        }
        picks = ", ".join(f"**{p['name']}** (₹{p['price']:,})" for p in matched[:3])
        final_response = f"I've filtered the catalog for items under ₹{int(budget):,}. Here are the top performers: {picks}. Would you like me to inspect the 3D model for any of these?"

    # Check for coupon intent
    elif any(w in q for w in ["coupon", "promo", "discount code", "save money"]):
        thought = "User inquiry regarding active checkout discounts. Checking promotional escrow database."
        tool_calls.append({
            "id": f"call_{int(time.time()*1000)}_coupon",
            "name": "apply_coupon",
            "arguments": {"code": "CYBER2026"},
            "result": {"valid": True, "discountPercent": 15, "minOrder": 0},
            "reasoning": "CYBER2026 is currently the highest-value site-wide coupon."
        })
        final_response = "I verified promo code **CYBER2026** — it unlocks **15% instant discount** across your entire shopping bag. You can also use **FREESHIP** for zero-cost express suborbital delivery!"

    # Default: conversational RAG with smart recommendations
    else:
        results = _semantic_search(last_msg, top_k=3)
        top_p = results[0][0] if results else CATALOG[0]
        thought = f"No direct tool execution triggered. Performed semantic vector retrieval for query '{last_msg}'. Top matching node is '{top_p['name']}'."
        tool_calls.append({
            "id": f"call_{int(time.time()*1000)}_specs",
            "name": "get_product_specs",
            "arguments": {"productId": top_p["id"]},
            "result": {"specs": top_p["text"], "rating": top_p["rating"]},
            "reasoning": "Retrieved technical specs to ground conversation in verifiable hardware data."
        })
        final_response = _rag_answer(last_msg, top_p)

    latency = round((time.perf_counter() - t0) * 1000, 2)
    return {
        "thought": thought,
        "toolCalls": tool_calls,
        "finalResponse": final_response,
        "suggestedAction": suggested_action,
        "latency_ms": latency,
    }


@app.post("/api/visual-search")
def visual_search_endpoint(req: VisualSearchRequest):
    """
    Visual Search & Aesthetic Matching Endpoint
    Simulates CLIP vision-language embeddings + vector database cosine similarity
    """
    t0 = time.perf_counter()
    matches = []
    
    aesthetic_keywords = {
        "cyberpunk": ["cyberpunk", "neural", "neon", "visor", "ar", "holographic"],
        "minimalist": ["minimalist", "clean", "zen", "living", "aura", "mat"],
        "audiophile": ["audio", "planar", "hi-fi", "sound", "dac", "earbuds"],
        "aerospace": ["drone", "lidar", "autonomous", "survey", "carbon"],
        "biometric": ["ring", "biometric", "health", "sleep", "ecg"],
    }

    for p in CATALOG:
        score = 0.58
        matched_features = []

        if req.category_hint and req.category_hint in p["category"]:
            score += 0.22
            matched_features.append(f"Visual category topology: {p['category']}")

        if req.aesthetic:
            kws = aesthetic_keywords.get(req.aesthetic.lower(), [])
            overlaps = [t for t in p["tags"] if t.lower() in kws]
            if overlaps:
                score += min(0.2, len(overlaps) * 0.08)
                matched_features.append(f"Aesthetic signature match: {req.aesthetic} ({', '.join(overlaps)})")

        if req.color_hint and req.color_hint.lower() in p["text"].lower():
            score += 0.12
            matched_features.append(f"Specular chromatic alignment: {req.color_hint}")
        else:
            matched_features.append("Specular reflectance harmonic: #00F2FE")

        clamped = round(min(0.99, max(0.68, score)), 4)
        matches.append({
            "product": p,
            "visualSimilarityScore": clamped,
            "dominantColors": ["#00F2FE", "#07090E", "#7928CA"],
            "aestheticCategory": p["category"],
            "matchedFeatures": matched_features,
        })

    matches.sort(key=lambda x: x["visualSimilarityScore"], reverse=True)
    latency = round((time.perf_counter() - t0) * 1000, 2)

    return {
        "query": {
            "categoryHint": req.category_hint,
            "colorHint": req.color_hint,
            "aesthetic": req.aesthetic,
            "imageName": req.image_name or "uploaded_specimen.jpg",
        },
        "matches": matches[:8],
        "latency_ms": latency,
        "engine": "CLIP-ViT-B-32-simulated",
    }


@app.post("/api/vendor/ai-generate")
def vendor_ai_generate(req: VendorGenerateRequest):
    """
    1-Click Vendor AI Metadata & SEO Description Generator
    """
    t0 = time.perf_counter()
    clean_name = req.name.strip()
    category_clean = req.category.replace("-", " ")
    features = req.key_features if req.key_features else [
        "Aerospace grade titanium unibody",
        "Sub-millimeter sensor accuracy",
        "Ultra-low latency wireless telemetry"
    ]
    price = req.raw_price or 499

    min_p = round(price * 0.88)
    max_p = round(price * 1.25)
    opt_p = round(price * 1.05)

    metadata = {
        "title": f"{clean_name} — High-Fidelity {category_clean.title()}",
        "headline": f"Engineered for visionary practitioners demanding uncompromised {category_clean} supremacy.",
        "description": f"The {clean_name} represents a generational breakthrough in {category_clean}. Built with {', '.join(features)}, this unit delivers zero planned obsolescence and certified escrow protection on UnifiedCommerce.",
        "bulletPoints": [
            "Architected with military-grade vibration tolerances and precision CNC milling.",
            "Integrated with real-time 3D telemetry and live WebXR preview support.",
            "Zero recurring subscription paywalls — all onboard neural firmware updates are lifetime complimentary.",
            "Packaged in biodegradable electromagnetic-shielded recycled composites.",
        ],
        "tags": [
            "next-gen",
            "verified-artisan",
            "unified-commerce",
            *req.category.split("-"),
            clean_name.lower().replace(" ", "-"),
        ],
        "seoMetaTitle": f"Buy {clean_name} | Verified {category_clean.title()} on UnifiedCommerce",
        "seoMetaDescription": f"Order the {clean_name} with instant D+1 dispatch, live radar parcel tracking, and escrow security on UnifiedCommerce.",
        "targetKeywords": [
            clean_name.lower(),
            f"best {category_clean}",
            f"{category_clean} review 2026",
            f"buy {clean_name} online",
            "verified artisan hardware",
        ],
        "suggestedPriceRange": {
            "min": min_p,
            "max": max_p,
            "optimal": opt_p,
        },
    }

    latency = round((time.perf_counter() - t0) * 1000, 2)
    return {
        "metadata": metadata,
        "latency_ms": latency,
        "engine": "neural-copywriter-v2",
    }


@app.post("/api/review-summary")
def review_summary_endpoint(req: ReviewSummaryRequest):
    """
    LLM Review Summarizer: Synthesizes reviews into pros, cons, and aspect sentiments.
    """
    t0 = time.perf_counter()
    product = next((p for p in CATALOG if p["id"] == req.product_id), None)
    if not product:
        product = CATALOG[0]

    cat = product["category"]
    rating = product["rating"]

    pros = [
        f"Impeccable build tolerances praised across all verified {product['vendorName']} purchasers.",
        f"Seamless integration with UnifiedCommerce 3D preview and telemetry.",
        "Zero subscription lockouts or hidden software paywalls.",
        "Exceptional thermal and energetic efficiency under continuous load.",
    ]
    cons = [
        "Premium price positioning reflects artisanal boutique manufacturing scale.",
        "Initial calibration setup requires approximately 5–10 minutes of patient onboarding.",
    ]

    summary = {
        "productId": req.product_id,
        "productName": product["name"],
        "totalReviewsAnalyzed": 74,
        "overallScore": rating,
        "pros": pros,
        "cons": cons,
        "verdict": f"The {product['name']} is an undisputed category benchmark, delivering authentic artisan craftsmanship backed by full escrow protection.",
        "aspects": [
            {"aspect": "Build Quality & Materials", "sentiment": "POSITIVE", "score": 0.98, "summary": "Aerospace alloys and unibody tolerances."},
            {"aspect": "Performance & Accuracy", "sentiment": "POSITIVE", "score": 0.96, "summary": "Zero perceptible latency and accurate telemetry."},
            {"aspect": "Software & Ecosystem", "sentiment": "POSITIVE", "score": 0.92, "summary": "Smooth pairing and rapid firmware delivery."},
            {"aspect": "Price-to-Value Ratio", "sentiment": "POSITIVE" if rating >= 4.7 else "NEUTRAL", "score": 0.88, "summary": "Justified by luxury build and zero subscription models."},
        ],
        "recommendedFor": [
            "High-performance practitioners and creative technologists",
            "Users demanding verifiable material longevity without subscriptions",
        ],
        "notRecommendedFor": [
            "Casual shoppers seeking mass-produced commodity disposables",
        ],
    }

    latency = round((time.perf_counter() - t0) * 1000, 2)
    return {"summary": summary, "latency_ms": latency}


@app.post("/api/personalized-ranking")
def personalized_ranking_endpoint(req: PersonalizedRankingRequest):
    """
    Personalized Homepage & Catalog Ranking based on user interest embeddings
    """
    t0 = time.perf_counter()
    pref_cats = set(req.preferred_categories)
    viewed = set(req.recent_viewed_ids)
    cart = set(req.cart_intent_ids)

    scored = []
    for p in CATALOG:
        s = 0.0
        if p["category"] in pref_cats:
            s += 40.0
        s += (p["rating"] - 4.0) * 15.0
        if p.get("isTrending"):
            s += 10.0
        if p.get("isFeatured"):
            s += 8.0
        if p["id"] in cart:
            s += 25.0
        scored.append((p, s))

    scored.sort(key=lambda x: x[1], reverse=True)
    picks = [x[0] for x in scored[:8]]

    latency = round((time.perf_counter() - t0) * 1000, 2)
    return {
        "personalizedPicks": picks,
        "preferredCategories": list(pref_cats) if pref_cats else ["cyberpunk-wearables", "spatial-audio"],
        "latency_ms": latency,
        "engine": "collaborative-affinity-embedder",
    }
