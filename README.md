# Canvas of Infinite Realities

> *"What should the screen look like, now that the AI is powerful?"*

A generative UI experiment built for the **AI Tinkerers × Anthropic Interfaces Hackathon** — NYC, 2025.

---

## What Is This?

**Canvas of Infinite Realities** is a living, breathing interface that thinks for itself.

You type a prompt. Claude — acting as an autonomous UI Architect — designs an entire interactive dashboard in real time. No templates. No fixed layouts. The AI decides what components to render, what data to show, and how to tell the story. Every prompt conjures a different reality.

The result is rendered as a **cinematic 3D scroll-driven tunnel**: components fly toward you through Z-space as you scroll, each one glowing with cyberpunk neon against a synthwave background that shifts color based on the content being displayed.

It's not a chatbot. It's not a dashboard builder. It's an interface that *generates interfaces*.

<img width="1913" height="965" alt="image" src="https://github.com/user-attachments/assets/5578c195-b4ae-44ce-bcac-78e1cd6bb3a4" />


<img width="1919" height="942" alt="image" src="https://github.com/user-attachments/assets/6803fc5b-a588-486e-9f02-9d27c9d277fb" />


---

## The Agentic AI Core

This project is built around **agentic Claude** — Claude isn't answering questions, it's making decisions.

### Claude as UI Architect

When you submit a prompt, Claude receives a single system directive: *design a full UI canvas*. It autonomously:

- Decides **which component types** to use (text, metric, card, list, bar chart, radial chart, line chart)
- Invents **compelling, thematic data** that fits the prompt's context
- Assigns **visual properties** — colors, widths, ordering — to each component
- Sequences them across a **3D timeline** using an `order` field it manages itself
- Returns a **structured JSON array** that the frontend renders directly — no post-processing, no human in the loop

The AI isn't filling in a form. It's architecting an experience.

### Infinite Scroll via Agentic Loop

When you reach the end of the tunnel, Claude is called again autonomously — generating the next batch of components, extending the reality infinitely. The user never has to re-prompt. The agent keeps building.

### Context-Aware Environment

The background canvas reads Claude's output and reacts to it. If Claude generates warm-toned data, the synthwave grid shifts warm. If the content turns cold and analytical, the particle network follows. The entire environment is a function of what the AI decided to create.

---

## Tech Stack

| Layer | Technology |
|---|---|
| AI Model | Claude (claude-sonnet-4-6) via Anthropic SDK |
| Backend | Node.js + Express (ESM) |
| Real-time | Socket.IO |
| Memory / Vector Search | Redis (RedisJSON + Vector Search) |
| Frontend | Next.js 16 + React 19 + TypeScript |
| Animation | Framer Motion (scroll-driven 3D transforms) |
| Background | HTML5 Canvas 2D (particle mesh + synthwave grid) |
| Styling | Tailwind CSS v4 |
| Charts | Pure SVG (bar, radial/donut, line) — no chart library |

---

## Features

- **Natural language → full UI** — one prompt generates a complete visual dashboard
- **3D tunnel scroll** — components rendered in perspective Z-space using Framer Motion scroll transforms
- **Live charts** — bar, radial (donut), and line charts generated on-demand by Claude
- **Context-aware background** — canvas particle system + synthwave grid that color-shifts based on generated content
- **Infinite scroll loop** — the AI autonomously extends the tunnel as you reach the end
- **Persistent rooms** — each session gets a UUID-based room ID; Redis stores all canvas states
- **Semantic memory** — Redis Vector Search enables similarity-based recall of past canvases
- **Zero blur, GPU-promoted** — scroll performance optimized: no CSS `filter: blur()` on scroll paths, `willChange: transform` on all tunnel nodes

---

## Redis Architecture — AI Memory Layer

Redis isn't used here as a cache. It's the **persistent memory and semantic search layer** that gives the AI engineer superpowers over generated canvases.

### 1. RedisJSON — Schema-Free Component Storage

Every UI component Claude generates is stored as a JSON document in Redis under a `card:{id}` key via [RedisJSON](https://redis.io/docs/stack/json/). No schema migrations, no ORM — the same structured JSON Claude outputs goes straight into Redis and comes straight back out.

```js
// Write — raw JSON document, no transformation
await client.json.set(`card:${card.id}`, '$', card);

// Read — room-scoped retrieval
const card = await client.json.get(`card:${key}`);
```

This makes Redis a natural fit for an AI output pipeline: Claude's response is already JSON, so the storage layer is zero-friction.

### 2. Vector Search Index — Semantic Canvas Memory

A **FLAT vector index** is created on a 10-dimensional float32 coordinate field stored inside each JSON document:

```js
await client.ft.create('idx:cards:v2', {
  '$.coordinates': {
    type: SCHEMA_FIELD_TYPE.VECTOR,
    ALGORITHM: SCHEMA_VECTOR_FIELD_ALGORITHM.FLAT,
    TYPE: 'FLOAT32',
    DIM: 10,
    DISTANCE_METRIC: 'COSINE',
    AS: 'coordinates'
  },
  '$.roomId': { type: SCHEMA_FIELD_TYPE.TAG, AS: 'roomId' }
}, { ON: 'JSON', PREFIX: 'card:' });
```

Key decisions:
- **FLAT over HNSW** — dataset is small per room, FLAT gives exact KNN with minimal overhead
- **COSINE distance** — normalizes for magnitude; what matters is *direction* in semantic space, not scale
- **10 dimensions** — hand-crafted semantic axes (see below), not learned embeddings
- **TAG field on roomId** — allows pre-filtering searches to a single session before the KNN step

### 3. The LLM-Defined Semantic Space

This is the unusual part. Instead of using a large embedding model (e.g. `text-embedding-3-small`), the coordinates are generated by **asking Claude to place a prompt on 10 human-interpretable axes**:

```
1. Urban vs Nature        6. Indoors vs Outdoors
2. Social vs Quiet        7. Casual vs Formal
3. Budget vs Luxury       8. Digital vs Physical
4. Traditional vs Modern  9. Known vs Niche
5. Fast vs Slow          10. Utilitarian vs Whimsical
```

Claude returns a `[0.0 … 1.0]` float for each axis. This creates a compact, interpretable semantic fingerprint — no embedding model dependency, no opaque 1536-dim vectors, fully explainable coordinates.

**AI engineering insight:** For narrow-domain applications, an LLM-generated low-dimensional semantic space can outperform generic embeddings in *interpretability* and *cost*, at the price of less recall breadth.

### 4. KNN Similarity Search

Finding semantically similar past canvases is a single Redis query:

```js
const results = await client.ft.search('idx:cards:v2',
  `(@roomId:{${roomId}})=>[KNN ${topK} @coordinates $vec AS score]`,
  {
    PARAMS: { vec: Buffer.from(new Float32Array(queryVector).buffer) },
    SORTBY: 'score',
    DIALECT: 2
  }
);
```

The pre-filter `@roomId:{roomId}` runs before KNN, keeping search scoped to the current session. Results are sorted by COSINE similarity score ascending (0 = identical).

### 5. Data Flow

```
User Prompt
    │
    ├─► Claude (getSemanticCoordinates) ──► 10D float vector
    │                                           │
    ├─► Claude (generateCanvasUI) ──► JSON components ◄──┘
    │                                           │
    └─► Redis                                   │
          ├── json.set(card:id, $, component)   │
          └── Vector index auto-indexes $.coordinates
                    │
                    └─► ft.search KNN ──► similar past canvases
```

---

## Hackathon Context

This project was built for:

### 🎨 AI Tinkerers — Interfaces Hackathon with Claude
**Hosted in New York City | Supported by Anthropic, Tavus, Redis, and CopilotKit**

> *"As AI becomes more capable, the bottleneck shifts from raw intelligence to how humans access it."*

The hackathon challenged builders to answer one question: **now that the AI is powerful, what should the screen look like?**

Canvas of Infinite Realities is a direct answer to that question. Instead of wrapping Claude in a chat box, it hands Claude the paintbrush. The interface *is* the AI's output — a dynamic, scrollable, 3D-rendered world that Claude architects from scratch for every prompt.

**Sponsors:**
- **Anthropic** — Claude API, engineering support, and credits
- **Redis** — In-memory vector database powering canvas persistence and semantic search
- **Tavus** — AI research lab pioneering human-like computing
- **CopilotKit** — Agentic Application Framework (AG-UI protocol)

---

## Running Locally

### Prerequisites
- Node.js 18+
- A Redis instance (RedisStack with JSON + Search modules, e.g. Redis Cloud free tier)
- Anthropic API key

### Backend

```bash
cd backend
npm install
# Create .env from the example:
cp .env.example .env
# Fill in your ANTHROPIC_API_KEY and REDIS_URL
node index.js
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3001
```

Open `http://localhost:3001`, type any prompt, and watch a reality take shape.

---

## Environment Variables

```env
# backend/.env
PORT=4000
ANTHROPIC_API_KEY=your_key_here
REDIS_URL=redis://...
FRONTEND_URL=http://localhost:3001
```

---

## Project Structure

```
├── backend/
│   ├── index.js          # Express server + REST endpoints
│   ├── claude.js         # Agentic UI generation via Claude API
│   ├── redis.js          # Redis JSON storage + vector index
│   └── socket.js         # Socket.IO real-time layer
│
└── frontend/
    ├── app/
    │   └── page.tsx              # Main page — prompt input + room management
    ├── components/
    │   ├── CanvasRenderer.tsx    # 3D tunnel + all component renderers + charts
    │   └── DynamicBackground.tsx # Canvas 2D synthwave background
    └── lib/
        └── schema.ts             # TypeScript types for all UI components
```

---

## The Idea in One Line

*Give Claude a blank canvas and ask it to build the UI — then render exactly what it designs, in 3D, forever.*

---
