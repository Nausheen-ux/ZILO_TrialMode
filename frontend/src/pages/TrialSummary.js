import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { MOCK_ORDERS } from '../assets/mockData';
import './TrialSummary.css';

function TrialSummary() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const order = MOCK_ORDERS[orderId];

  const [decisions, setDecisions] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(`decisions_${orderId}`);
    if (saved) setDecisions(JSON.parse(saved));
  }, [orderId]);

  const keptItems = order.items.filter(i => decisions[i.id]?.decision === 'keep');
  const returnedItems = order.items.filter(i => decisions[i.id]?.decision === 'return');
  const keepTotal = keptItems.reduce((sum, i) => sum + i.price, 0);

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);

    const payload = {
      orderId,
      customerName: order.customerName,
      trialStartedAt: sessionStorage.getItem(`trial_start_${orderId}`),
      decisions: order.items.map(item => ({
        itemId: item.id,
        name: item.name,
        brand: item.brand,
        size: item.size,
        decision: decisions[item.id]?.decision || 'return',
        returnReason: decisions[item.id]?.returnReason || null
      }))
    };

    try {
      await axios.post('/api/trial/submit', payload);
      setSubmitted(true);
      // Clear session
      sessionStorage.removeItem(`decisions_${orderId}`);
      sessionStorage.removeItem(`trial_start_${orderId}`);
    } catch (err) {
      // Even if backend is down, show success for demo purposes
      console.warn('Backend unavailable, showing demo success');
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="ts-success">
        <div className="ts-success-inner fade-up">
          <div className="ts-success-icon">✓</div>
          <div className="zilo-logo-sm" style={{ marginBottom: 8 }}>ZILO</div>
          <h2 className="ts-success-title">Done. Easy.</h2>
          <p className="ts-success-msg">
            Keeping <strong>{keptItems.length} item{keptItems.length !== 1 ? 's' : ''}</strong>.{' '}
            {returnedItems.length > 0 && `${returnedItems.length} going back — no questions.`}
          </p>
          {keptItems.length > 0 && (
            <div className="ts-success-amount">
              ₹{keepTotal.toLocaleString()} charged
            </div>
          )}
          <p className="ts-success-note">
            Our partner will collect the returns right now. Thanks for trying ZILO.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="trial-summary">
      <div className="tsum-header fade-up">
        <div className="zilo-logo-sm">ZILO</div>
        <div className="tsum-step">Final step</div>
      </div>

      <h2 className="tsum-title fade-up" style={{ animationDelay: '0.1s' }}>
        Here's your<br />trial recap.
      </h2>

      {/* Keeping section */}
      {keptItems.length > 0 && (
        <div className="tsum-section fade-up" style={{ animationDelay: '0.15s' }}>
          <div className="tsum-section-label keep-label">
            <span className="tsum-dot keep-dot" />
            Keeping ({keptItems.length})
          </div>
          <div className="tsum-items">
            {keptItems.map(item => (
              <div key={item.id} className="tsum-item">
                <div
                  className="tsum-item-img"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
                <div className="tsum-item-info">
                  <div className="tsum-item-brand">{item.brand}</div>
                  <div className="tsum-item-name">{item.name}</div>
                  <div className="tsum-item-size">{item.size} · {item.color}</div>
                </div>
                <div className="tsum-item-price">₹{item.price.toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div className="tsum-subtotal">
            Total: <strong>₹{keepTotal.toLocaleString()}</strong>
          </div>
        </div>
      )}

      {/* Returning section */}
      {returnedItems.length > 0 && (
        <div className="tsum-section fade-up" style={{ animationDelay: '0.2s' }}>
          <div className="tsum-section-label return-label">
            <span className="tsum-dot return-dot" />
            Returning ({returnedItems.length})
          </div>
          <div className="tsum-items">
            {returnedItems.map(item => (
              <div key={item.id} className="tsum-item return-item">
                <div
                  className="tsum-item-img"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
                <div className="tsum-item-info">
                  <div className="tsum-item-brand">{item.brand}</div>
                  <div className="tsum-item-name">{item.name}</div>
                  <div className="tsum-return-reason">
                    ↩ {decisions[item.id]?.returnReason}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {keptItems.length === 0 && (
        <div className="tsum-nothing fade-up">
          <p>Not feeling anything today? That's okay — no charges, no hassle.</p>
        </div>
      )}

      {error && <div className="tsum-error">{error}</div>}

      <div className="tsum-cta fade-up" style={{ animationDelay: '0.3s' }}>
        <button
          className={`tsum-confirm-btn ${submitting ? 'loading' : ''}`}
          onClick={handleConfirm}
          disabled={submitting}
        >
          {submitting ? 'Confirming...' : 'Confirm & Finish →'}
        </button>
        <p className="tsum-note">
          Our partner will collect returns immediately after you confirm.
        </p>
      </div>
    </div>
  );
}

export default TrialSummary;