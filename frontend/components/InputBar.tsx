'use client';

import React, { useState } from 'react';
import { createCard } from '@/lib/api';
import { Loader2, Plus } from 'lucide-react';

interface InputBarProps {
    roomId: string;
    userId: string;
}

export const InputBar: React.FC<InputBarProps> = ({ roomId, userId }) => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        setIsLoading(true);
        try {
            await createCard(input, roomId, userId);
            setInput('');
        } catch (err) {
            console.error('Failed to create card', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-50">
            <form
                onSubmit={handleSubmit}
                className="relative flex items-center bg-[#1a1a24]/90 backdrop-blur-2xl border border-white/10 rounded-full px-5 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all focus-within:border-white/20"
            >
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste anything... a Zillow link, a vibe, a messy thought"
                    className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-500"
                    autoFocus
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="ml-3 p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-gray-700 rounded-full text-white transition-all shadow-lg shadow-blue-500/20"
                >
                    {isLoading ? (
                        <Loader2 className="animate-spin" size={18} />
                    ) : (
                        <Plus size={18} strokeWidth={3} />
                    )}
                </button>
            </form>
        </div>
    );
};
