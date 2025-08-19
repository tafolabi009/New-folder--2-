const express = require('express');
const { insertResult, listResults } = require('../db');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Body must be a JSON object' });
    }
    const saved = await insertResult(payload);
    return res.status(201).json(saved);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save result', detail: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const rows = await listResults(limit, offset);
    return res.json({ results: rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to list results', detail: err.message });
  }
});

module.exports = router;


