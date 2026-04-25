const express = require('express');
const router = express.Router();
const TrialSession = require('../models/TrialSession');

// POST /api/trial/submit
router.post('/submit', async (req, res) => {
  try {
    const { orderId, customerName, decisions, trialStartedAt } = req.body;
    const keepCount = decisions.filter(d => d.decision === 'keep').length;
    const returnCount = decisions.filter(d => d.decision === 'return').length;
    const keepRate = parseFloat((keepCount / decisions.length).toFixed(2));
    const session = new TrialSession({
      orderId, customerName,
      trialStartedAt: trialStartedAt || new Date(),
      trialCompletedAt: new Date(),
      decisions, keepCount, returnCount, keepRate,
      totalItems: decisions.length
    });
    await session.save();
    res.status(201).json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/trial/sessions
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await TrialSession.find().sort({ createdAt: -1 });
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/trial/intelligence — the decision engine
router.get('/intelligence', async (req, res) => {
  try {
    const sessions = await TrialSession.find();
    if (sessions.length === 0) return res.json({ success: true, data: null });

    // SKU-level
    const skuMap = {};
    sessions.forEach(s => {
      s.decisions.forEach(d => {
        if (!skuMap[d.name]) skuMap[d.name] = { name: d.name, brand: d.brand, category: d.category || 'Unknown', kept: 0, returned: 0, reasons: {} };
        if (d.decision === 'keep') { skuMap[d.name].kept += 1; }
        else { skuMap[d.name].returned += 1; if (d.returnReason) skuMap[d.name].reasons[d.returnReason] = (skuMap[d.name].reasons[d.returnReason] || 0) + 1; }
      });
    });
    const skus = Object.values(skuMap).map(sku => {
      const total = sku.kept + sku.returned;
      const keepRate = parseFloat((sku.kept / total).toFixed(2));
      const topReason = Object.entries(sku.reasons).sort(([,a],[,b]) => b-a)[0]?.[0] || null;
      let flag = null, action = null;
      if (total >= 5) {
        if (keepRate < 0.35) { flag = 'PULL'; action = topReason === "Didn't fit right" ? 'Fix size guide or remove — consistent fit complaints' : topReason === 'Colour looked different' ? 'Reshoot product photography — colour mismatch' : topReason === 'Quality concern' ? 'Escalate to brand partner — quality flag' : 'Deprioritise in curation — low conversion'; }
        else if (keepRate < 0.55) { flag = 'WATCH'; action = topReason ? `Monitor — "${topReason}" is emerging pattern` : 'Watch for 5 more trials before deciding'; }
        else if (keepRate >= 0.75) { flag = 'BOOST'; action = 'High converter — increase inventory and curation visibility'; }
      }
      return { ...sku, total, keepRate, topReason, flag, action };
    }).sort((a, b) => b.returned - a.returned);

    // Brand-level
    const brandMap = {};
    sessions.forEach(s => {
      s.decisions.forEach(d => {
        if (!brandMap[d.brand]) brandMap[d.brand] = { brand: d.brand, kept: 0, returned: 0, reasons: {} };
        if (d.decision === 'keep') { brandMap[d.brand].kept += 1; }
        else { brandMap[d.brand].returned += 1; if (d.returnReason) brandMap[d.brand].reasons[d.returnReason] = (brandMap[d.brand].reasons[d.returnReason] || 0) + 1; }
      });
    });
    const brands = Object.values(brandMap).map(b => {
      const total = b.kept + b.returned;
      const keepRate = parseFloat((b.kept / total).toFixed(2));
      const topReason = Object.entries(b.reasons).sort(([,a],[,b]) => b-a)[0]?.[0] || null;
      let flag = null, action = null;
      if (total >= 10) {
        if (keepRate < 0.4) { flag = 'REVIEW'; action = `Review brand partnership — ${Math.round((1-keepRate)*100)}% return rate above threshold`; }
        else if (keepRate >= 0.7) { flag = 'EXPAND'; action = 'Strong brand — negotiate deeper catalogue and priority slots'; }
      }
      return { ...b, total, keepRate, topReason, flag, action };
    }).sort((a, b) => b.total - a.total);

    // Reason-level
    const reasonMap = {};
    sessions.forEach(s => {
      s.decisions.forEach(d => {
        if (d.decision === 'return' && d.returnReason) {
          if (!reasonMap[d.returnReason]) reasonMap[d.returnReason] = { count: 0, brands: {}, skus: {} };
          reasonMap[d.returnReason].count += 1;
          if (d.brand) reasonMap[d.returnReason].brands[d.brand] = (reasonMap[d.returnReason].brands[d.brand] || 0) + 1;
          if (d.name) reasonMap[d.returnReason].skus[d.name] = (reasonMap[d.returnReason].skus[d.name] || 0) + 1;
        }
      });
    });
    const reasonOwner = { "Didn't fit right": { owner: 'Curation + Sizing', priority: 'HIGH' }, "Not my style": { owner: 'Personalisation', priority: 'HIGH' }, "Colour looked different": { owner: 'Photography / Tech', priority: 'MEDIUM' }, "Quality concern": { owner: 'Brand Partnerships', priority: 'HIGH' }, "Changed my mind": { owner: 'No action needed', priority: 'LOW' } };
    const reasons = Object.entries(reasonMap).map(([reason, data]) => ({
      reason, count: data.count,
      topBrand: Object.entries(data.brands).sort(([,a],[,b]) => b-a)[0]?.[0] || null,
      topSku: Object.entries(data.skus).sort(([,a],[,b]) => b-a)[0]?.[0] || null,
      owner: reasonOwner[reason]?.owner || 'Review',
      priority: reasonOwner[reason]?.priority || 'MEDIUM'
    })).sort((a, b) => b.count - a.count);

    // Overview
    const totalSessions = sessions.length;
    const avgKeepRate = parseFloat((sessions.reduce((s, sess) => s + sess.keepRate, 0) / totalSessions).toFixed(2));
    const totalItems = sessions.reduce((s, sess) => s + sess.totalItems, 0);
    const totalKept = sessions.reduce((s, sess) => s + sess.keepCount, 0);

    res.json({
      success: true,
      data: {
        overview: { totalSessions, avgKeepRate, totalItems, totalKept, totalReturned: totalItems - totalKept, pullCount: skus.filter(s => s.flag === 'PULL').length, watchCount: skus.filter(s => s.flag === 'WATCH').length, boostCount: skus.filter(s => s.flag === 'BOOST').length },
        skus, brands, reasons
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;