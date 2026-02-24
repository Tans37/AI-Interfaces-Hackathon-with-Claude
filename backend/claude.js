import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an Autonomous UI Architect for the "Canvas of Infinite Realities".
Your job is to read the user's prompt and conceptualize an entire interactive UI dashboard or visualization across a 3D Tunnel Timeline.
You do not return conversational text. You ONLY return a structured JSON array of UI Components.

### THE TUNNEL STRUCTURE
The UI is a cinematic, 3D scroll-driven tunnel. 
You must place components in a linear sequence using the 'order' integer property. The frontend handles all 3D spacing.
You should generate 5 to 7 highly detailed components to make the scroll exciting.

### EXTREME AESTHETICS (CRITICAL)
- **MANDATORY THEME:** CYBERPUNK / SYNTHWAVE / HACKER HUD.
- DO NOT USE boring corporate designs. 
- You MUST use wildly vibrant, high-contrast hex colors (#FF0055, #00FFCC, #B200FF, #FFFF00) paired with deep shadows or \#000000 backgrounds.
- Inject compelling, sci-fi, dystopian, or highly immersive data/content (e.g. "Quantum Decoupling Status", "Neural Link Bandwidth").
- For card titles, use extreme formatting (e.g. text transform uppercase, extra letter spacing).

### PERMITTED COMPONENTS:
1. "text"   - Displays standalone text. Fields: content (string), style ("h1"|"h2"|"h3"|"body"|"caption"), color (hex).
2. "metric" - A stark stat card. Fields: label, value (string|number), trend ("up"|"down"|"neutral"), trendValue (string).
3. "card"   - Summary container. Fields: title, content, optional items array (nested components).
4. "list"   - Bullet list. Fields: optional title, items (array of strings).
5. "chart"  - Data visualization. Fields: title (optional), chartType ("bar"|"radial"|"line"), data (array of {label, value, color?}), unit (optional, e.g. "%", "ms", "GB"). Generate 3-6 data points with vivid cyberpunk hex colors.

### RULES:
1. Return ONLY valid JSON representing an array of component objects. No markdown formatting or extra text.
2. Generate creative, realistic, and highly compelling data (sci-fi / cyberpunk theme).
3. Assign a unique "id" (string) to every component.
4. Set 'order' as a sequentially increasing integer starting from the CURRENT_MAX_ORDER provided in the prompt.
5. Set 'w' (width in pixels) on cards, metrics and charts — minimum 450px, they float in 3D space.
6. Include at least 1-2 "chart" components per batch. Use a mix of chartTypes (bar, radial, line) to keep the tunnel visually dynamic.
`;

/**
 * Generates a structured UI Canvas via Claude.
 */
export async function generateCanvasUI(input, currentMaxOrder = 0) {
    try {
        const message = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 4000,
            system: SYSTEM_PROMPT,
            messages: [
                { role: "user", content: `CURRENT_MAX_ORDER: ${currentMaxOrder}\n\nUser Request: ${input}` }
            ],
            temperature: 0.9
        });

        const content = message.content[0].text;

        let parsed;
        try {
            // Brute force extract the JSON array from the response in case Claude adds conversational padding
            const arrayStart = content.indexOf('[');
            const arrayEnd = content.lastIndexOf(']');
            if (arrayStart > -1 && arrayEnd > -1) {
                const jsonStr = content.substring(arrayStart, arrayEnd + 1);
                parsed = JSON.parse(jsonStr);
            } else {
                parsed = JSON.parse(content);
            }
        } catch (e) {
            // strip markdown if claude accidentally included it
            const jsonStr = content.replace(/^```json/m, '').replace(/```$/m, '').trim();
            parsed = JSON.parse(jsonStr);
        }

        return parsed;
    } catch (error) {
        console.error('Claude API Error:', error);
        return [
            {
                id: "error1",
                type: "card",
                title: "Architect Protocol Failure",
                content: "Unable to parse reality request.",
                x: 50,
                y: 50,
                w: 300
            }
        ];
    }
}

/**
 * Vectorizes a string into the 10D semantic coordinate space.
 * Used primarily for the Magnet tool.
 */
export async function getSemanticCoordinates(query) {
    try {
        const message = await anthropic.messages.create({
            model: "claude-3-5-sonnet-latest",
            max_tokens: 200,
            system: `You are a semantic vectorizer. Return ONLY an array of 10 floats (0.0 to 1.0) representing the input's position across these axes:
1. Urban vs Nature
2. Social vs Quiet
3. Budget vs Luxury
4. Traditional vs Modern
5. Fast vs Slow
6. Indoors vs Outdoors
7. Casual vs Formal
8. Digital vs Physical
9. Known vs Niche
10. Utilitarian vs Whimsical

Input: "${query}"
Output Format: [0.1, 0.2, ...]`,
            messages: [{ role: "user", content: "Vectorize the input." }]
        });

        const content = message.content[0].text;
        return JSON.parse(content);
    } catch (error) {
        console.error('Vectorization Error:', error);
        return new Array(10).fill(0.5);
    }
}
