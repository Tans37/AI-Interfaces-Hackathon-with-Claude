'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { nanoid } from 'nanoid';
import { OrbitCanvas } from '@/components/OrbitCanvas';
import { InputBar } from '@/components/InputBar';

export default function RoomPage() {
    const params = useParams();
    const roomId = params.roomId as string;
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        let id = localStorage.getItem('orbit_user_id');
        if (!id) {
            id = `user_${nanoid(8)}`;
            localStorage.setItem('orbit_user_id', id);
        }
        setUserId(id);
    }, []);

    if (!userId || !roomId) return (
        <div className="w-screen h-screen bg-[#0a0a0f] flex items-center justify-center text-gray-500 font-mono">
            Initializing Orbit...
        </div>
    );

    return (
        <main className="w-screen h-screen overflow-hidden flex flex-col relative">
            {/* Header Info */}
            <div className="absolute top-6 left-6 z-50 flex items-center gap-4 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-mono text-gray-400">Room: <span className="text-white">{roomId}</span></span>
                <div className="w-px h-3 bg-white/10" />
                <span className="text-xs font-mono text-gray-400">Collaborator: <span className="text-blue-400">{userId}</span></span>
            </div>

            <OrbitCanvas roomId={roomId} userId={userId} />
            <InputBar roomId={roomId} userId={userId} />

            {/* Aesthetic Overlay Gradient */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(79,124,255,0.1),transparent_50%)]" />
        </main>
    );
}
