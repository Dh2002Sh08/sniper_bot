// "use client";
// import React, { useState } from "react";
// import { buyToken } from "../utils/buyToken"; // Assuming buyToken is in utils folder

// const TestBuyToken = () => {
//   const [secretKey, setSecretKey] = useState("");
//   const [tokenMint, setTokenMint] = useState("");
//   const [amountInSol, setAmountInSol] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState<any>(null);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const response = await buyToken({
//         userSecret: new TextEncoder().encode(secretKey), // Convert secretKey to Uint8Array
//         tokenMint,
//         amountInSol,
//       });
//       setResult(response);
//     } catch (error) {
//       setResult({ success: false, message: ( error as Error).message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
//       <h1 className="text-2xl font-bold text-center mb-6">Test Token Purchase</h1>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block text-sm font-semibold">Secret Key (Array format)</label>
//           <textarea
//             rows={4}
//             className="w-full border p-2 rounded"
//             placeholder="Enter your secret key as a comma-separated array of numbers (mocked for testing)"
//             value={secretKey}
//             onChange={(e) => setSecretKey(e.target.value)}
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-semibold">Token Mint Address</label>
//           <input
//             type="text"
//             className="w-full border p-2 rounded"
//             placeholder="Enter the token mint address"
//             value={tokenMint}
//             onChange={(e) => setTokenMint(e.target.value)}
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-semibold">Amount in SOL</label>
//           <input
//             type="number"
//             step="any"
//             className="w-full border p-2 rounded"
//             placeholder="Amount of SOL you want to spend"
//             value={amountInSol}
//             onChange={(e) => setAmountInSol(parseFloat(e.target.value))}
//             required
//           />
//         </div>
//         <div className="flex justify-center">
//           <button
//             type="submit"
//             className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
//             disabled={loading}
//           >
//             {loading ? "Processing..." : "Buy Token"}
//           </button>
//         </div>
//       </form>

//       {result && (
//         <div className="mt-6 p-4 border-t">
//           {result.success ? (
//             <div className="text-green-500">
//               <h2 className="font-semibold">Purchase Successful</h2>
//               <p>ATA Address: {result.ata}</p>
//               <p>{result.message}</p>
//             </div>
//           ) : (
//             <div className="text-red-500">
//               <h2 className="font-semibold">Error</h2>
//               <p>{result.message}</p>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default TestBuyToken;
