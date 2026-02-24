import React from 'react';
import { Badge } from 'lucide-react';

interface UIComponent {
    type: string;
    [key: string]: any;
}

export const ComponentRenderer: React.FC<{ components: UIComponent[] }> = ({ components }) => {
    return (
        <div className="flex flex-col gap-3">
            {components.map((c, i) => {
                switch (c.type) {
                    case 'title':
                        return <h3 key={i} className="text-xl font-bold text-white leading-tight">{c.text}</h3>;

                    case 'text':
                        return <p key={i} className="text-sm text-gray-400 leading-relaxed">{c.text}</p>;

                    case 'metric':
                        return (
                            <div key={i} className="bg-white/5 p-3 rounded-lg border border-white/10">
                                <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">{c.label}</div>
                                <div className="text-2xl font-mono text-cyan-400">{c.value}</div>
                            </div>
                        );

                    case 'slider':
                        return (
                            <div key={i} className="flex flex-col gap-1">
                                <div className="text-[10px] uppercase tracking-wider text-gray-500">{c.label}</div>
                                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: `${(c.value || c.min || 0) / (c.max || 5) * 100}%` }} />
                                </div>
                            </div>
                        );

                    case 'dial':
                        return (
                            <div key={i} className="flex items-center gap-3 bg-white/5 p-2 rounded-lg">
                                <div className="w-10 h-10 rounded-full border-2 border-dashed border-violet-500 flex items-center justify-center text-xs font-bold text-violet-400">
                                    {c.value}
                                </div>
                                <div className="text-[10px] uppercase tracking-wider text-gray-500">{c.label}</div>
                            </div>
                        );

                    case 'tags':
                        return (
                            <div key={i} className="flex flex-wrap gap-1">
                                {c.items?.map((tag: string, j: number) => (
                                    <span key={j} className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        );

                    case 'badge':
                        return (
                            <div key={i} className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit uppercase bg-${c.color || 'blue'}-500/20 text-${c.color || 'blue'}-400`}>
                                {c.text}
                            </div>
                        );

                    case 'checklist':
                        return (
                            <ul key={i} className="flex flex-col gap-1">
                                {c.items?.map((item: string, j: number) => (
                                    <li key={j} className="text-[10px] text-gray-400 flex items-center gap-2">
                                        <span className="text-green-500">✓</span> {item}
                                    </li>
                                ))}
                            </ul>
                        );

                    case 'link':
                        return (
                            <a key={i} href={c.url} target="_blank" rel="noopener noreferrer" className="mt-2 block w-full py-2 bg-white/10 hover:bg-white/20 text-center rounded text-[10px] font-bold transition-colors">
                                {c.text || 'View Link'}
                            </a>
                        );

                    case 'divider':
                        return <hr key={i} className="border-white/5 my-1" />;

                    default:
                        return null;
                }
            })}
        </div>
    );
};
