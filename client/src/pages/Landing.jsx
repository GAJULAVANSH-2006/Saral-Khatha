import { Link } from 'react-router-dom';

const FEATURES = [
  {
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>),
    title: 'Business Health Score',
    desc: 'A single score from 0–100 combining cash flow, profitability, growth, and customer concentration — see your business at a glance.',
    large: true,
  },
  {
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>),
    title: 'Smart Invoicing & Payments',
    desc: 'GST-compliant invoices + automated reminders via SMS, Email, and WhatsApp. Stop chasing clients.',
    tags: ['SMS', 'WhatsApp', 'Email', 'GST'],
  },
  {
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>),
    title: 'Expense Analytics',
    desc: 'Spending by category with industry benchmark comparisons. Know instantly where you\'re overpaying.',
  },
  {
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>),
    title: 'Profit by Customer',
    desc: 'Your biggest client may not be your most profitable. See true margins per customer — and act on it.',
  },
  {
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>),
    title: 'Custom Fields',
    desc: 'Every business is different. Add your own fields — vehicle numbers, lot IDs, party codes — to invoices and contacts.',
  },
  {
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/></svg>),
    title: 'Transaction Management',
    desc: 'Record, categorize, and report every inflow and outflow. Full P&L and ledger exports included.',
  },
];

export default function Landing() {
  return (
    <div className="landing">
      {/* NAV */}
      <nav className="l-nav">
        <div className="l-nav-inner">
          <div className="l-logo-mark">सरल <span>Khatha</span></div>
          <div className="l-nav-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#about">About</a>
          </div>
          <div className="l-nav-cta">
            <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Try free</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '80px 32px 60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
        <div>
          <div className="l-badge">
            <span className="l-badge-dot"></span>
            Built for India's real businesses
          </div>
          <h1 className="l-h1">
            Accounting that<br /><em>actually makes sense</em>
          </h1>
          <p className="l-hero-sub">
            Saral Khatha gives you cash flow, profits, customer insights, and invoicing — all in one clean dashboard. No jargon. No CA needed to get started.
          </p>
          <div className="l-actions">
            <Link to="/register" className="btn btn-primary btn-lg">Get started free</Link>
            <a href="#features" className="btn btn-ghost btn-lg">See features →</a>
          </div>
          <div className="l-trust">
            {['No credit card', 'GST-ready invoices', 'Works on mobile'].map(t => (
              <span key={t} className="l-trust-pill">{t}</span>
            ))}
          </div>
        </div>

        {/* Mockup */}
        <div className="l-mockup">
          <div className="l-mockup-bar">
            <span className="l-mockup-dot" style={{background:'#ff5f57'}}></span>
            <span className="l-mockup-dot" style={{background:'#febc2e'}}></span>
            <span className="l-mockup-dot" style={{background:'#28c840'}}></span>
            <span className="l-mockup-title">Saral Khatha — Dashboard</span>
          </div>
          <div className="l-mockup-body">
            <div className="l-widget">
              <div className="l-widget-label">Health Score</div>
              <div style={{fontSize:'2rem', fontWeight:800, color:'#0f1117', fontFamily:'Sora,sans-serif'}}>85 <span style={{fontSize:'0.75rem', fontWeight:600, color:'#16a34a'}}>↑ Excellent</span></div>
            </div>
            <div className="l-widget">
              <div className="l-widget-label">Net Profit</div>
              <div style={{fontSize:'1.4rem', fontWeight:800, color:'#0f1117', fontFamily:'Sora,sans-serif'}}>₹1.24L</div>
              <div style={{fontSize:'0.78rem', color:'#16a34a', fontWeight:600, marginTop:4}}>+14% vs last month</div>
            </div>
            <div className="l-widget" style={{gridColumn:'span 2'}}>
              <div className="l-widget-label">Recent Invoices</div>
              {[
                {n:'Sharma Traders', a:'₹18,200', s:'paid'},
                {n:'Mehta & Sons', a:'₹9,500', s:'pending'},
                {n:'Gupta Exports', a:'₹42,000', s:'paid'},
              ].map(r => (
                <div key={r.n} style={{display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #f5f6f8', fontSize:'0.82rem'}}>
                  <span style={{color:'#374050', fontWeight:500}}>{r.n}</span>
                  <span style={{fontWeight:700, color: r.s==='paid' ? '#16a34a' : '#f59e0b'}}>{r.a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PROOF STRIP */}
      <div className="l-proof">
        <div className="l-proof-inner">
          <span><strong>2,400+</strong> businesses</span>
          <span className="l-proof-divider">·</span>
          <span><strong>₹380 Cr+</strong> invoices managed</span>
          <span className="l-proof-divider">·</span>
          <span><strong>12 states</strong> across India</span>
          <span className="l-proof-divider">·</span>
          <span><strong>4.8 ★</strong> rating</span>
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" className="l-features">
        <div className="l-section-tag">Core Features</div>
        <h2 className="l-section-h2">Everything you need. <span className="dim">Nothing you don't.</span></h2>
        <p className="l-section-sub">Six focused tools that cover the full accounting lifecycle.</p>
        <div className="l-feat-grid">
          {FEATURES.map(f => (
            <div key={f.title} className={`l-feat-card${f.large ? ' large' : ''}`}>
              <div className="l-feat-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              {f.tags && (
                <div className="l-feat-tags">
                  {f.tags.map(t => <span key={t} className="l-feat-tag">{t}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="l-pricing">
        <div className="l-pricing-inner">
          <div style={{textAlign:'center', marginBottom:48}}>
            <div className="l-section-tag" style={{justifyContent:'center', display:'flex'}}>Pricing</div>
            <h2 className="l-section-h2">Simple. Honest. No surprises.</h2>
            <p style={{color:'var(--ink-600)'}}>One plan. Everything included. Cancel anytime.</p>
          </div>
          <div className="l-pricing-grid">
            {[
              { name:'Starter', price:'Free', priceSub:'forever', desc:'Try with no time limits on core features.', features:['Up to 50 invoices/month','3 custom fields','Basic expense tracking','Email reminders'], cta:'Get started', link:'/register', popular:false },
              { name:'Pro', price:'₹999', priceSub:'/ month', desc:'For growing businesses that need the full picture.', features:['Unlimited invoices','All 6 core features','WhatsApp + SMS reminders','Unlimited custom fields','Profit by customer reports','Business health score','Priority support'], cta:'Start 14-day free trial', link:'/register', popular:true },
              { name:'Business', price:'₹2,499', priceSub:'/ month', desc:'For multi-user teams and multiple entities.', features:['Everything in Pro','Up to 5 users','Multiple business profiles','Custom reports','Dedicated onboarding'], cta:'Contact us', link:'/register', popular:false },
            ].map(p => (
              <div key={p.name} className={`l-price-card${p.popular ? ' popular' : ''}`}>
                {p.popular && <div className="l-popular-badge">Most popular</div>}
                <div className="l-plan-name">{p.name}</div>
                <div className="l-plan-price">{p.price} <span>{p.priceSub}</span></div>
                <p className="l-plan-desc">{p.desc}</p>
                <ul className="l-plan-features">
                  {p.features.map(f => <li key={f}>{f}</li>)}
                </ul>
                <Link to={p.link} className={`btn btn-lg ${p.popular ? 'btn-primary' : 'btn-outline'}`} style={{width:'100%'}}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="l-footer" id="about">
        <div className="l-footer-inner">
          <div className="l-footer-brand">
            <div className="l-logo-mark" style={{color:'rgba(255,255,255,.85)'}}>सरल <span>Khatha</span></div>
            <p>Simple accounting for the businesses that build India.</p>
          </div>
          {[
            { h:'Product', links:['Features','Pricing','Changelog','Roadmap'] },
            { h:'Resources', links:['Help center','GST guide','Invoice templates','Blog'] },
            { h:'Company', links:['About us','Careers','Privacy','Terms'] },
          ].map(col => (
            <div key={col.h} className="l-footer-col">
              <h5>{col.h}</h5>
              {col.links.map(l => <a key={l} href="#">{l}</a>)}
            </div>
          ))}
        </div>
        <div className="l-footer-bottom">
          <span>© 2025 Saral Khatha. All rights reserved.</span>
          <span>Made with care in India 🇮🇳</span>
        </div>
      </footer>
    </div>
  );
}
