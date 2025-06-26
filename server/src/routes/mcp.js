const express = require('express');
const router = express.Router();
const llmService = require('../services/llmService');

router.post('/process', async (req, res) => {
  const { prompt, conversationId } = req.body;
  try {
    const result = await llmService.processPrompt(prompt, conversationId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;