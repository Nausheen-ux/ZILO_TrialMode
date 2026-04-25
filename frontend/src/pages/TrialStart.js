import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MOCK_ORDERS } from '../assets/mockData';
import './TrialStart.css';

function TrialStart() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const order = MOCK_ORDERS[orderId];
  const [starting, setStarting] = useState(false);

  if (!order) {
    return (
      <div className="error-screen">
        <p>Order not found. Check your link.</p>
      </div>
    );
  }

  const handleStart = () => {
    setStarting(true);
    // Save trial start time to sessionStorage
    sessionStorage.setItem(`trial_start_${orderId}`, new Date().toISOString());
    setTimeout(() => navigate(`/trial/${orderId}/items`), 600);
  };

  return (
    <div className="trial-start">
      {/* Header */}
      <div className="ts-header fade-up">
        <div className="zilo-logo">ZILO</div>
        <div className="trial-badge">Trial Mode</div>
      </div>

      {/* Hero */}
      <div className="ts-hero fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="ts-greeting">Hey {order.customerName.split(' ')[0]} 👋</div>
        <h1 className="ts-title">Your trial<br />is here.</h1>
        <p className="ts-subtitle">
          {order.deliveryPartner} is at your door with {order.items.length} styles.<br />
          You have <strong>30 minutes</strong> to try everything.
        </p>
      </div>

      {/* Order card */}
      <div className="ts-order-card fade-up" style={{ animationDelay: '0.2s' }}>
        <div className="ts-order-label">Order #{order.orderId}</div>
        <div className="ts-item-previews">
          {order.items.map((item, i) => (
            <div
              key={item.id}
              className="ts-item-thumb"
              style={{ backgroundImage: `url(${item.image})`, animationDelay: `${0.3 + i * 0.08}s` }}
            />
          ))}
        </div>
        <div className="ts-item-count">{order.items.length} items to try</div>
      </div>

      {/* How it works */}
      <div className="ts-steps fade-up" style={{ animationDelay: '0.35s' }}>
        <div className="ts-step">
          <span className="ts-step-num">01</span>
          <span className="ts-step-text">Try each item at your own pace</span>
        </div>
        <div className="ts-step">
          <span className="ts-step-num">02</span>
          <span className="ts-step-text">Mark keep or return for each one</span>
        </div>
        <div className="ts-step">
          <span className="ts-step-num">03</span>
          <span className="ts-step-text">Confirm — we handle the rest instantly</span>
        </div>
      </div>

      {/* CTA */}
      <div className="ts-cta fade-up" style={{ animationDelay: '0.45s' }}>
        <button
          className={`ts-start-btn ${starting ? 'loading' : ''}`}
          onClick={handleStart}
          disabled={starting}
        >
          {starting ? 'Starting...' : 'Start Trial →'}
        </button>
        <p className="ts-note">Timer begins when you tap start</p>
      </div>
    </div>
  );
}

export default TrialStart;