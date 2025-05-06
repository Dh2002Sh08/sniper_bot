let logs = []; // In-memory storage

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { signature, mint, solInvested, dexLink, solscanLink, timestamp } = req.body;

    // ✅ Basic validation
    if (!signature || !mint) {
      return res.status(400).json({ error: 'Invalid log data' });
    }

    // ✅ Avoid duplicates
    if (logs.find(log => log.signature === signature)) {
      return res.status(200).json({ message: 'Already exists' });
    }

    // ✅ Store
    logs.unshift({ signature, mint, solInvested, dexLink, solscanLink, timestamp });
    if (logs.length > 1000) logs.pop();

    return res.status(200).json({ message: 'Log stored' });
  }

  if (req.method === 'GET') {
    return res.status(200).json(logs);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
