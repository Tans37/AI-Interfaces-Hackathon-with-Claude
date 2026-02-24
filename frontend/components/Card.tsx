import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { ComponentRenderer } from './ComponentRenderer';
import { Zap } from 'lucide-react';

export const CardNode = memo(({ data }: any) => {
    const { components, theme, fromCache, isDimmed, isHighlighted } = data;

    const themeColors: Record<string, string> = {
        blue: 'border-l-blue-500',
        violet: 'border-l-violet-500',
        cyan: 'border-l-cyan-500',
        default: 'border-l-gray-500',
    };

    return (
        <div className={`card-node relative min-w-[280px] max-w-[320px] bg-[#1a1a24]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl border-l-4 ${themeColors[theme] || themeColors.default} ${isDimmed ? 'card-dimmed' : ''} ${isHighlighted ? 'card-highlighted' : ''}`}>
            {fromCache && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-black p-1 rounded-full shadow-lg z-10" title="Served from semantic cache">
                    <Zap size={12} fill="currentColor" />
                </div>
            )}

            <ComponentRenderer components={components} />

            <Handle type="target" position={Position.Top} className="opacity-0" />
            <Handle type="source" position={Position.Bottom} className="opacity-0" />
        </div>
    );
});

CardNode.displayName = 'CardNode';
