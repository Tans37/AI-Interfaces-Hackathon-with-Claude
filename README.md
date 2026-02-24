# Canvas of Infinite Realities

> *"What should the screen look like, now that the AI is powerful?"*

A generative UI experiment built for the **AI Tinkerers × Anthropic Interfaces Hackathon** — NYC, 2025.

---

## What Is This?

**Canvas of Infinite Realities** is a living, breathing interface that thinks for itself.

You type a prompt. Claude — acting as an autonomous UI Architect — designs an entire interactive dashboard in real time. No templates. No fixed layouts. The AI decides what components to render, what data to show, and how to tell the story. Every prompt conjures a different reality.

The result is rendered as a **cinematic 3D scroll-driven tunnel**: components fly toward you through Z-space as you scroll, each one glowing with cyberpunk neon against a synthwave background that shifts color based on the content being displayed.

It's not a chatbot. It's not a dashboard builder. It's an interface that *generates interfaces*.

<img width="1919" height="942" alt="image" src="https://github.com/user-attachments/assets/e46282fe-cd30-432c-a3c2-ad15ecc0b8ff" />

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
