// import type { NextApiRequest, NextApiResponse } from 'next';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     const apiKey = process.env.NEXT_MORALIS_KEY;

//     if (!apiKey) {
//         return res.status(500).json({ error: "API key is missing" });
//     }

//     try {
//         const response = await fetch(
//             'https://solana-gateway.moralis.io/token/mainnet/pairs/72Fxbe17djHuwZ5AtcihK58FERSULoLWiC5sh2Hjhma8/snipers?blocksAfterCreation=1000',
//             {
//                 method: 'GET',
//                 headers: {
//                     accept: 'application/json',
//                     'X-API-Key': apiKey,
//                 },
//             }
//         );

//         const data = await response.json();
//         res.status(200).json(data);
//     } catch (err: any) {
//         console.error("API Error:", err);
//         res.status(500).json({ error: "Failed to fetch data" });
//     }
// }
