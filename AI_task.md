# Task: Canvas of Infinite Realities

- [x] Clean up redundant old files (backend & frontend).
- [x] Frontend: Install `framer-motion`, `lucide-react`, `clsx`, `tailwind-merge`.
- [x] Frontend: Set up the UI schema types for generative components (Text, Metric, Card, Chart, List).
- [x] Frontend: Build baseline React styling components (glassmorphism tokens in `globals.css` or Tailwind config).
- [x] Frontend: Create the main `Canvas` page (`page.tsx`) with a fleeting input field.
- [x] Frontend: Implement `GenerativeComponentRenderer` to map schema JSON to UI components.
- [x] Backend: Update the Claude API call to utilize structured tool outputs/JSON schema for the UI.
- [x] Backend: Set up WebSocket streaming of the UI JSON state down to the frontend.
- [x] Connect the input -> backend -> frontend rendering loop.

## V2 Improvements
- [x] Migrate canvas to `@xyflow/react` for an actual infinite pan/zoom canvas instead of absolute CSS percentages.
- [x] Improve prompt engineering to space items better in absolute pixel coordinates instead of percentages.
- [x] Make the UI components look much more premium, vibrant, and detailed (neon accents, refined typography).

## V3 Improvements (Tunnel Scroll UI)
- [x] Scrap `ReactFlow` and 2D canvas positioning.
- [x] Update Claude API to generate a linear sequence of components (a "storyline").
- [x] Build a 3D perspective wrapper using `framer-motion` (TranslateZ, scale) tied to scroll position (like a wormhole/tunnel effect).
- [x] Polish hover interactions and scrolling dynamics.

## V4 Improvements (Infinite Scroll & Database State)
- [x] Aesthetic Upgrade: Instruct Claude to use bolder typography, wilder colors, and more extreme layout params to make cards pop.
- [x] Backend: Store generated payload blocks in Redis JSON mapped to a `roomId` so history is preserved.
- [x] Frontend: Re-fetch Redis history on page load using a URL query or hash.
- [x] Frontend: Implement an IntersectionObserver at the end of the scroll track to autonomously hit `/generate-more` and fetch the next batch of reality components.
