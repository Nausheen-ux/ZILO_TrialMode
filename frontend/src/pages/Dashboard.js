import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const DEMO = {
  overview: {
    totalSessions: 187,
    avgKeepRate: 0.58,
    totalItems: 748,
    totalKept: 433,
    totalReturned: 315,
    pullCount: 3,
    watchCount: 4,
    boostCount: 5
  },
  skus: [
    { name: 'Floral Wrap Dress', brand: 'TrueBrowns', category: 'Dresses', kept: 28, returned: 8, total: 36, keepRate: 0.78, topReason: null, flag: 'BOOST', action: 'High converter — increase inventory and curation visibility' },
    { name: 'Linen Blazer', brand: 'AND', category: 'Workwear', kept: 19, returned: 14, total: 33, keepRate: 0.58, topReason: "Didn't fit right", flag: 'WATCH', action: 'Monitor — "Didn\'t fit right" is emerging pattern' },
    { name: 'Midi Slip Dress', brand: 'Vero Moda', category: 'Dresses', kept: 11, returned: 19, total: 30, keepRate: 0.37, topReason: 'Colour looked different', flag: 'PULL', action: 'Reshoot product photography — colour mismatch' },
    { name: 'Wide Leg Jeans', brand: 'Only', category: 'Bottoms', kept: 9, returned: 16, total: 25, keepRate: 0.36, topReason: "Didn't fit right", flag: 'PULL', action: 'Fix size guide or remove — consistent fit complaints' },
    { name: 'Embroidered Kurta', brand: 'Libas', category: 'Ethnic', kept: 22, returned: 7, total: 29, keepRate: 0.76, topReason: null, flag: 'BOOST', action: 'High converter — increase inventory and curation visibility' },
    { name: 'Satin Slip Skirt', brand: 'Sassafras', category: 'Bottoms', kept: 8, returned: 14, total: 22, keepRate: 0.36, topReason: 'Quality concern', flag: 'PULL', action: 'Escalate to brand partner — quality flag' },
    { name: 'Ribbed Co-ord Set', brand: 'Vero Moda', category: 'Co-ords', kept: 16, returned: 7, total: 23, keepRate: 0.70, topReason: null, flag: null, action: null },
    { name: 'Printed Maxi Dress', brand: 'TrueBrowns', category: 'Dresses', kept: 18, returned: 5, total: 23, keepRate: 0.78, topReason: null, flag: 'BOOST', action: 'High converter — increase inventory and curation visibility' },
  ],
  brands: [
    { brand: 'TrueBrowns', kept: 71, returned: 22, total: 93, keepRate: 0.76, topReason: null, flag: 'EXPAND', action: 'Strong brand — negotiate deeper catalogue and priority slots' },
    { brand: 'Vero Moda', kept: 48, returned: 41, total: 89, keepRate: 0.54, topReason: 'Colour looked different', flag: null, action: null },
    { brand: 'AND', kept: 39, returned: 34, total: 73, keepRate: 0.53, topReason: "Didn't fit right", flag: null, action: null },
    { brand: 'Only', kept: 28, returned: 38, total: 66, keepRate: 0.42, topReason: "Didn't fit right", flag: null, action: null },
    { brand: 'Libas', kept: 41, returned: 18, total: 59, keepRate: 0.69, topReason: null, flag: null, action: null },
    { brand: 'Sassafras', kept: 18, returned: 27, total: 45, keepRate: 0.40, topReason: 'Quality concern', flag: 'REVIEW', action: 'Review brand partnership — 60% return rate above threshold' },
  ],
  reasons: [
    { reason: "Didn't fit right", count: 112, topBrand: 'AND', topSku: 'Linen Blazer', owner: 'Curation + Sizing', priority: 'HIGH' },
    { reason: 'Not my style', count: 78, topBrand: 'Only', topSku: 'Wide Leg Jeans', owner: 'Personalisation', priority: 'HIGH' },
    { reason: 'Colour looked different', count: 64, topBrand: 'Vero Moda', topSku: 'Midi Slip Dress', owner: 'Photography / Tech', priority: 'MEDIUM' },
    { reason: 'Quality concern', count: 38, topBrand: 'Sassafras', topSku: 'Satin Slip Skirt', owner: 'Brand Partnerships', priority: 'HIGH' },
    { reason: 'Changed my mind', count: 23, topBrand: null, topSku: null, owner: 'No action needed', priority: 'LOW' },
  ]
};

const FLAG_CONFIG = {
  PULL:   { label: 'Pull', color: '#e8705a', bg: 'rgba(232,112,90,0.12)', desc: 'Remove or fix immediately' },
  WATCH:  { label: 'Watch', color: '#e8c547', bg: 'rgba(232,197,71,0.12)', desc: 'Monitor closely' },
  BOOST:  { label: 'Boost', color: '#2d5a27', bg: 'rgba(45,90,39,0.12)', desc: 'Increase visibility' },
  REVIEW: { label: 'Review', color: '#e8705a', bg: 'rgba(232,112,90,0.12)', desc: 'Brand partnership review' },
  EXPAND: { label: 'Expand', color: '#2d5a27', bg: 'rgba(45,90,39,0.12)', desc: 'Grow this partnership' },
};

const PRIORITY_COLOR = { HIGH: '#e8705a', MEDIUM: '#e8c547', LOW: '#8a8a8a' };

function FlagBadge({ flag }) {
  if (!flag) return null;
  const cfg = FLAG_CONFIG[flag];
  return (
    <span className="flag-badge" style={{ color: cfg.color, background: cfg.bg }}>
      {cfg.label}
    </span>
  );
}

function Tab({ label, active, onClick, count }) {
  return (
    <button className={`dash-tab ${active ? 'active' : ''}`} onClick={onClick}>
      {label}
      {count !== undefined && <span className="tab-count">{count}</span>}
    </button>
  );
}

function Dashboard() {
  const [data, setData] = useState(DEMO);
  const [usingDemo, setUsingDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('skus');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    axios.get('/api/trial/intelligence')
      .then(res => { if (res.data.success && res.data.data) setData(res.data.data); else setUsingDemo(true); })
      .catch(() => setUsingDemo(true))
      .finally(() => setLoading(false));
  }, []);

  const { overview, skus, brands, reasons } = data;
  const filteredSkus = filter === 'ALL' ? skus : skus.filter(s => s.flag === filter);
  const actionableSkus = skus.filter(s => s.flag === 'PULL' || s.flag === 'WATCH');
  const highReasons = reasons.filter(r => r.priority === 'HIGH');

  return (
    <div className="dashboard">

      {/* Header */}
      <div className="dash-header">
        <div>
          <div className="dash-logo">ZILO</div>
          <div className="dash-subtitle">Return Intelligence · Ops Dashboard</div>
        </div>
        {usingDemo && <span className="demo-badge">Demo Data</span>}
      </div>

      {loading ? <div className="dash-loading">Loading intelligence...</div> : <>

        {/* Overview strip */}
        <div className="overview-strip">
          <div className="ov-card">
            <div className="ov-val">{overview.totalSessions}</div>
            <div className="ov-label">Trial Sessions</div>
          </div>
          <div className="ov-card">
            <div className="ov-val" style={{ color: overview.avgKeepRate >= 0.6 ? '#2d5a27' : '#e8705a' }}>
              {Math.round(overview.avgKeepRate * 100)}%
            </div>
            <div className="ov-label">Avg Keep Rate</div>
          </div>
          <div className="ov-card">
            <div className="ov-val">{overview.totalReturned}</div>
            <div className="ov-label">Items Returned</div>
          </div>
          <div className="ov-card">
            <div className="ov-val" style={{ color: '#e8705a' }}>{overview.pullCount}</div>
            <div className="ov-label">SKUs to Pull</div>
          </div>
        </div>

        {/* Urgent flags */}
        {actionableSkus.length > 0 && (
          <div className="urgent-section">
            <div className="urgent-header">
              <span className="urgent-dot" />
              {actionableSkus.filter(s => s.flag === 'PULL').length} SKUs need immediate action
            </div>
            <div className="urgent-list">
              {actionableSkus.filter(s => s.flag === 'PULL').map(sku => (
                <div key={sku.name} className="urgent-card">
                  <div className="urgent-card-top">
                    <div>
                      <div className="urgent-sku-name">{sku.name}</div>
                      <div className="urgent-sku-brand">{sku.brand} · {Math.round(sku.keepRate * 100)}% keep rate · {sku.returned} returns</div>
                    </div>
                    <FlagBadge flag={sku.flag} />
                  </div>
                  <div className="urgent-action">→ {sku.action}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* High-priority reason alerts */}
        {highReasons.length > 0 && (
          <div className="reason-alerts">
            {highReasons.map(r => (
              <div key={r.reason} className="reason-alert">
                <div className="ra-left">
                  <span className="ra-priority" style={{ color: PRIORITY_COLOR[r.priority] }}>
                    ● {r.priority}
                  </span>
                  <span className="ra-reason">{r.reason}</span>
                  <span className="ra-count">{r.count}×</span>
                </div>
                <div className="ra-right">
                  <span className="ra-owner">{r.owner}</span>
                  {r.topBrand && <span className="ra-detail">Worst: {r.topBrand}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="dash-tabs">
          <Tab label="SKUs" active={activeTab === 'skus'} onClick={() => setActiveTab('skus')} count={skus.length} />
          <Tab label="Brands" active={activeTab === 'brands'} onClick={() => setActiveTab('brands')} count={brands.length} />
          <Tab label="Return Reasons" active={activeTab === 'reasons'} onClick={() => setActiveTab('reasons')} />
        </div>

        {/* SKU Table */}
        {activeTab === 'skus' && (
          <div className="tab-content">
            <div className="filter-row">
              {['ALL', 'PULL', 'WATCH', 'BOOST'].map(f => (
                <button
                  key={f}
                  className={`filter-btn ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                  style={filter === f && FLAG_CONFIG[f] ? { background: FLAG_CONFIG[f].bg, color: FLAG_CONFIG[f].color, borderColor: FLAG_CONFIG[f].color } : {}}
                >
                  {f === 'ALL' ? 'All SKUs' : FLAG_CONFIG[f].label}
                  {f !== 'ALL' && <span> ({skus.filter(s => s.flag === f).length})</span>}
                </button>
              ))}
            </div>
            <div className="sku-list">
              {filteredSkus.map(sku => (
                <div key={sku.name} className="sku-card">
                  <div className="sku-card-top">
                    <div className="sku-main">
                      <div className="sku-name">{sku.name}</div>
                      <div className="sku-meta">{sku.brand} · {sku.category} · {sku.total} trials</div>
                    </div>
                    <div className="sku-right">
                      <div className="sku-rate" style={{ color: sku.keepRate >= 0.65 ? '#2d5a27' : sku.keepRate >= 0.45 ? '#e8c547' : '#e8705a' }}>
                        {Math.round(sku.keepRate * 100)}%
                      </div>
                      <FlagBadge flag={sku.flag} />
                    </div>
                  </div>
                  <div className="sku-bar-row">
                    <div className="sku-bar-wrap">
                      <div className="sku-bar-keep" style={{ width: `${sku.keepRate * 100}%` }} />
                      <div className="sku-bar-return" style={{ width: `${(1 - sku.keepRate) * 100}%` }} />
                    </div>
                    <div className="sku-bar-labels">
                      <span style={{ color: '#2d5a27' }}>{sku.kept} kept</span>
                      <span style={{ color: '#e8705a' }}>{sku.returned} returned</span>
                    </div>
                  </div>
                  {sku.action && (
                    <div className="sku-action">→ {sku.action}</div>
                  )}
                  {sku.topReason && (
                    <div className="sku-top-reason">Top reason: {sku.topReason}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Brand Table */}
        {activeTab === 'brands' && (
          <div className="tab-content">
            <div className="brand-list">
              {brands.map((b, i) => (
                <div key={b.brand} className="brand-card">
                  <div className="brand-card-top">
                    <div>
                      <div className="brand-name">{b.brand}</div>
                      <div className="brand-meta">{b.total} total trials · {b.kept} kept · {b.returned} returned</div>
                    </div>
                    <div className="brand-right">
                      <div className="brand-rate" style={{ color: b.keepRate >= 0.65 ? '#2d5a27' : b.keepRate >= 0.5 ? '#e8c547' : '#e8705a' }}>
                        {Math.round(b.keepRate * 100)}%
                      </div>
                      <FlagBadge flag={b.flag} />
                    </div>
                  </div>
                  <div className="brand-bar-row">
                    <div className="sku-bar-wrap">
                      <div className="sku-bar-keep" style={{ width: `${b.keepRate * 100}%` }} />
                      <div className="sku-bar-return" style={{ width: `${(1-b.keepRate)*100}%` }} />
                    </div>
                  </div>
                  {b.action && <div className="sku-action">→ {b.action}</div>}
                  {b.topReason && <div className="sku-top-reason">Top return reason: {b.topReason}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Return Reasons */}
        {activeTab === 'reasons' && (
          <div className="tab-content">
            <div className="reasons-list">
              {reasons.map(r => (
                <div key={r.reason} className="reason-card">
                  <div className="reason-card-top">
                    <div>
                      <div className="reason-title">{r.reason}</div>
                      <div className="reason-count-label">{r.count} occurrences</div>
                    </div>
                    <span className="priority-badge" style={{ color: PRIORITY_COLOR[r.priority], background: `${PRIORITY_COLOR[r.priority]}18`, borderColor: `${PRIORITY_COLOR[r.priority]}40` }}>
                      {r.priority}
                    </span>
                  </div>
                  <div className="reason-detail-row">
                    <div className="reason-detail-item">
                      <span className="rdl">Owner</span>
                      <span className="rdv">{r.owner}</span>
                    </div>
                    {r.topBrand && (
                      <div className="reason-detail-item">
                        <span className="rdl">Worst brand</span>
                        <span className="rdv">{r.topBrand}</span>
                      </div>
                    )}
                    {r.topSku && (
                      <div className="reason-detail-item">
                        <span className="rdl">Worst SKU</span>
                        <span className="rdv">{r.topSku}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer insight */}
        <div className="dash-footer-note">
          <strong>The point of this dashboard:</strong> Every return at ZILO is currently a cost.
          This turns each one into a decision. Pull bad SKUs. Fix photography. Flag brand partners.
          Boost what converts. The data already exists — this just makes it act.
        </div>

      </>}
    </div>
  );
}

export default Dashboard;