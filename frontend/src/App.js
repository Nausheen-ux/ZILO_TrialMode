import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TrialStart from './pages/TrialStart';
import TrialFlow from './pages/TrialFlow';
import TrialSummary from './pages/TrialSummary';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/trial/:orderId" element={<TrialStart />} />
        <Route path="/trial/:orderId/items" element={<TrialFlow />} />
        <Route path="/trial/:orderId/summary" element={<TrialSummary />} />
      </Routes>
    </Router>
  );
}

export default App;