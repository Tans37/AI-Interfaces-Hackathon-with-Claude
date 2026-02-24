'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
    ReactFlow,
    useNodesState,
    useEdgesState,
    Background,
    Controls,
    Node,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { CardNode } from './Card';
import { MagnetTool } from './MagnetTool';
import { getSocket } from '@/lib/socket';
import { fetchCanvas, fetchSimilarities } from '@/lib/api';
import { computeGravityPositions } from '@/lib/gravity';

const nodeTypes = {
    card: CardNode,
    magnet: MagnetTool,
};

interface OrbitCanvasProps {
    roomId: string;
    userId: string;
}

export const OrbitCanvas: React.FC<OrbitCanvasProps> = ({ roomId, userId }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const socket = getSocket();

    // Load initial canvas state
    useEffect(() => {
        fetchCanvas(roomId).then(({ cards }) => {
            const initialNodes = cards.map((c: any) => ({
                id: c.id,
                type: 'card',
                position: { x: c.x, y: c.y },
                data: { ...c },
            }));

            // Add one default Magnet Tool
            initialNodes.push({
                id: 'magnet-1',
                type: 'magnet',
                position: { x: 50, y: 50 },
                data: { roomId },
            });

            setNodes(initialNodes);
        });

        socket.emit('join-room', { roomId, userId });

        return () => {
            socket.off('card-created');
            socket.off('card-move');
            socket.off('magnet-applied');
        };
    }, [roomId, userId, setNodes, socket]);

    // Listen for real-time updates
    useEffect(() => {
        socket.on('card-created', (card) => {
            setNodes((nds) => nds.concat({
                id: card.id,
                type: 'card',
                position: { x: card.x, y: card.y },
                data: { ...card },
            }));
        });

        socket.on('card-move', ({ cardId, x, y }) => {
            setNodes((nds) =>
                nds.map((n) => (n.id === cardId ? { ...n, position: { x, y } } : n))
            );
        });

        // Handle magnet results (if broadcasted from backend)
        socket.on('magnet-applied', ({ match, noMatch }) => {
            setNodes((nds) => nds.map((n) => {
                if (n.type !== 'card') return n;
                return {
                    ...n,
                    data: {
                        ...n.data,
                        isHighlighted: match.includes(n.id),
                        isDimmed: noMatch.includes(n.id),
                    },
                };
            }));
        });

        return () => {
            socket.off('card-created');
            socket.off('card-move');
            socket.off('magnet-applied');
        };
    }, [socket, setNodes]);

    // Handle local drag
    const onNodeDragStop = useCallback((_: any, node: Node) => {
        socket.emit('card-move', {
            cardId: node.id,
            x: node.position.x,
            y: node.position.y,
        });
    }, [socket]);

    // Gravity Loop (Every 5 seconds)
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const sims = await fetchSimilarities(roomId);
                if (sims.length === 0) return;

                setNodes((nds) => {
                    const newPosMap = computeGravityPositions(nds, sims);
                    return nds.map((n) => {
                        const newPos = newPosMap.get(n.id);
                        return newPos ? { ...n, position: newPos } : n;
                    });
                });
            } catch (err) {
                console.error('Gravity failed', err);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [roomId, setNodes]);

    return (
        <div className="w-full h-full bg-[#0a0a0f]">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeDragStop={onNodeDragStop}
                nodeTypes={nodeTypes}
                fitView
                colorMode="dark"
            >
                <Background color="#1a1a24" gap={40} size={1} />
                <Controls />
            </ReactFlow>
        </div>
    );
};
