// pages/api/start-bot.ts
import { startRaydiumListener, getTokenList } from "../../webhook/listener";
import { startBot } from "../../utils/bot";
import { NextApiRequest, NextApiResponse } from "next";

let started = false;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!started) {
    try {
      console.log("🟢 Starting Raydium listener and bot loop...");
      startRaydiumListener();

      const result = await startBot(); // should return bought tokens (array)
      started = true;

      return res.status(200).json({ status: "Bot running", bought: result });
    } catch (err) {
      console.error("❌ Error starting bot:", err);
      return res.status(500).json({ status: "Error starting bot", error: err });
    }
  } else {
    console.log("⚠️ Bot already running, ignoring duplicate start.");
    const tokens = getTokenList();
    return res.status(200).json({ status: "Bot already running", tokenCount: tokens.length });
  }
}
