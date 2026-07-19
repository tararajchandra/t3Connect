export default function Home() {
  return (
    <main>
      {/* ── HERO ── */}
      <section className="hero">
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: '2px solid var(--saffron)',
          boxShadow: '0 0 32px rgba(255,107,0,0.5), 0 0 80px rgba(255,107,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 28px',
          background: 'transparent',
          overflow: 'hidden',
        }}>
          <img
            src="/logo.png"
            alt="T3 Solutions"
            style={{ height: '100%', width: '100%', objectFit: 'cover' }}
          />
        </div>

        <div className="hero-badge">
          <span className="hero-badge-dot" />
          100% Peer-to-Peer · Zero Central Server
        </div>

        <h1 className="hero-title">
          Remote Desktop,{" "}
          <span className="gradient-saffron">Reimagined</span>{" "}
          <br />
          <span className="gradient-cyan">Lightning Fast.</span>
        </h1>

        <p className="hero-subtitle">
          Connect to any computer instantly with ultra-low latency. Secure P2P screen sharing
          and remote support — no subscriptions, no data breaches.
        </p>

        <div className="hero-buttons">
          <a href="/download/t3connect-setup.msi" className="download-btn" id="hero-download-btn">
            <span>⬇ Download for Windows</span>
          </a>
          <a href="#features" className="secondary-btn" id="hero-features-btn">
            See Features →
          </a>
        </div>

        <div className="hero-stats">
          <div className="stat-item">
            <div className="stat-number">&lt;50ms</div>
            <div className="stat-label">Latency</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">P2P</div>
            <div className="stat-label">Architecture</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">E2E</div>
            <div className="stat-label">Encrypted</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">Free</div>
            <div className="stat-label">Forever</div>
          </div>
        </div>
      </section>

      <hr className="gradient-divider" />

      {/* ── FEATURES ── */}
      <section id="features" className="features">
        <p className="section-eyebrow">Why T3 Connect</p>
        <h2 className="section-title">Everything you need, nothing you don&apos;t</h2>
        <p className="section-subtitle">
          Built from the ground up for speed, security, and simplicity.
        </p>

        <div className="features-grid">
          <div className="feature-card glass-panel fc-saffron" id="feature-latency">
            <div className="feature-icon-wrapper fi-saffron">🚀</div>
            <h3>Ultra-Low Latency</h3>
            <p>Hardware-accelerated H.264 encoding and WebRTC transport guarantee a buttery-smooth, real-time remote experience under 50ms.</p>
          </div>

          <div className="feature-card glass-panel fc-cyan" id="feature-security">
            <div className="feature-icon-wrapper fi-cyan">🔒</div>
            <h3>True P2P Security</h3>
            <p>Direct peer-to-peer connections with end-to-end DTLS/SRTP encryption. Your screen data never touches a third-party server.</p>
          </div>

          <div className="feature-card glass-panel fc-yellow" id="feature-lightweight">
            <div className="feature-icon-wrapper fi-yellow">⚡</div>
            <h3>Blazing Lightweight</h3>
            <p>Built entirely in Rust and Tauri. Tiny binary, minimal RAM footprint, and near-zero CPU overhead when idle.</p>
          </div>

          <div className="feature-card glass-panel fc-saffron" id="feature-simple">
            <div className="feature-icon-wrapper fi-saffron">🎯</div>
            <h3>Simple 6-Digit PIN</h3>
            <p>No accounts. No setup. Share a 6-digit session PIN with anyone and connect in seconds — just like it should be.</p>
          </div>

          <div className="feature-card glass-panel fc-cyan" id="feature-control">
            <div className="feature-icon-wrapper fi-cyan">🖱️</div>
            <h3>Full Remote Control</h3>
            <p>Complete keyboard and mouse passthrough. Control the remote machine as if you were sitting right in front of it.</p>
          </div>

          <div className="feature-card glass-panel fc-yellow" id="feature-free">
            <div className="feature-icon-wrapper fi-yellow">🎁</div>
            <h3>Always Free</h3>
            <p>No subscriptions, no trials, no hidden charges. T3 Connect is completely free to use — forever. For individuals and teams alike.</p>
          </div>
        </div>
      </section>

      <hr className="gradient-divider" />

      {/* ── HOW IT WORKS ── */}
      <section className="how-it-works">
        <div className="how-it-works-inner">
          <p className="section-eyebrow">How It Works</p>
          <h2 className="section-title">Up and running in 3 steps</h2>

          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Install the App</h3>
              <p>Download and install T3 Connect on both computers. It takes less than a minute.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Share Your PIN</h3>
              <p>The host clicks &quot;Share My Screen&quot; and gets a unique 6-digit session PIN.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Connect Instantly</h3>
              <p>The viewer enters the PIN and gets a live, encrypted P2P stream in seconds.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="cta-banner">
        <h2>
          Ready to go <span className="gradient-saffron">faster</span>?
        </h2>
        <p>
          Download T3 Connect for free and experience the next generation of remote desktop.
        </p>
        <a href="/download/t3connect-setup.msi" className="download-btn" id="cta-download-btn">
          <span>⬇ Download for Windows — Free</span>
        </a>
      </section>

      {/* ── PROMOTIONS ── */}
      <section id="promotions" className="promotions">
        <div className="promotions-inner">
          <p className="section-eyebrow">T3 Solutions Ecosystem</p>
          <h2 className="section-title">More products you&apos;ll love</h2>
          <p className="section-subtitle">
            A full suite of tools built to power your business.
          </p>

          <div className="promo-grid">
            <div className="promo-card glass-panel" id="promo-rxdesk">
              <div>
                <span className="promo-tag tag-saffron">Helpdesk</span>
                <h3 className="promo-title">RxDesk</h3>
                <p>Advanced helpdesk and customer support ticketing system to streamline your IT operations and delight your customers.</p>
              </div>
              <a href="https://rxdesk.in" target="_blank" rel="noopener noreferrer" className="promo-link promo-link-saffron" id="promo-rxdesk-link">
                Visit rxdesk.in →
              </a>
            </div>

            <div className="promo-card glass-panel" id="promo-gstrecon">
              <div>
                <span className="promo-tag tag-cyan">Compliance</span>
                <h3 className="promo-title">GstRecon</h3>
                <p>Automated GST reconciliation software for seamless tax compliance and accurate, on-time reporting — zero manual effort.</p>
              </div>
              <a href="https://gstrecon.t3sol.in" target="_blank" rel="noopener noreferrer" className="promo-link promo-link-cyan" id="promo-gstrecon-link">
                Visit gstrecon.t3sol.in →
              </a>
            </div>

            <div className="promo-card glass-panel" id="promo-hisabpro">
              <div>
                <span className="promo-tag tag-yellow">ERP</span>
                <h3 className="promo-title">Hisabpro ERP</h3>
                <p>Complete Enterprise Resource Planning solution by T3 Solutions to manage your entire business in one unified platform.</p>
                <div className="footer-links">
                  <a href="https://t3sol.in" target="_blank" rel="noopener noreferrer">t3sol.in</a>
                  <a href="mailto:support@t3sol.in">Contact</a>
                </div>
              </div>
              <a href="https://t3sol.in" target="_blank" rel="noopener noreferrer" className="promo-link promo-link-yellow" id="promo-hisabpro-link">
                Visit t3sol.in →
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
