import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
dotenv.config();

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

async function test() {
    try {
        console.log("Fetching models...");
        const models = await anthropic.models.list();
        console.log("Available models:", models.data.map(m => m.id));
    } catch (e) {
        console.error("Error fetching models:", e);
    }
}

test();
