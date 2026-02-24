import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupIndex, storeCard, getCanvasCards, searchSimilar } from './redis.js';
import { generateCanvasUI, getSemanticCoordinates } from './claude.js';
import { setupSocket } from './socket.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.json());

// Main endpoint to generate a Canvas UI or append to an existing one
app.post('/generate', async (req, res) => {
    const { prompt, roomId } = req.body;

    if (!roomId) {
        return res.status(400).json({ error: 'roomId is required' });
    }

    try {
        console.log(`Generating canvas for room ${roomId} prompt: "${prompt}"`);

        // Get current cards to find the max order so we know where to append
        const existingCards = await getCanvasCards(roomId);
        let maxOrder = 0;
        if (existingCards.length > 0) {
            maxOrder = Math.max(...existingCards.map(c => c.order || 0));
        }

        // Generate new canvas components with Claude 
        const components = await generateCanvasUI(prompt, maxOrder);

        // Save the new components to Redis attached to this room
        for (const comp of components) {
            comp.roomId = roomId; // Tag for indexing

            // Generate some 10D conceptual coordinates for the magnet tool while we're at it
            // To keep it fast we'll just mock random floats for now unless we need the semantic tool
            comp.coordinates = Array.from({ length: 10 }, () => Math.random());

            await storeCard(comp);
        }

        // Return the *entire* updated canvas timeline
        const updatedTimeline = await getCanvasCards(roomId);
        const sortedTimeline = updatedTimeline.sort((a, b) => a.order - b.order);

        res.json({ components: sortedTimeline });
    } catch (error) {
        console.error('Error in /generate:', error);
        res.status(500).json({ error: 'Failed to generate canvas' });
    }
});

// Load full canvas
app.get('/canvas/:roomId', async (req, res) => {
    try {
        const cards = await getCanvasCards(req.params.roomId);
        res.json({ cards });
    } catch (error) {
        console.error('Error in /canvas:', error);
        res.status(500).json({ error: 'Failed' });
    }
});

// Get similarities for Gravity Physics
app.get('/similarities', async (req, res) => {
    const { roomId } = req.query;
    try {
        const cards = await getCanvasCards(roomId);
        if (cards.length < 2) return res.json([]);

        const pairs = [];
        for (let i = 0; i < cards.length; i++) {
            for (let j = i + 1; j < cards.length; j++) {
                const score = cosineSimilarity(cards[i].coordinates, cards[j].coordinates);
                if (score > 0.7) { // Only pull together if notably similar
                    pairs.push({ cardA: cards[i].id, cardB: cards[j].id, score });
                }
            }
        }
        res.json(pairs);
    } catch (error) {
        console.error('Error in /similarities:', error);
        res.status(500).json({ error: 'Failed' });
    }
});

// Magnet tool search
app.post('/magnet', async (req, res) => {
    const { query, roomId } = req.body;
    try {
        const queryCoords = await getSemanticCoordinates(query);
        const topMatches = await searchSimilar(queryCoords, roomId, 5);

        const allCards = await getCanvasCards(roomId);
        // Score in Redis VSS (Cosine) is distance: 0 = identical, 2 = opposite
        const matchIds = topMatches.filter(m => m.score < 0.25).map(m => m.id);
        const noMatchIds = allCards.map(c => c.id).filter(id => !matchIds.includes(id));

        res.json({ match: matchIds, noMatch: noMatchIds });
    } catch (error) {
        console.error('Error in /magnet:', error);
        res.status(500).json({ error: 'Failed' });
    }
});

function cosineSimilarity(a, b) {
    if (!a || !b) return 0;
    const dot = a.reduce((sum, ai, i) => sum + ai * (b[i] || 0), 0);
    const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    if (magA === 0 || magB === 0) return 0;
    return dot / (magA * magB);
}

setupSocket(io);

const PORT = process.env.PORT || 4000;
setupIndex().then(() => {
    httpServer.listen(PORT, () => {
        console.log(`Orbit Backend running on http://localhost:${PORT}`);
    });
});
