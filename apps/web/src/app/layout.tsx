import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DesignForge - Production Design Platform & Autonomous AI Agent Studio',
  description: 'Original high-performance design engine with first-class MCP Agent Control Layer, Magic Resize, Brand Kits, and Real-Time Collaboration.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-dark-bg text-slate-100 antialiased h-screen w-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
