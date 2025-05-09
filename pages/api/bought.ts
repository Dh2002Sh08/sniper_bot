// pages/api/bought.ts
import { boughtTokens } from "../../shared/store";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(200).json({ SnipedTokens: boughtTokens });
}
