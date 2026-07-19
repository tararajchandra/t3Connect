export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">Lightning Fast Remote Desktop</h1>
        <p className="hero-subtitle">
          Experience ultra-low latency screen sharing and remote control for maximum performance and security.
        </p>
        <a href="/download/t3connect-setup.msi" className="download-btn">
          Download for Windows
        </a>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <h2 className="section-title">Why choose T3 Connect?</h2>
        <div className="features-grid">
          <div className="feature-card glass-panel">
            <div className="feature-icon">🚀</div>
            <h3>Ultra-Low Latency</h3>
            <p>Hardware accelerated H.264 encoding and decoding guarantees a smooth, real-time experience.</p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon">🔒</div>
            <h3>Secure P2P Connection</h3>
            <p>Direct peer-to-peer connections ensure your data never passes through a central server.</p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon">⚡</div>
            <h3>Lightweight</h3>
            <p>Our application is highly optimized and consumes minimal CPU and memory resources.</p>
          </div>
        </div>
      </section>

      {/* Promotions Zone */}
      <section id="promotions" className="promotions">
        <h2 className="section-title">Explore Our Other Products</h2>
        <div className="promo-grid">
          {/* RxDesk */}
          <div className="promo-card glass-panel">
            <div>
              <h3 className="promo-title">RxDesk</h3>
              <p>Advanced helpdesk and customer support ticketing system to streamline your IT operations.</p>
            </div>
            <a href="https://rxdesk.in" target="_blank" rel="noopener noreferrer" className="promo-link">
              Visit rxdesk.in →
            </a>
          </div>

          {/* GstRecon */}
          <div className="promo-card glass-panel">
            <div>
              <h3 className="promo-title">GstRecon</h3>
              <p>Automated GST reconciliation software for seamless tax compliance and reporting.</p>
            </div>
            <a href="https://gstrecon.t3sol.in" target="_blank" rel="noopener noreferrer" className="promo-link">
              Visit gstrecon.t3sol.in →
            </a>
          </div>

          {/* T3 Solutions */}
          <div className="promo-card glass-panel">
            <div>
              <h3 className="promo-title">Hisabpro ERP</h3>
              <p>Complete Enterprise Resource Planning solution by T3 Solutions to manage your business efficiently.</p>
            </div>
            <a href="https://t3sol.in" target="_blank" rel="noopener noreferrer" className="promo-link">
              Visit t3sol.in →
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
