import { useRef, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    UIComponent, TextComponent, MetricComponent, CardComponent, ListComponent, ChartComponent
} from '../lib/schema';
import { cn } from '../lib/utils';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

// ─── Glassmorphism container ──────────────────────────────────────────────────

const GlassPanel = ({ children, className, accentColor }: {
    children: React.ReactNode; className?: string; accentColor?: string;
}) => (
    <div className={cn(
        "relative bg-[#0d0d16]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden group",
        className
    )}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/[0.04] to-transparent pointer-events-none" />
        {accentColor && (
            <div
                className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-[60px] opacity-20 pointer-events-none transition-opacity duration-700 group-hover:opacity-40"
                style={{ backgroundColor: accentColor }}
            />
        )}
        <div className="relative z-10 w-full">{children}</div>
    </div>
);

// ─── Palette helper ───────────────────────────────────────────────────────────

const PALETTE = ['#00FFCC', '#FF0055', '#B200FF', '#FFFF00', '#00AAFF', '#FF6600'];
const col = (i: number, override?: string) => override || PALETTE[i % PALETTE.length];

// ─── Text ─────────────────────────────────────────────────────────────────────

const TextRenderer = ({ comp }: { comp: TextComponent }) => {
    const styles = {
        h1: "text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-4",
        h2: "text-3xl font-bold text-gray-50 mb-3 tracking-wide",
        h3: "text-xl font-semibold text-gray-200 mb-2",
        body: "text-base text-gray-400 leading-relaxed font-light",
        caption: "text-xs font-bold text-gray-500 uppercase tracking-[0.2em]"
    };
    return (
        <div
            className={styles[comp.style || 'body']}
            style={comp.color ? { color: comp.color, textShadow: `0 0 30px ${comp.color}50`, WebkitTextFillColor: 'initial' } : undefined}
        >
            {comp.content}
        </div>
    );
};

// ─── Metric ───────────────────────────────────────────────────────────────────

const MetricRenderer = ({ comp }: { comp: MetricComponent }) => {
    const trendColor = comp.trend === 'up' ? "#10b981" : comp.trend === 'down' ? "#ef4444" : "#6b7280";
    return (
        <GlassPanel accentColor={trendColor} className="flex flex-col justify-between min-w-[300px]">
            <div className="flex items-center justify-between mb-6">
                <div className="text-gray-400 text-xs font-bold uppercase tracking-[0.15em]">{comp.label}</div>
                <Activity className="w-4 h-4 text-gray-500 opacity-50" />
            </div>
            <div className="flex items-end justify-between">
                <div className="text-6xl font-black text-white tracking-tighter" style={{ textShadow: `0 0 40px ${trendColor}30` }}>
                    {comp.value}
                </div>
                {comp.trend && (
                    <div className="flex items-center text-sm font-bold rounded-lg px-2.5 py-1.5 backdrop-blur-md bg-white/5 border border-white/10" style={{ color: trendColor }}>
                        {comp.trend === 'up' && <TrendingUp className="w-4 h-4 mr-1.5" strokeWidth={3} />}
                        {comp.trend === 'down' && <TrendingDown className="w-4 h-4 mr-1.5" strokeWidth={3} />}
                        {comp.trend === 'neutral' && <Minus className="w-4 h-4 mr-1.5" strokeWidth={3} />}
                        {comp.trendValue}
                    </div>
                )}
            </div>
        </GlassPanel>
    );
};

// ─── Card ─────────────────────────────────────────────────────────────────────

const CardRenderer = ({ comp }: { comp: CardComponent }) => (
    <GlassPanel accentColor="#3b82f6" className="min-w-[350px]">
        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{comp.title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed mb-4 font-light">{comp.content}</p>
        {comp.items && comp.items.length > 0 && (
            <div className="space-y-4 mt-6 pt-5 border-t border-white/10">
                {comp.items.map((item, idx) => (
                    <div key={item.id || `nested-${idx}`} className="relative">
                        <ComponentRenderer comp={item} />
                    </div>
                ))}
            </div>
        )}
    </GlassPanel>
);

// ─── List ─────────────────────────────────────────────────────────────────────

const ListRenderer = ({ comp }: { comp: ListComponent }) => (
    <GlassPanel accentColor="#8b5cf6" className="min-w-[320px]">
        {comp.title && <h3 className="text-xl font-bold text-white mb-5 tracking-wide">{comp.title}</h3>}
        <ul className="space-y-4">
            {comp.items.map((item, idx) => (
                <li key={idx} className="flex items-start group relative">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 mr-4 flex-shrink-0 group-hover:shadow-[0_0_15px_#8b5cf6] transition-shadow duration-300" />
                    <span className="text-gray-300 text-sm leading-relaxed group-hover:text-white transition-colors duration-300">{item}</span>
                </li>
            ))}
        </ul>
    </GlassPanel>
);

// ─── Chart: Bar ───────────────────────────────────────────────────────────────

const BarChart = ({ comp }: { comp: ChartComponent }) => {
    const max = Math.max(...comp.data.map(d => d.value), 1);
    return (
        <GlassPanel accentColor={comp.data[0]?.color || '#00FFCC'} className="min-w-[450px]">
            {comp.title && (
                <h3 className="text-lg font-black text-white mb-5 tracking-[0.15em] uppercase">{comp.title}</h3>
            )}
            <div className="flex items-end gap-3" style={{ height: '160px' }}>
                {comp.data.map((d, i) => {
                    const heightPct = (d.value / max) * 100;
                    const c = col(i, d.color);
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 h-full min-w-0">
                            <span className="text-[10px] font-black font-mono" style={{ color: c }}>
                                {d.value}{comp.unit || ''}
                            </span>
                            <div
                                className="w-full rounded-t relative overflow-hidden"
                                style={{
                                    height: `${heightPct}%`,
                                    backgroundColor: `${c}25`,
                                    border: `1px solid ${c}50`,
                                    boxShadow: `0 0 14px ${c}30, inset 0 0 10px ${c}10`,
                                    transition: 'height 0.6s cubic-bezier(0.16,1,0.3,1)',
                                }}
                            >
                                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${c}50, ${c}15)` }} />
                                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: c, boxShadow: `0 0 8px ${c}` }} />
                            </div>
                            <span className="text-[9px] text-gray-500 truncate w-full text-center font-mono uppercase tracking-wider">{d.label}</span>
                        </div>
                    );
                })}
            </div>
        </GlassPanel>
    );
};

// ─── Chart: Radial / Donut ────────────────────────────────────────────────────

const RadialChart = ({ comp }: { comp: ChartComponent }) => {
    const total = comp.data.reduce((s, d) => s + d.value, 0) || 1;
    const r = 52, cx = 70, cy = 70;
    const circ = 2 * Math.PI * r;

    let cumOffset = 0;
    const segments = comp.data.map((d, i) => {
        const fraction = d.value / total;
        const seg = { d, fraction, offset: cumOffset, color: col(i, d.color) };
        cumOffset += fraction;
        return seg;
    });

    return (
        <GlassPanel accentColor={segments[0]?.color || '#00FFCC'} className="min-w-[380px]">
            {comp.title && (
                <h3 className="text-lg font-black text-white mb-4 tracking-[0.15em] uppercase">{comp.title}</h3>
            )}
            <div className="flex items-center gap-6">
                <svg width="140" height="140" viewBox="0 0 140 140" className="flex-shrink-0">
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
                    {segments.map(({ fraction, offset, color }, i) => (
                        <circle
                            key={i}
                            cx={cx} cy={cy} r={r}
                            fill="none"
                            stroke={color}
                            strokeWidth="14"
                            strokeDasharray={`${fraction * circ} ${circ}`}
                            strokeDashoffset={`${-offset * circ}`}
                            strokeLinecap="butt"
                            style={{
                                filter: `drop-shadow(0 0 5px ${color})`,
                                transform: 'rotate(-90deg)',
                                transformOrigin: `${cx}px ${cy}px`,
                            }}
                        />
                    ))}
                    <text x={cx} y={cy - 4} textAnchor="middle" fill="white" fontSize="18" fontWeight="900" fontFamily="monospace">
                        {comp.data.length}
                    </text>
                    <text x={cx} y={cy + 14} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8" fontFamily="monospace" letterSpacing="2">
                        NODES
                    </text>
                </svg>
                <div className="space-y-2.5 flex-1 min-w-0">
                    {segments.map(({ d, color }, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
                            <span className="text-gray-400 truncate flex-1 font-mono">{d.label}</span>
                            <span className="text-white font-black font-mono ml-2">
                                {d.value}{comp.unit || ''}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </GlassPanel>
    );
};

// ─── Chart: Line ─────────────────────────────────────────────────────────────

const LineChart = ({ comp }: { comp: ChartComponent }) => {
    const max = Math.max(...comp.data.map(d => d.value), 1);
    const min = Math.min(...comp.data.map(d => d.value));
    const W = 420, H = 120, pad = 20;
    const c = comp.data[0]?.color || '#00FFCC';
    const n = Math.max(comp.data.length - 1, 1);

    const pts = comp.data.map((d, i) => ({
        x: pad + (i / n) * (W - pad * 2),
        y: H - pad - ((d.value - min) / (max - min || 1)) * (H - pad * 2),
    }));

    const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    const fillD = `${pathD} L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z`;
    const gradId = `lg-${comp.id}`;

    return (
        <GlassPanel accentColor={c} className="min-w-[450px]">
            {comp.title && (
                <h3 className="text-lg font-black text-white mb-4 tracking-[0.15em] uppercase">{comp.title}</h3>
            )}
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
                <defs>
                    <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={c} stopOpacity="0.35" />
                        <stop offset="100%" stopColor={c} stopOpacity="0" />
                    </linearGradient>
                </defs>
                {[0, 0.33, 0.66, 1].map((t, i) => (
                    <line key={i} x1={pad} y1={pad + t * (H - pad * 2)} x2={W - pad} y2={pad + t * (H - pad * 2)}
                        stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
                ))}
                <path d={fillD} fill={`url(#${gradId})`} />
                <path d={pathD} fill="none" stroke={c} strokeWidth="2.5" style={{ filter: `drop-shadow(0 0 5px ${c})` }} />
                {pts.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={c} style={{ filter: `drop-shadow(0 0 7px ${c})` }} />
                ))}
            </svg>
            <div className="flex justify-between mt-1 px-5">
                {comp.data.map((d, i) => (
                    <span key={i} className="text-[9px] text-gray-500 font-mono uppercase">{d.label}</span>
                ))}
            </div>
        </GlassPanel>
    );
};

// ─── Chart dispatcher ─────────────────────────────────────────────────────────

const ChartRenderer = ({ comp }: { comp: ChartComponent }) => {
    if (!comp.data?.length) return null;
    if (comp.chartType === 'radial') return <RadialChart comp={comp} />;
    if (comp.chartType === 'line') return <LineChart comp={comp} />;
    return <BarChart comp={comp} />;
};

// ─── Generic dispatcher ───────────────────────────────────────────────────────

const ComponentRenderer = ({ comp }: { comp: UIComponent }) => {
    switch (comp.type) {
        case 'text':   return <TextRenderer comp={comp} />;
        case 'metric': return <MetricRenderer comp={comp} />;
        case 'card':   return <CardRenderer comp={comp} />;
        case 'list':   return <ListRenderer comp={comp} />;
        case 'chart':  return <ChartRenderer comp={comp} />;
        default:       return null;
    }
};

// ─── 3D Tunnel node ───────────────────────────────────────────────────────────

const TunnelNode = ({ comp, index, total, scrollYProgress }: {
    comp: UIComponent; index: number; total: number; scrollYProgress: any;
}) => {
    const tunnelDepth = 1500;
    const zPosition = useTransform(scrollYProgress, [0, 1], [-index * tunnelDepth, (total - index) * tunnelDepth]);
    // opacity and scale only — blur removed (it forces GPU re-rasterisation every frame)
    const opacity = useTransform(zPosition, [-5000, -300, 400, 1200], [0, 1, 1, 0]);
    const scale   = useTransform(zPosition, [-5000, 0, 1200], [0.3, 1, 2.5]);
    const xOffset = comp.type === 'text' ? 0 : (index % 2 === 0 ? '-15vw' : '15vw');

    return (
        <motion.div
            className="absolute top-1/2 left-1/2 -mt-[200px]"
            style={{
                z: zPosition,
                scale,
                opacity,
                x: `calc(-50% + ${xOffset})`,
                width: comp.w ? `${comp.w}px` : undefined,
                // Promote to GPU compositor layer — keeps transforms off the main thread
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden',
            }}
        >
            <ComponentRenderer comp={comp} />
        </motion.div>
    );
};

// ─── Canvas renderer (scroll container + tunnel) ──────────────────────────────

export const CanvasRenderer = ({ components, onReachEnd }: {
    components: UIComponent[]; onReachEnd?: () => void;
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    const { ref: inViewRef, inView } = useInView({
        threshold: 0,
        rootMargin: "0px 0px 400px 0px",
    });

    const onReachEndRef = useRef(onReachEnd);
    onReachEndRef.current = onReachEnd;
    const isTriggeredRef = useRef(false);

    useEffect(() => {
        if (inView && components.length > 0 && !isTriggeredRef.current) {
            isTriggeredRef.current = true;
            onReachEndRef.current?.();
        }
        if (!inView) isTriggeredRef.current = false;
    }, [inView, components.length]);

    const { scrollYProgress } = useScroll({
        container: scrollContainerRef,
        target: trackRef,
        offset: ["start start", "end end"]
    });

    const sorted = [...components].sort((a, b) => a.order - (b.order ?? 0));

    return (
        <div
            ref={scrollContainerRef}
            className="relative w-full h-full overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
            <div className="fixed inset-0 pointer-events-none" style={{ perspective: "1000px" }}>
                <div className="w-full h-full transform-style-3d">
                    {sorted.map((c, i) => (
                        <TunnelNode
                            key={c.id}
                            comp={c}
                            index={i}
                            total={sorted.length}
                            scrollYProgress={scrollYProgress}
                        />
                    ))}
                </div>
            </div>

            <div
                ref={trackRef}
                style={{ height: components.length > 0 ? `${Math.max(100, components.length * 80)}vh` : 0 }}
                className="w-full relative pointer-events-auto flex flex-col justify-end"
            >
                <div ref={inViewRef} className="h-[20vh] w-full pointer-events-none" />
            </div>
        </div>
    );
};
