import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Canvas of Infinite Realities',
  description: 'A fluid generative UI designed by Claude.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground overflow-hidden">
        {children}
      </body>
    </html>
  );
}
