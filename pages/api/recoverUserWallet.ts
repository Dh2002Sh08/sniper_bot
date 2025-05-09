// pages/api/recoverUserWallet.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Keypair } from '@solana/web3.js';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { secretKey } = req.body;

    if (!secretKey || !Array.isArray(secretKey) || secretKey.length !== 64) {
      console.error('❌ Invalid secret key:', secretKey);
      return res.status(400).json({ error: 'Invalid secret key format' });
    }

    const keypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));
    const publicKey = keypair.publicKey.toBase58();

    return res.status(200).json({ publicKey });
  } catch (err) {
    console.error('❌ Wallet recovery failed:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
