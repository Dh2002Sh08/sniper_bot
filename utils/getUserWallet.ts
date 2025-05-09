// getUserWallet.ts
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import fs from "fs";
import path from "path";

export function getUserWallet(userId: string): Keypair | null {
  const file = path.resolve("wallets", `${userId}.json`);
  if (!fs.existsSync(file)) return null;

  const data = JSON.parse(fs.readFileSync(file, "utf-8"));
  return Keypair.fromSecretKey(bs58.decode(data.secretKey));
}
