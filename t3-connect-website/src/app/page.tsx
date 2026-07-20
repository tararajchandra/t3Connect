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
          <a href="https://1drv.ms/u/c/341c25ad9130053e/IQBee-xxrYU6Q5Z3HmPpvHfRASo4IVr80Ws2DTjKoHzbtzc?e=a7ohBn" target="_blank" rel="noopener noreferrer" className="download-btn" id="hero-download-btn">
            <span>⬇ Download for Windows</span>
          </a>
          <a href="#features" className="secondary-btn" id="hero-features-btn">
            See Features →
          </a>
        </div>
        <div style={{ marginTop: '15px', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', textAlign: 'center' }}>
          * To open use this password: <strong style={{ color: '#fff' }}>t3sol.in</strong>
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
        <a href="https://1drv.ms/u/c/341c25ad9130053e/IQBee-xxrYU6Q5Z3HmPpvHfRASo4IVr80Ws2DTjKoHzbtzc?e=a7ohBn" target="_blank" rel="noopener noreferrer" className="download-btn" id="cta-download-btn">
          <span>⬇ Download for Windows — Free</span>
        </a>
        <p style={{ marginTop: '15px', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)' }}>
          * To open use this password: <strong style={{ color: '#fff' }}>t3sol.in</strong>
        </p>
      </section>

      {/* ── PROMOTIONS ── */}
      <section id="promotions" className="promotions">
        <div className="promotions-inner">
          <p className="section-eyebrow">T3 Solutions Ecosystem</p>
          <h2 className="section-title">More products you&apos;ll love</h2>
          <p className="section-subtitle">
            T3 Connect is completely <strong style={{ color: '#FF6B00' }}>free</strong> — and so are these powerful tools built to grow your business.
          </p>

          <div className="promo-grid-new">

            {/* ── RxDesk ── */}
            <div className="promo-card-new glass-panel promo-saffron" id="promo-rxdesk">
              <div className="promo-card-header">
                <div className="promo-logo-wrap promo-logo-saffron">
                  <img src="/rxdesk-logo.png" alt="RxDesk Logo" className="promo-logo-img" />
                </div>
                <div>
                  <span className="promo-tag tag-saffron">Pharmacy Billing</span>
                  <h3 className="promo-title-new">RxDesk</h3>
                </div>
              </div>
              <p className="promo-desc">Advanced pharmacy billing &amp; helpdesk solution. Streamline prescriptions, stock, and customer support — all in one place.</p>
              <ul className="promo-features">
                <li>💊 Prescription &amp; Billing Management</li>
                <li>📦 Stock &amp; Inventory Tracking</li>
                <li>🎫 Customer Support Ticketing</li>
                <li>📊 Sales Reports &amp; Analytics</li>
              </ul>
              <div className="promo-actions">
                <a href="https://rxdesk.in" target="_blank" rel="noopener noreferrer" className="promo-btn promo-btn-saffron" id="promo-rxdesk-link">
                  Visit rxdesk.in →
                </a>
                <a
                  href="https://wa.me/919830450252?text=Hi%2C%20I%20am%20interested%20in%20RxDesk.%20Please%20share%20more%20details."
                  target="_blank" rel="noopener noreferrer"
                  className="promo-btn promo-btn-whatsapp" id="promo-rxdesk-whatsapp"
                >
                  <span>💬</span> Enquire on WhatsApp
                </a>
              </div>
            </div>

            {/* ── GstRecon ── */}
            <div className="promo-card-new glass-panel promo-cyan" id="promo-gstrecon">
              <div className="promo-card-header">
                <div className="promo-logo-wrap promo-logo-cyan">
                  <span style={{ fontSize: '2.2rem' }}>🧾</span>
                </div>
                <div>
                  <span className="promo-tag tag-cyan">GST Compliance</span>
                  <h3 className="promo-title-new">GstRecon</h3>
                </div>
              </div>
              <p className="promo-desc">Automated GST reconciliation software for seamless tax compliance and accurate, on-time reporting — zero manual effort.</p>
              <ul className="promo-features">
                <li>🔄 Auto GSTR-2A/2B Reconciliation</li>
                <li>📋 ITC Mismatch Detection</li>
                <li>📤 Bulk Filing Support</li>
                <li>⚡ Zero Manual Effort</li>
              </ul>
              <div className="promo-actions">
                <a href="https://gstrecon.t3sol.in" target="_blank" rel="noopener noreferrer" className="promo-btn promo-btn-cyan" id="promo-gstrecon-link">
                  Visit gstrecon.t3sol.in →
                </a>
                <a
                  href="https://wa.me/919830450252?text=Hi%2C%20I%20am%20interested%20in%20GstRecon.%20Please%20share%20more%20details."
                  target="_blank" rel="noopener noreferrer"
                  className="promo-btn promo-btn-whatsapp" id="promo-gstrecon-whatsapp"
                >
                  <span>💬</span> Enquire on WhatsApp
                </a>
              </div>
            </div>

            {/* ── Hisabpro ERP ── */}
            <div className="promo-card-new glass-panel promo-yellow" id="promo-hisabpro">
              <div className="promo-card-header">
                <div className="promo-logo-wrap promo-logo-yellow">
                  <img src="/hisabpro-logo.png" alt="Hisabpro ERP Logo" className="promo-logo-img" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="promo-tag tag-yellow">ERP</span>
                    <span className="coming-soon-badge">🚀 Coming Soon</span>
                  </div>
                  <h3 className="promo-title-new">Hisabpro ERP</h3>
                </div>
              </div>
              <p className="promo-desc">The Ultimate All-in-One Cloud ERP &amp; Accounting Solution. Simplify your business, amplify your growth.</p>
              <ul className="promo-features">
                <li>📊 Smart Accounting &amp; Auto Bank Import</li>
                <li>📦 Inventory &amp; Stock Management</li>
                <li>🧾 GST Invoicing &amp; Billing</li>
                <li>👥 HR &amp; Payroll Management</li>
                <li>📈 Advanced Reporting &amp; CRM</li>
              </ul>
              <div className="promo-earlybird">
                🎉 <strong>EARLYBIRD OFFER:</strong> Get 3-User LAN Version <span style={{ color: '#FFD600' }}>FREE!</span>
              </div>
              <div className="promo-actions">
                <a href="https://hisabproerp.com" target="_blank" rel="noopener noreferrer" className="promo-btn promo-btn-yellow" id="promo-hisabpro-link">
                  Visit hisabproerp.com →
                </a>
                <a
                  href="https://wa.me/919830450252?text=Hi%2C%20I%20am%20interested%20in%20Hisabpro%20ERP.%20Please%20share%20more%20details."
                  target="_blank" rel="noopener noreferrer"
                  className="promo-btn promo-btn-whatsapp" id="promo-hisabpro-whatsapp"
                >
                  <span>💬</span> Enquire on WhatsApp
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
