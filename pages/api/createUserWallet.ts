import { NextApiRequest, NextApiResponse } from "next";
import * as fs from "fs";
import * as path from "path";
import bs58 from "bs58";
import { Keypair } from "@solana/web3.js";

// Save wallets under this folder
const walletDir = path.resolve("./wallets");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.query.userId as string;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  // Ensure wallet folder exists
  if (!fs.existsSync(walletDir)) {
    fs.mkdirSync(walletDir);
  }

  const userWalletPath = path.join(walletDir, `${userId}.json`);

  // If wallet already exists, don't overwrite
  if (fs.existsSync(userWalletPath)) {
    const secret = JSON.parse(fs.readFileSync(userWalletPath, "utf8"));
    const kp = Keypair.fromSecretKey(new Uint8Array(secret));
    return res.status(200).json({
      publicKey: kp.publicKey.toBase58(),
      secretKey: bs58.encode(kp.secretKey),
    });
  }

  // Create and save new wallet
  const keypair = Keypair.generate();
  fs.writeFileSync(userWalletPath, JSON.stringify(Array.from(keypair.secretKey)));

  return res.status(200).json({
    publicKey: keypair.publicKey.toBase58(),
    secretKey: bs58.encode(keypair.secretKey),
  });
}
