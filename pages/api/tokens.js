// pages/api/tokens.js
import { getTokenList, startRaydiumListener } from "../../webhook/listener";

startRaydiumListener();

export default function handler(req, res) {
  const tokens = getTokenList();
  res.status(200).json(tokens);
}
