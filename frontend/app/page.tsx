'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import { UIComponent } from '@/lib/schema';
import { CanvasRenderer } from '@/components/CanvasRenderer';
import { DynamicBackground } from '@/components/DynamicBackground';
import { v4 as uuidv4 } from 'uuid';

const THEME_PALETTE = ['#00FFCC', '#B200FF', '#FF0055', '#00AAFF', '#FFFF00', '#FF6600'];

export default function CanvasPage() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [components, setComponents] = useState<UIComponent[]>([]);
  const [roomId, setRoomId] = useState<string>('');
  // Stores the last submitted prompt so infinite scroll can reuse it after the input is cleared
  const lastPromptRef = useRef<string>('');

  // Derive a themeColor from the current components so the background reacts to content
  const themeColor = useMemo(() => {
    for (const c of components) {
      if (c.type === 'text' && c.color) return c.color;
      if (c.type === 'chart' && c.data?.[0]?.color) return c.data[0].color;
      if (c.type === 'metric') {
        if (c.trend === 'up') return '#10b981';
        if (c.trend === 'down') return '#ef4444';
      }
    }
    return THEME_PALETTE[components.length % THEME_PALETTE.length];
  }, [components]);

  useEffect(() => {
    // Check URL hash for existing room or create a new one
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setRoomId(hash);
      loadRoomData(hash);
    } else {
      const newRoom = uuidv4();
      setRoomId(newRoom);
      window.location.hash = newRoom;
    }
  }, []);

  const loadRoomData = async (rId: string) => {
    try {
      const res = await fetch(`http://localhost:4000/canvas/${rId}`);
      const data = await res.json();
      if (data.cards) {
        // Sort descending because generating appends
        setComponents(data.cards.sort((a: any, b: any) => a.order - b.order));
      }
    } catch (error) {
      console.error('Failed to load room data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !roomId) return;
    setIsGenerating(true);
    // Persist the prompt so infinite scroll can reuse it after the input is cleared
    lastPromptRef.current = prompt;

    try {
      const res = await fetch('http://localhost:4000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, roomId })
      });

      const data = await res.json();
      if (data.components) {
        setComponents(data.components);
      }
    } catch (err) {
      console.error(err);
      setComponents([{
        id: "error1",
        type: "card",
        title: "Connection Error",
        content: "Could not reach the backend architect.",
        order: 1,
        w: 500
      } as UIComponent]);
    } finally {
      setIsGenerating(false);
      setPrompt('');
    }
  };

  const handleGenerateMore = useCallback(async () => {
    // Use the persisted prompt — the input field is cleared after the first submit
    if (isGenerating || !lastPromptRef.current || !roomId) return;
    setIsGenerating(true);

    try {
      const res = await fetch('http://localhost:4000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: lastPromptRef.current, roomId })
      });

      const data = await res.json();
      if (data.components) {
        setComponents(data.components);
      }
    } catch (err) {
      console.error('Failed to append tunnel:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, roomId]);

  return (
    <main className="relative w-screen h-screen bg-[#050508] overflow-hidden">
      {/* Dynamic Background */}
      <DynamicBackground themeColor={themeColor} />

      {/* Canvas Area */}
      <div className="fixed inset-0 z-10 pointer-events-auto">
        <CanvasRenderer
          components={components}
          onReachEnd={handleGenerateMore}
        />

        {/* Infinite Scroll Loading Indicator */}
        {isGenerating && components.length > 0 && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin mr-3" />
            <span className="text-white font-medium tracking-wide">Synthesizing Next Sequence...</span>
          </div>
        )}
      </div>

      {/* Center Input. Once components exist, we stick it at the bottom so it isn't in the way of the tunnel */}
      <div className="fixed inset-0 pointer-events-none flex flex-col items-center justify-center p-6 z-50">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: components.length > 0 ? '40vh' : 0,
            scale: components.length > 0 ? 0.9 : 1
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          onSubmit={handleSubmit}
          className="relative z-10 w-full max-w-xl px-6 pointer-events-auto"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl transition-all duration-500 group-focus-within:bg-blue-500/40 group-focus-within:blur-2xl" />
            <div className="relative bg-[#0d0d14]/80 backdrop-blur-md border border-white/5 rounded-2xl p-2 flex items-center shadow-2xl">
              {isGenerating && components.length === 0 ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 ml-3 text-purple-400" />
                </motion.div>
              ) : (
                <Sparkles className="w-5 h-5 ml-3 text-blue-400 opacity-70 group-focus-within:opacity-100 transition-opacity" />
              )}
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating && components.length === 0}
                placeholder="What reality shall we construct today?"
                className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-lg text-white placeholder:text-gray-500 font-light tracking-wide disabled:opacity-50"
              />
            </div>
          </div>
        </motion.form>
      </div>

    </main>
  );
}

