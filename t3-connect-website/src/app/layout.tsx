import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "T3 Connect | Remote Desktop & Screen Sharing",
  description: "Ultra-low latency, peer-to-peer remote desktop and screen sharing software.",
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
