import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MOCK_ORDERS, RETURN_REASONS } from '../assets/mockData';
import './TrialFlow.css';

function TrialFlow() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const order = MOCK_ORDERS[orderId];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [decisions, setDecisions] = useState({});
  const [showReasons, setShowReasons] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 mins in seconds
  const [animating, setAnimating] = useState(false);

  // Countdown timer
  useEffect(() => {
    const startTime = sessionStorage.getItem(`trial_start_${orderId}`);
    if (startTime) {
      const elapsed = Math.floor((Date.now() - new Date(startTime)) / 1000);
      setTimeLeft(Math.max(0, 30 * 60 - elapsed));
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [orderId]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const timerUrgent = timeLeft < 300; // under 5 mins

  const currentItem = order.items[currentIndex];
  const totalItems = order.items.length;
  const progress = ((currentIndex) / totalItems) * 100;

  const handleKeep = useCallback(() => {
    setDecisions(prev => ({
      ...prev,
      [currentItem.id]: { decision: 'keep', returnReason: null, ...currentItem }
    }));
    setShowReasons(false);
    advance();
  }, [currentItem]);

  const handleReturn = () => {
    setShowReasons(true);
  };

  const handleReason = (reason) => {
    setDecisions(prev => ({
      ...prev,
      [currentItem.id]: { decision: 'return', returnReason: reason, ...currentItem }
    }));
    setShowReasons(false);
    advance();
  };

  const advance = () => {
    setAnimating(true);
    setTimeout(() => {
      if (currentIndex < totalItems - 1) {
        setCurrentIndex(i => i + 1);
      } else {
        // All items decided — go to summary
        goToSummary();
      }
      setAnimating(false);
    }, 350);
  };

  const goToSummary = () => {
    const allDecisions = { ...decisions };
    // include current item if just decided via keep
    sessionStorage.setItem(`decisions_${orderId}`, JSON.stringify(allDecisions));
    navigate(`/trial/${orderId}/summary`);
  };

  const decidedCount = Object.keys(decisions).length;

  return (
    <div className="trial-flow">
      {/* Top bar */}
      <div className="tf-topbar">
        <div className="zilo-logo-sm">ZILO</div>
        <div className={`tf-timer ${timerUrgent ? 'urgent' : ''}`}>
          <span className="timer-dot" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress */}
      <div className="tf-progress-wrap">
        <div className="tf-progress-bar">
          <div className="tf-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="tf-progress-label">
          {decidedCount} of {totalItems} decided
        </div>
      </div>

      {/* Item card */}
      <div className={`tf-item-card ${animating ? 'exit' : 'enter'}`}>
        <div className="tf-item-image-wrap">
          <img src={currentItem.image} alt={currentItem.name} className="tf-item-image" />
          <div className="tf-item-num-badge">{currentIndex + 1}/{totalItems}</div>
        </div>

        <div className="tf-item-info">
          <div className="tf-brand">{currentItem.brand}</div>
          <div className="tf-item-name">{currentItem.name}</div>
          <div className="tf-item-meta">
            <span className="tf-tag">{currentItem.size}</span>
            <span className="tf-tag">{currentItem.color}</span>
            <span className="tf-tag">{currentItem.category}</span>
          </div>
          <div className="tf-price">₹{currentItem.price.toLocaleString()}</div>
        </div>
      </div>

      {/* Decision buttons or reason picker */}
      {!showReasons ? (
        <div className="tf-actions fade-in">
          <p className="tf-action-label">How does it feel?</p>
          <div className="tf-btn-row">
            <button className="tf-btn tf-btn-return" onClick={handleReturn}>
              <span className="tf-btn-icon">↩</span>
              Return
            </button>
            <button className="tf-btn tf-btn-keep" onClick={handleKeep}>
              <span className="tf-btn-icon">✓</span>
              Keep it
            </button>
          </div>
        </div>
      ) : (
        <div className="tf-reasons fade-in">
          <p className="tf-reasons-label">Quick — why are you returning?</p>
          <div className="tf-reasons-grid">
            {RETURN_REASONS.map((reason, i) => (
              <button
                key={reason}
                className="tf-reason-btn"
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => handleReason(reason)}
              >
                {reason}
              </button>
            ))}
          </div>
          <button className="tf-back-btn" onClick={() => setShowReasons(false)}>
            ← Go back
          </button>
        </div>
      )}

      {/* Already decided items strip */}
      {decidedCount > 0 && (
        <div className="tf-decided-strip">
          {order.items.slice(0, currentIndex).map(item => (
            <div
              key={item.id}
              className={`tf-decided-thumb ${decisions[item.id]?.decision}`}
              style={{ backgroundImage: `url(${item.image})` }}
            >
              <span className="tf-decided-icon">
                {decisions[item.id]?.decision === 'keep' ? '✓' : '↩'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TrialFlow;