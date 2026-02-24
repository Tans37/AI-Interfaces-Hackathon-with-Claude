const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function fetchCanvas(roomId: string) {
    const res = await fetch(`${BACKEND_URL}/canvas/${roomId}`);
    if (!res.ok) throw new Error('Failed to load canvas');
    return res.json();
}

export async function createCard(text: string, roomId: string, userId: string) {
    const res = await fetch(`${BACKEND_URL}/card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, roomId, userId }),
    });
    if (!res.ok) throw new Error('Failed to create card');
    return res.json();
}

export async function fetchSimilarities(roomId: string) {
    const res = await fetch(`${BACKEND_URL}/similarities?roomId=${roomId}`);
    if (!res.ok) throw new Error('Failed to fetch similarities');
    return res.json();
}

export async function postMagnet(query: string, roomId: string) {
    const res = await fetch(`${BACKEND_URL}/magnet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, roomId }),
    });
    if (!res.ok) throw new Error('Failed to filter magnet');
    return res.json();
}
