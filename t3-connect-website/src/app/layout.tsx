import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "T3 Connect | P2P Remote Desktop & Screen Sharing Software",
  description: "Experience ultra-low latency, peer-to-peer remote desktop and secure screen sharing. The perfect remote support tool for IT professionals and teams.",
  keywords: ["p2p remote desktop", "remote support", "screen sharing", "low latency remote desktop", "remote access software", "peer-to-peer screen sharing", "Windows remote control", "t3 solutions", "fast remote desktop", "secure remote desktop", "IT support tool"],
  authors: [{ name: "T3 Solutions", url: "https://t3sol.in" }],
  creator: "T3 Solutions",
  openGraph: {
    title: "T3 Connect | Fast P2P Remote Desktop",
    description: "Ultra-low latency, peer-to-peer remote desktop and screen sharing software.",
    url: "https://t3connect.in", // Update this with actual domain if different
    siteName: "T3 Connect",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "T3 Connect | Fast P2P Remote Desktop",
    description: "Ultra-low latency, peer-to-peer remote desktop and screen sharing software.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <nav className="navbar glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
          <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.png" alt="t3 Solutions" style={{ height: '40px', width: 'auto' }} />
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#promotions">More Products</a>
          </div>
        </nav>
        {children}
        <footer>
          <p>© {new Date().getFullYear()} T3 Solutions. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
