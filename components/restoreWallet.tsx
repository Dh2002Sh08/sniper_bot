"use client";

import { useState } from "react";
import axios from "axios";

interface Wallet {
  secretKey: number[];
  publicKey: string;
}

export default function RestoreWallet({ onRestoreComplete }: { onRestoreComplete: (wallet: Wallet) => void }) {
  const [error, setError] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const secretKey = JSON.parse(text);

      // console.log("Parsed secretKey:", secretKey);
      console.log("Length:", secretKey.length); // should be 64

      const res = await axios.post("/api/recoverUserWallet", { secretKey });
      const publicKey = res.data.publicKey;

      const wallet = { secretKey, publicKey };
      localStorage.setItem("sniper_wallet", JSON.stringify(wallet));
      onRestoreComplete(wallet);
    } catch (err) {
      console.error("Recovery failed", err);
      setError("❌ Failed to restore wallet. Make sure the file is valid.");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">🔐 Restore Your Wallet</h2>
      <input
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        className="mb-4"
      />
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
