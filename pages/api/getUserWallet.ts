import { NextApiRequest, NextApiResponse } from "next";
import * as fs from "fs";
import * as path from "path";
import bs58 from "bs58";
import { Keypair } from "@solana/web3.js";

// Folder where wallets are stored
const walletDir = path.resolve("./wallets");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.query.userId as string;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  const userWalletPath = path.join(walletDir, `${userId}.json`);

  if (!fs.existsSync(userWalletPath)) {
    return res.status(404).json({ error: "Wallet not found for user." });
  }

  try {
    const secret = JSON.parse(fs.readFileSync(userWalletPath, "utf8"));
    const keypair = Keypair.fromSecretKey(new Uint8Array(secret));

    return res.status(200).json({
      publicKey: keypair.publicKey.toBase58(),
      secretKey: bs58.encode(keypair.secretKey),
    });
  } catch (error) {
    console.error("Failed to read wallet:", error);
    return res.status(500).json({ error: "Failed to load wallet." });
  }
}
