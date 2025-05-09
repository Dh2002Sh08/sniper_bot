"use client";

import { useState, useEffect } from "react";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import RestoreWallet from "./restoreWallet";
import BotStatus from "./check";
import Cookies from "js-cookie";
import { setSecretKey } from "@/utils/secret";

interface Wallet {
  secretKey: number[];
  publicKey: string;
}

export default function WalletManager() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isBotActive, setIsBotActive] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const cookieKey = Cookies.get("sniper_key");

    if (cookieKey) {
      try {
        const parsed = JSON.parse(cookieKey);
        if (Array.isArray(parsed)) {
          const pub = Keypair.fromSecretKey(Uint8Array.from(parsed)).publicKey.toBase58();
          const recWallet = { secretKey: parsed, publicKey: pub };
          setWallet(recWallet);
          setSecretKey(parsed);
        }
      } catch {
        console.warn("Invalid cookie data");
      }
    } else {
      setNotification("Wallet not found. Please create or restore.");
    }
  }, []);

  useEffect(() => {
    if (wallet) {
      const fetchBalance = async () => {
        try {
          const conn = new Connection("https://api.devnet.solana.com", "confirmed");
          const bal = await conn.getBalance(new PublicKey(wallet.publicKey));
          setBalance(bal / 1e9);
        } catch {
          setBalance(null);
        }
      };
      fetchBalance();
    }
  }, [wallet]);

  const createWallet = () => {
    setIsCreating(true);
    const keypair = Keypair.generate();
    const sec = Array.from(keypair.secretKey);
    const pub = keypair.publicKey.toBase58();
    const newWallet = { secretKey: sec, publicKey: pub };

    setWallet(newWallet);
    setSecretKey(sec);
    Cookies.set("sniper_key", JSON.stringify(sec), { expires: 7 });
    setNotification("Wallet created successfully.");
    setIsCreating(false);
  };

  const clearWallet = () => {
    setWallet(null);
    setSecretKey([]);
    Cookies.remove("sniper_key");
    setNotification("Wallet deleted. Please create or restore.");
  };

  const handleRestoreComplete = (restored: Wallet) => {
    setWallet(restored);
    setSecretKey(restored.secretKey);
    Cookies.set("sniper_key", JSON.stringify(restored.secretKey), { expires: 7 });
    setIsModalOpen(false);
    setNotification("Wallet restored successfully.");
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-lg space-y-6 border border-gray-200">
      {/* Notification */}
      {notification && (
        <div className="p-3 bg-yellow-100 text-yellow-800 rounded-md shadow-md text-sm flex justify-between items-center">
          <span>{notification}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-4 text-xs font-bold text-yellow-600 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Terms & Conditions */}
      {!agreeTerms ? (
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Terms & Conditions</h2>
          <p className="text-gray-700 text-sm">
            This sniper bot is experimental. By proceeding, you agree to store a secret key in your browser cookies.
            If cookies are cleared, the wallet will be lost.
          </p>
          <label className="inline-flex items-center mt-4">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-green-600"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            <span className="ml-2 text-sm text-gray-700">I accept the terms & cookie usage.</span>
          </label>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Wallet Controls</h2>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={createWallet}
              disabled={isCreating}
              className="px-5 py-2 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create Wallet"}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700"
            >
              Restore Wallet
            </button>
          </div>

          {wallet && (
            <>
              <div className="p-4 border rounded bg-gray-50 space-y-2">
                <div className="text-sm text-gray-700 font-mono">
                  Public Key: {wallet.publicKey}
                </div>
                <div className="text-sm text-green-600 font-medium">
                  Balance: {balance !== null ? `${balance} SOL` : "Loading..."}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="py-2 px-4 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    onClick={() => {
                      navigator.clipboard.writeText(wallet.publicKey);
                      setNotification("Public key copied!");
                    }}
                  >
                    Copy Address
                  </button>
                  <button
                    className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(wallet.secretKey)], {
                        type: "application/json",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "sniper-secret-key.json";
                      a.click();
                      URL.revokeObjectURL(url);
                      setNotification("Secret key downloaded.");
                    }}
                  >
                    Download Key
                  </button>
                  <button
                    className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={clearWallet}
                  >
                    Delete Wallet
                  </button>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <p className="text-sm text-gray-600 italic">
                  Note: By activating the bot, you agree to all terms and conditions.
                </p>
                <button
                  onClick={() => setIsBotActive(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Activate Bot
                </button>
              </div>

              {isBotActive && <BotStatus />}
            </>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl">
            <RestoreWallet onRestoreComplete={handleRestoreComplete} />
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 text-sm text-red-500 hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
