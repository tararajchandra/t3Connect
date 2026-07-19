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
    url: "https://t3connect.in",
    siteName: "T3 Connect",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "T3 Connect | Fast P2P Remote Desktop",
    description: "Ultra-low latency, peer-to-peer remote desktop and screen sharing software.",
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
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
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="shortcut icon" type="image/png" href="/logo.png" />
      </head>
      <body>
        <nav className="navbar">
          <div className="brand">
            <img src="/logo.png" alt="T3 Connect" style={{ height: '38px', width: 'auto' }} />
          </div>
          <div className="nav-links">
            <a href="#features" id="nav-features">Features</a>
            <a href="#promotions" id="nav-products">Products</a>
            <a href="/download/t3connect-setup.msi" className="nav-download-btn" id="nav-download">
              Download
            </a>
          </div>
        </nav>

        {children}

        <footer>
          <div className="footer-inner">
            <div className="footer-brand">T3 Connect</div>
            <p className="footer-copy">© {new Date().getFullYear()} T3 Solutions. All rights reserved.</p>
            <div className="footer-links">
              <a href="https://t3sol.in" target="_blank" rel="noopener noreferrer">t3sol.in</a>
              <a href="mailto:support@t3sol.in">Contact</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
