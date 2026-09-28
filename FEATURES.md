# UnifiedCommerce — Advanced Differentiation Feature Matrix

This document tracks each advanced capability implemented in UnifiedCommerce, detailing what it accomplishes, how to test it, the underlying architectural concepts demonstrated, and required services/keys.

---

## Shared Package Architecture Foundation

Before feature layer activation, the core shared packages referenced in `tsconfig.base.json` were formalized:

- **`packages/types`**: Shared Zod schemas (`ProductSchema`, `OrderSchema`, `VendorSchema`, `AgentActionPlanSchema`, `ReviewSummarySchema`, `VisualSearchMatchSchema`) with fully inferred TypeScript types, providing end-to-end runtime type safety across Web, API, and the AI microservice.
- **`packages/database`**: Typed in-memory query engine, realistic 50-item hardware catalog, review synthesis engine, and visual matching algorithms.
- **`packages/ui`**: Shared component system with Obsidian-and-Neon design tokens (`tokens.ts`), spring physics motion presets, frosted glassmorphism primitives, and 3D WebGL canvases.

---

## Category A: AI Depth (High-Level Intelligence Layer)

### 1. Agentic AI Shopping Assistant (ARIA 2.0)
- **What it does**: A multi-turn autonomous shopping agent that goes far beyond basic Q&A. ARIA parses natural user intent, formulates a chain-of-thought hypothesis, executes structured tool calls (`compare_products`, `filter_catalog`, `add_to_cart`, `explain_tradeoffs`), and directly triggers reactive frontend actions (such as dispatching cart mutations).
- **Technical concepts demonstrated**:
  - **Function Calling / Tool Execution**: Structured tool schemas with deterministic JSON parameters and execution results.
  - **Chain-of-Thought Transparency**: Exposes reasoning traces in an expandable UI drawer (`thought` telemetry).
  - **Client-Side State Mutation via AI**: The agent doesn't just chat — it dispatches `useCart().addToCart(...)` in real-time when the user says "add this to my bag".
  - **Graceful Degradation**: Real-time proxy to Python FastAPI `/api/agent/shop` with sub-3ms local heuristics fallback if the microservice is offline.
- **How to test**:
  1. Open any page and click the floating AI Bot button on the bottom right.
  2. Ask: *"Compare Neural Band and Elysium Planar"* → Inspect the generated comparison matrix and click the *"Chain-of-Thought"* toggle to view reasoning.
  3. Ask: *"Add AetherApex Neural Band to my cart"* → Observe the automatic cart addition toast and badge update.
  4. Ask: *"Find hardware under ₹50,000"* → Observe the budget-filtered recommendations.

---

### 2. Visual Search & Aesthetic Vector Matching
- **What it does**: Allows users to find products matching specific aesthetic signatures, chromatic palettes, or uploaded images. Emulates CLIP vision-language embeddings and vector similarity retrieval.
- **Technical concepts demonstrated**:
  - **Multimodal Vector Search**: Maps visual representations (chromatic harmonics, industrial design contours) to catalog vectors.
  - **Cosine Similarity Ranking**: Computes match percentages (e.g. `86.4% Match`) and dominant color palettes (`#00F2FE`, `#7928CA`).
- **How to test**:
  1. On the homepage hero, click the **"Visual Search"** camera button (or click the camera icon in ARIA's header).
  2. Select an aesthetic preset (*"Cybernetic AR / HUD"*, *"Studio Planar Acoustic"*, *"Toroidal LiDAR Drone"*, *"Minimalist Japandi Living"*) or drag-and-drop an image.
  3. View the ranked visual similarity scores and click **"View 3D Studio"** to jump directly into the product's 3D orbit viewer.

---

### 3. Review Summarization & Aspect Performance Index
- **What it does**: Synthesizes dozens of verified buyer reviews into an executive verdict, bulleted pros and cons, and an aspect-based performance breakdown (Build Quality, Sensor Fidelity, Ecosystem Integration, Price-to-Value).
- **Technical concepts demonstrated**:
  - **Aspect-Based Sentiment Analysis (ABSA)**: Deconstructs unstructured customer feedback into domain-specific dimensions with individual satisfaction metrics.
  - **Zero-Latency Server-Side Pre-Rendering**: Integrated directly into all 50 product detail pages (`/products/[slug]`).
- **How to test**:
  1. Navigate to `/products/aether-apex-neural-band-x1` (or any product page).
  2. Scroll to the **"Customer Telemetry & Reviews"** section.
  3. Inspect the **"AI Consensus & Review Synthesis"** panel displaying verified review volume, primary strengths, considerations, and aspect progress bars.

---

### 4. Vendor AI Listing Copywriter & SEO Generator
- **What it does**: Gives vendors a 1-click neural assistant that generates commercial product titles, high-conversion headlines, technical descriptions, bullet points, target SEO keywords, and algorithmic price corridor recommendations (Floor, Optimal GMV, Ceiling).
- **Technical concepts demonstrated**:
  - **Domain-Specific LLM Prompting & Schema Formatting**: Produces structured JSON matching `VendorAiMetadataSchema`.
  - **Dynamic Margin Optimization**: Recommends optimal pricing based on category demand elasticity and manufacturing targets.
- **How to test**:
  1. Navigate to `/vendor/dashboard` and click the **"Products"** tab.
  2. Click the violet **"AI Copywriter & SEO"** button.
  3. Enter a title (e.g., *"Apex Neural Band X2"*) and base cost, then click **"Generate Listing Copy & SEO Package"**.
  4. Review generated copy, copy individual sections with 1 click, or click **"Apply Metadata to Active Product Listing"**.

---

### 5. Personalized Homepage Telemetry Ranking
- **What it does**: Reorders homepage collections and product recommendation carousels dynamically based on user persona affinities, category browsing embeddings, and shopping bag intent.
- **Technical concepts demonstrated**:
  - **Embedding-Driven Collaborative Filtering**: Weights category affinity (+50), trending status (+15), and rating metrics to re-rank the catalog in real time.
  - **Reactive Persona Switching**: Instant reordering without full page reloads via React `useMemo` affinity matrix.
- **How to test**:
  1. Visit the homepage at `/`.
  2. Scroll down to the **"Personalized Recommendations for Your Loadout"** section.
  3. Click between the persona toggles (*"🦾 Cybernetic & AR"*, *"🎧 Audiophile Reference"*, *"🛸 Autonomous LiDAR"*, *"🧬 Biometrics & Sleep"*) and watch the 3D product cards reorder in real-time.

---

## Phase 3: Bank-Grade Security, Address Management & Large-Scale Catalog

### 1. Bank-Grade Security & Payment Hardening
- **PCI-DSS SAQ-A Elements**: Zero raw card credentials stored on servers. Card simulation integrates Strong Customer Authentication (SCA / 3DS 2.2).
- **Zero-Trust Server-Side Price Recalculation**: Every checkout intent completely recalculates product prices, discounts, and taxes directly from the database, immediately rejecting client-side tampering (`400 PRICE_TAMPERING_DETECTED`).
- **Field-Level PII Encryption (AES-256-GCM)**: Recipient street address and phone numbers are encrypted at rest using Galois/Counter Mode with unique 96-bit IVs and 128-bit authentication tags before database persistence.
- **HMAC-SHA256 Webhook Verification**: Constant-time timing-safe signature verification preventing replay and timing attacks.
- **Immutable State Machine Audit Trail**: Logs unidirectional transitions (`INITIATED` → `AUTHORIZED` → `CAPTURED` → `REFUNDED` / `FAILED`) in an append-only ledger.
- **Velocity Fraud Shield**: Detects high-velocity checkout attempts (>3 orders / 15 min) and transaction risk levels.
- **GDPR Article 17 (Erasure) & Article 20 (Portability)**: Dedicated user endpoints for cryptographically safe data export and irreversible anonymization.

### 2. Address Book & Checkout Completeness
- **Address Book CRUD**: Multi-address management with `HOME`, `WORK`, and `OTHER` labels, default selection, and inline guest checkout.
- **Pincode Serviceability & Reverse-Geocoding**: Fast lookup checking courier corridors, same-day drone dispatch zones, and auto-filling city and state.
- **3D Secure / SCA Challenge Modal**: Bank authentication modal prompting 6-digit OTP verification with demo code (`771928`).
- **Immutable Historical Snapshots**: Saved delivery addresses are preserved at order confirmation time, ensuring changes to the address book never alter historical manifests.
- **Order Cancellation State Machine**: Allows cancellation for orders in `PENDING`, `CONFIRMED`, or `PROCESSING`, captures structured cancellation reasons, logs transitions in the audit trail, and queues escrow refunds.
- **Printable GST Tax Invoices**: Itemized tax invoice view with GSTIN, HSN codes, and item breakdown formatted for print and PDF export.

### 3. Large-Scale Marketplace Catalog (1,024 Products across 35 Makers)
- **16 Hierarchical Categories**: Covering Cyberpunk Wearables, Spatial Audio, Autonomous Drones, Minimalist Living, Kinetic Keyboards, Next-Gen Computing, Smart Health, Cybernetic Apparel, Spatial Optics, Micro-Mobility, Smart Office, Studio Optics, Robotics, Power Systems, Tactical EDC, and Luxury Chronographs.
- **35 Verified Global Makers**: Real locations (Tokyo, Zurich, Stockholm, San Francisco, Kyoto, Berlin, London, Seoul, Austin, Geneva, etc.), verified badges, KYC records, and delivery telemetry.
- **1,024 Rich Realistic Products**: Each with 2-3 paragraph descriptions, pricing ($49 to $6,800), compare-at discounts (up to 35% off), realistic stock distributions (5% out of stock, 10% low stock, 85% in stock), 4+ technical specs, and 3D configs.
- **Sub-10ms Seeding (`npm run seed`)**: CLI seed script finishes in **7ms** (under 1 second).
- **In-Memory Caching**: TTL caches for categories, deals, trending, and new arrivals with instant invalidation.
- **Faceted Search & Pagination**: Multi-vendor selection, price slider, minimum rating (4+ stars), in-stock toggle, and items-per-page selector (12, 24, 48).
- **Dynamic Merchandising**: "Deals of the Day" with live animated countdown timer, "Trending Now", and "New Arrivals".

---

## Phase 4: Multi-Vendor Operations, Split Escrow Payouts & Carrier Logistics

### 1. Multi-Vendor Split Escrow & Commission State Machine
- **Itemized Multi-Maker Decomposition**: When cart contains items from multiple vendors, splits gross amount, calculates platform take-rate (tiered 6%–10%), deducts courier share, and withholds taxes.
- **Escrow Maturity Lifecycle**: Funds transition monotonically through `HELD_IN_ESCROW` → `ELIGIBLE_FOR_CLEARANCE` (triggered on delivery) → `PAYOUT_INITIATED` → `SETTLED` (or `FROZEN_FOR_DISPUTE`).
- **Dual-Rail Payout Disbursements**: Real-time withdrawal engine supporting Traditional Banking (NEFT/ACH) and Web3 Crypto (USDC on Polygon/Solana) with unique transaction hashes and ledger entries.

### 2. Distributed Stock Reservation Engine with 15-Minute TTL
- **Flash-Sale Concurrency Protection**: Decouples total catalog stock from Available-to-Promise (ATP) inventory (`availableStock = totalStock - reservedStock`).
- **Automated TTL Garbage Collection**: Automatically restores stock to available pool if buyer abandons checkout or timer expires.
- **Permanent Stock Commit**: Deducts reserved inventory permanently on payment capture; releases on cancellation.

### 3. Carrier Logistics Webhooks & Air Waybill Generation
- **Air Waybill (AWB) Generator**: Generates autonomous air cargo manifests with barcodes, QR codes, launch facility origins, and vertiport corridors.
- **Carrier Telemetry Webhooks**: Ingress receiver accepting signed flight events (`MANIFEST_CREATED`, `PICKED_UP`, `SUBORBITAL_LAUNCH`, `DESCENT_APPROACH`, `LOCAL_DRONE_DISPATCH`, `DELIVERED`).
- **Live Flight Telemetry Radar HUD**: Customer order tracking displays real-time altitude (km), airspeed (Mach), power/fuel (%), and carrier flight logs.

### 4. Interactive Vendor Operations Center (`/vendor/dashboard`)
- **Escrow Wallet & Payout Drawer**: Dynamic balance tracking, instant withdrawal simulator with on-chain TxHash/UTR ledger.
- **Fulfillment & Dispatch Hub**: Order fulfillment with dispatch SLA countdown, 1-click AWB shipping label generation, and carrier handover.
- **Inventory Reservation Monitor**: Real-time reserved vs. available stock metrics with reorder alert banners.
- **Carrier Simulator Drawer**: Interactive developer console to step through flight telemetry and observe real-time flight vectors.

---

## External Services & API Key Requirements

> [!NOTE]
> All features across Phase 1, Phase 2, Phase 3, and Phase 4 are designed with **zero hard dependencies on external paid APIs for local demonstration**.
> They run seamlessly via local neural engines, cryptographic libraries, and in-memory caches:
> - **Zero paid API keys needed to test or demo the platform locally**.
> - **Deterministic catalog generator runs instantly (`npm run seed` in 6ms)**.
