// "use client";
// import React, { useEffect, useState } from 'react';

// function Sniper() {
//   const [data, setData] = useState<any | null>(null);

//   const fetchData = async () => {
//     try {
//       const res = await fetch('/api/sniper'); // Replace with your actual API endpoint
//       const json = await res.json();
//       console.log("Sniper data:", json);
//       setData(json.result?.[0]);
//     } catch (err) {
//       console.error("Failed to fetch sniper data:", err);
//     }
//   };

//   useEffect(() => {
//     fetchData(); // initial fetch

//     const interval = setInterval(() => {
//       fetchData();
//     }, 5000); // refresh every 5 seconds

//     return () => clearInterval(interval); // cleanup on unmount
//   }, []);

//   if (!data) return <div className="p-4">Loading sniper data...</div>;

//   return (
//     <div className="p-6 space-y-4">
//       <h1 className="text-2xl font-bold text-blue-600">🎯 Sniper Dashboard</h1>

//       <div className="bg-white shadow p-4 rounded-lg">
//         <p><strong>Wallet:</strong> {data.walletAddress}</p>
//         <p><strong>Sniped Tokens:</strong> {data.totalTokensSniped}</p>
//         <p><strong>Sniped USD:</strong> ${data.totalSnipedUsd.toFixed(2)}</p>
//         <p><strong>Sold Tokens:</strong> {data.totalTokensSold}</p>
//         <p><strong>Sold USD:</strong> ${data.totalSoldUsd.toFixed(2)}</p>
//         <p><strong>Profit (USD):</strong> ${data.realizedProfitUsd.toFixed(2)}</p>
//         <p><strong>Profit (%):</strong> {data.realizedProfitPercentage.toFixed(2)}%</p>
//         <p><strong>Current Balance:</strong> {data.currentBalance}</p>
//         <p><strong>Balance USD:</strong> ${data.currentBalanceUsdValue.toFixed(4)}</p>
//       </div>

//       <div className="grid grid-cols-2 gap-6">
//         <div>
//           <h2 className="text-xl font-semibold">📥 Sniped Transactions</h2>
//           <ul className="list-disc ml-5 mt-2 space-y-2">
//             {data.snipedTransactions.map((tx: any, idx: number) => (
//               <li key={idx}>
//                 <div><strong>Hash:</strong> <a href={`https://solscan.io/tx/${tx.transactionHash}`} target="_blank" rel="noreferrer" className="text-blue-500 underline">{tx.transactionHash}</a></div>
//                 <div><strong>Time:</strong> {new Date(tx.transactionTimestamp).toLocaleString()}</div>
//                 <div><strong>Blocks After Creation:</strong> {tx.blocksAfterCreation}</div>
//               </li>
//             ))}
//           </ul>
//         </div>

//         <div>
//           <h2 className="text-xl font-semibold">📤 Sell Transactions</h2>
//           <ul className="list-disc ml-5 mt-2 space-y-2">
//             {data.sellTransactions.map((tx: any, idx: number) => (
//               <li key={idx}>
//                 <div><strong>Hash:</strong> <a href={`https://solscan.io/tx/${tx.transactionHash}`} target="_blank" rel="noreferrer" className="text-blue-500 underline">{tx.transactionHash}</a></div>
//                 <div><strong>Time:</strong> {new Date(tx.transactionTimestamp).toLocaleString()}</div>
//                 <div><strong>Blocks After Creation:</strong> {tx.blocksAfterCreation}</div>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Sniper;
