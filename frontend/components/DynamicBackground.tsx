'use client';

import { useEffect, useRef } from 'react';

interface Props {
    themeColor?: string;
}

function hexToRgb(hex: string): [number, number, number] {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16) || 0;
    const g = parseInt(clean.slice(2, 4), 16) || 0;
    const b = parseInt(clean.slice(4, 6), 16) || 0;
    return [r, g, b];
}

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}

export function DynamicBackground({ themeColor = '#00FFCC' }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const themeRef = useRef(themeColor);

    // Keep ref in sync with prop without restarting the animation loop
    useEffect(() => {
        themeRef.current = themeColor;
    }, [themeColor]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animId: number;
        let W = window.innerWidth;
        let H = window.innerHeight;
        canvas.width = W;
        canvas.height = H;

        const onResize = () => {
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width = W;
            canvas.height = H;
        };
        window.addEventListener('resize', onResize);

        // ── Particles ──────────────────────────────────────────────────────────
        const NUM = 55;
        const particles = Array.from({ length: NUM }, () => ({
            x: Math.random() * W,
            y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            r: Math.random() * 1.8 + 0.4,
        }));

        // Smoothly interpolated color state
        let [curR, curG, curB] = hexToRgb(themeColor);
        let frame = 0;

        const draw = () => {
            animId = requestAnimationFrame(draw);
            frame++;

            // Lerp colour toward target
            const [tR, tG, tB] = hexToRgb(themeRef.current);
            curR = lerp(curR, tR, 0.018);
            curG = lerp(curG, tG, 0.018);
            curB = lerp(curB, tB, 0.018);
            const r = Math.round(curR), g = Math.round(curG), b = Math.round(curB);
            const ca = (a: number) => `rgba(${r},${g},${b},${a})`;

            // ── Background ────────────────────────────────────────────────────
            ctx.fillStyle = '#050508';
            ctx.fillRect(0, 0, W, H);

            // ── Synthwave perspective grid ────────────────────────────────────
            const horizY = H * 0.6;
            const vanX = W / 2;
            const cols = 16;
            const rows = 10;
            const speed = (frame * 0.25) % (H / rows);

            ctx.save();
            ctx.lineWidth = 1;

            // Converging vertical lines
            ctx.strokeStyle = ca(0.10);
            for (let i = 0; i <= cols; i++) {
                const bx = (i / cols) * W;
                ctx.beginPath();
                ctx.moveTo(vanX, horizY);
                ctx.lineTo(bx, H);
                ctx.stroke();
            }

            // Scrolling horizontal perspective lines
            for (let j = 0; j <= rows; j++) {
                const t = ((j / rows) + (speed / (H / rows))) % 1;
                const ty = horizY + t * (H - horizY);
                const frac = (ty - horizY) / (H - horizY);
                const lx = vanX * (1 - frac);
                const rx = vanX + frac * (W - vanX);
                ctx.globalAlpha = 0.05 + frac * 0.18;
                ctx.strokeStyle = ca(1);
                ctx.beginPath();
                ctx.moveTo(lx, ty);
                ctx.lineTo(rx, ty);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
            ctx.restore();

            // ── Horizon glow ──────────────────────────────────────────────────
            const grd = ctx.createLinearGradient(0, horizY - 40, 0, horizY + 80);
            grd.addColorStop(0, ca(0));
            grd.addColorStop(0.35, ca(0.22));
            grd.addColorStop(0.65, ca(0.10));
            grd.addColorStop(1, ca(0));
            ctx.fillStyle = grd;
            ctx.fillRect(0, horizY - 40, W, 120);

            // ── Update + draw particles ────────────────────────────────────────
            for (const p of particles) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0) p.x = W;
                if (p.x > W) p.x = 0;
                if (p.y < 0) p.y = H;
                if (p.y > H) p.y = 0;
            }

            // Connections
            const CONN = 130;
            ctx.lineWidth = 0.6;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < CONN) {
                        ctx.strokeStyle = ca((1 - d / CONN) * 0.22);
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Dots
            for (const p of particles) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = ca(0.55);
                ctx.fill();
            }

            // ── Scanlines ─────────────────────────────────────────────────────
            ctx.fillStyle = 'rgba(0,0,0,0.025)';
            for (let y = 0; y < H; y += 4) {
                ctx.fillRect(0, y, W, 1);
            }

            // ── Vignette ──────────────────────────────────────────────────────
            const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, H * 0.88);
            vig.addColorStop(0, 'rgba(0,0,0,0)');
            vig.addColorStop(1, 'rgba(0,0,0,0.7)');
            ctx.fillStyle = vig;
            ctx.fillRect(0, 0, W, H);
        };

        draw();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', onResize);
        };
    }, []); // animation loop starts once; theme changes flow through themeRef

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0 }}
        />
    );
}
