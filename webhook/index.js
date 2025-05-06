const express = require('express');
const axios = require('axios'); // ✅ NEW

const app = express();
const port = 8080;
const tokenLogs = [];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/webhook', async (req, res) => {
  try {
    console.log('✅ Webhook received');
    const data = Array.isArray(req.body) ? req.body[0] : req.body;

    if (!data) {
      console.log('⚠️ No data in request body');
      return res.status(400).send('No data received');
    }

    const signature = data.signature || 'unknown';
    const tokenTransfers = data.tokenTransfers || [];

    if (tokenTransfers.length < 2) {
      console.log(`⚠️ Insufficient tokenTransfers: ${tokenTransfers.length}`);
      return res.status(200).send('OK');
    }

    let tokenData1 = tokenTransfers[0];
    let tokenData2 = tokenTransfers[1];

    if (tokenData1.mint === 'So11111111111111111111111111111111111111112') {
      [tokenData1, tokenData2] = [tokenData2, tokenData1];
    }

    if (tokenLogs.includes(signature)) {
      console.log('⚠️ Duplicate signature, skipping:', signature);
      return res.status(200).send('Already processed');
    }

    tokenLogs.push(signature);
    if (tokenLogs.length > 1000) tokenLogs.shift();

    const logEntry = {
      signature,
      mint: tokenData1?.mint || 'unknown',
      solInvested: tokenData2?.tokenAmount ?? tokenData2?.amount ?? 'unknown',
      dexLink: `https://dexscreener.com/solana/${tokenData1?.mint}`,
      solscanLink: `https://solscan.io/tx/${signature}`,
      timestamp: new Date().toISOString()
    };

    // ✅ Forward log entry to Next.js API
    try {
      await axios.post('http://localhost:3000/api/logs', logEntry);
      console.log('✅ Forwarded to frontend API');
    } catch (err) {
      console.error('❌ Error forwarding to frontend:', err.message);
    }

    // Also log locally
    console.log('🔄 Signature:', logEntry.solscanLink);
    console.log('🪙 Mint:', logEntry.mint);
    console.log('💰 Sol invested:', logEntry.solInvested);
    console.log('📊 Dexscreener:', logEntry.dexLink);
    console.log('------------------------------------------------------');

    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ Webhook error:', err.stack);
    res.status(500).send('Server error');
  }
});

app.listen(port, () => {
  console.log(`🚀 Webhook server running on http://localhost:${port}`);
});
