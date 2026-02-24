import { Node } from '@xyflow/react';

interface Similarity {
    cardA: string;
    cardB: string;
    score: number;
}

/**
 * Computes new positions for nodes based on semantic gravity.
 * Similar nodes pull each other together.
 */
export function computeGravityPositions(
    nodes: Node[],
    similarities: Similarity[]
): Map<string, { x: number; y: number }> {
    const newPositions = new Map<string, { x: number; y: number }>();

    // Clone current positions
    nodes.forEach(node => {
        newPositions.set(node.id, { x: node.position.x, y: node.position.y });
    });

    const STRENGTH = 0.05; // Gentle drift
    const MIN_DIST = 350; // Don't squash too much

    similarities.forEach(({ cardA, cardB, score }) => {
        const posA = newPositions.get(cardA);
        const posB = newPositions.get(cardB);

        if (posA && posB) {
            const dx = posB.x - posA.x;
            const dy = posB.y - posA.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > MIN_DIST) {
                // Pull force proportional to similarity score
                const force = (distance - MIN_DIST) * STRENGTH * score;
                const fx = (dx / distance) * force;
                const fy = (dy / distance) * force;

                posA.x += fx;
                posA.y += fy;
                posB.x -= fx;
                posB.y -= fy;
            }
        }
    });

    return newPositions;
}
