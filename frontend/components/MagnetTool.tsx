import React, { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Magnet, Search, Loader2 } from 'lucide-react';
import { postMagnet } from '@/lib/api';
import { getSocket } from '@/lib/socket';

export const MagnetTool = memo(({ id, data }: any) => {
    const [query, setQuery] = useState('');
    const [isFiltering, setIsFiltering] = useState(false);
    const socket = getSocket();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || isFiltering) return;

        setIsFiltering(true);
        try {
            const { match, noMatch } = await postMagnet(query, data.roomId);

            // Update local UI immediately via socket event handler in OrbitCanvas
            socket.emit('magnet-applied', { match, noMatch, roomId: data.roomId });
        } catch (err) {
            console.error(err);
        } finally {
            setIsFiltering(false);
        }
    };

    return (
        <div className="bg-[#1a1a24]/90 backdrop-blur-xl border-2 border-dashed border-red-500/50 rounded-2xl p-4 w-[240px] shadow-2xl nodrag">
            <div className="flex items-center gap-2 mb-3 text-red-400">
                <Magnet size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Magnet Tool</span>
            </div>

            <form onSubmit={handleSearch} className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Filter by meaning..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-red-500/50 transition-colors"
                />
                <button type="submit" disabled={isFiltering} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                    {isFiltering ? (
                        <Loader2 className="animate-spin" size={14} />
                    ) : (
                        <Search size={14} />
                    )}
                </button>
            </form>

            <div className="mt-3 text-[10px] text-gray-500 italic">
                Drag me near cards to pulse them...
            </div>

            <Handle type="source" position={Position.Bottom} className="opacity-0" />
        </div>
    );
});

MagnetTool.displayName = 'MagnetTool';
