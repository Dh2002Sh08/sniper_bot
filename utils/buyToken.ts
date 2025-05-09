import {
  Connection,
  Keypair,
  Transaction,
  VersionedTransaction,
  PublicKey,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
  NATIVE_MINT,
} from '@solana/spl-token';
import axios from 'axios';
import { API_URLS } from '@raydium-io/raydium-sdk-v2';
import fs from 'fs';
import path from 'path';
import bs58 from 'bs58';
import { getSecretKey } from './secret';

const RPC_URL = 'https://api.devnet.solana.com'; // Devnet RPC
const connection = new Connection(RPC_URL, 'confirmed');

export async function buyToken(outputMint: string) {
  const amount = 10000000; // Amount in lamports (0.01 SOL, adjust as needed)
  const inputMint = NATIVE_MINT.toBase58(); // SOL mint
  const slippage = 1; // 1% slippage
  const txVersion = 'V0';
  const isInputSol = true;
  const isOutputSol = false;
  const isV0Tx = true;

  try {
    // Load wallet from file
    // const walletFilePath = path.resolve(process.cwd(), '../wallet.json');
    // if (!fs.existsSync(walletFilePath)) {
    //   throw new Error(`❌ Wallet file not found at ${walletFilePath}. Please create a valid wallet.json file.`);
    // }

    // let selected;
    // try {
    //   selected = JSON.parse(fs.readFileSync(walletFilePath, 'utf-8'));
    // } catch (err) {
    //   throw new Error(`❌ Failed to parse wallet.json: ${(err as Error).message}`);
    // }

    let secretKey = getSecretKey();

    if(!secretKey) {
      // console.error("❌ secretKey is not set or invalid. Please create or restore a wallet first.");
      throw new Error(`❌ Failed to retrieve secretKey from getKey from frontend`);
    }

    console.log(`🧾 Loaded wallet with public key: ${secretKey}`);
    // // Handle different wallet.json formats
    // if (Array.isArray(selected)) {
    //   console.log(`🧾 wallet.json contains a direct array of length ${selected.length}`);
    //   if (selected.length !== 64) {
    //     throw new Error(
    //       `❌ Invalid wallet.json: secretKey array must contain exactly 64 numbers. Found ${selected.length} elements.`
    //     );
    //   }
    //   if (!selected.every((num: any) => typeof num === 'number' && num >= 0 && num <= 255)) {
    //     throw new Error(`❌ Invalid wallet.json: secretKey array contains invalid values (must be numbers 0-255).`);
    //   }
    //   secretKey = Uint8Array.from(selected);
    // } else if (selected?.secretKey) {
    //   if (Array.isArray(selected.secretKey)) {
    //     console.log(`🧾 wallet.json contains an object with secretKey array of length ${selected.secretKey.length}`);
    //     if (selected.secretKey.length !== 64) {
    //       throw new Error(
    //         `❌ Invalid wallet.json: secretKey array must contain exactly 64 numbers. Found ${selected.secretKey.length} elements.`
    //       );
    //     }
    //     if (!selected.secretKey.every((num: any) => typeof num === 'number' && num >= 0 && num <= 255)) {
    //       throw new Error(`❌ Invalid wallet.json: secretKey array contains invalid values (must be numbers 0-255).`);
    //     }
    //     secretKey = Uint8Array.from(selected.secretKey);
    //   } else if (typeof selected.secretKey === 'string') {
    //     console.log(`🧾 wallet.json contains a base58-encoded secretKey: ${selected.secretKey.substring(0, 10)}...`);
    //     try {
    //       secretKey = bs58.decode(selected.secretKey);
    //       if (secretKey.length !== 64) {
    //         throw new Error(
    //           `❌ Invalid wallet.json: base58-encoded secretKey decoded to ${secretKey.length} bytes (expected 64).`
    //         );
    //       }
    //     } catch (err) {
    //       throw new Error(`❌ Failed to decode base58 secretKey: ${(err as Error).message}`);
    //     }
    //   } else {
    //     throw new Error(
    //       `❌ Invalid wallet.json: secretKey must be an array of 64 numbers or a base58-encoded string. Found type ${typeof selected.secretKey}.`
    //     );
    //   }
    // } else {
    //   throw new Error(`❌ Invalid wallet.json: Must contain a secretKey field or be an array of 64 numbers.`);
    // }

    let owner;
    try {
      owner = Keypair.fromSecretKey(secretKey);
      console.log(`🧾 Loaded wallet with public key: ${owner.publicKey.toBase58()}`);
    } catch (err) {
      throw new Error(`❌ Invalid secretKey in wallet.json: ${(err as Error).message}`);
    }

    // Resolve ATA accounts
    const inputMintPk = new PublicKey(inputMint);
    const outputMintPk = new PublicKey(outputMint);

    const inputTokenAcc = isInputSol
      ? null
      : await getAssociatedTokenAddress(inputMintPk, owner.publicKey);
    const outputTokenAcc = isOutputSol
      ? null
      : await getAssociatedTokenAddress(outputMintPk, owner.publicKey);

    // Ensure ATAs exist
    const ataInstructions = [];

    if (!isOutputSol && outputTokenAcc) {
      try {
        await getAccount(connection, outputTokenAcc);
      } catch {
        ataInstructions.push(
          createAssociatedTokenAccountInstruction(
            owner.publicKey,
            outputTokenAcc,
            owner.publicKey,
            outputMintPk,
            TOKEN_PROGRAM_ID
          )
        );
      }
    }

    if (!isInputSol && inputTokenAcc) {
      try {
        await getAccount(connection, inputTokenAcc);
      } catch {
        ataInstructions.push(
          createAssociatedTokenAccountInstruction(
            owner.publicKey,
            inputTokenAcc,
            owner.publicKey,
            inputMintPk,
            TOKEN_PROGRAM_ID
          )
        );
      }
    }

    // Send ATA creation tx first if needed
if (ataInstructions.length > 0) {
  const ataTx = new Transaction().add(...ataInstructions);
  ataTx.feePayer = owner.publicKey;
  const { blockhash } = await connection.getLatestBlockhash();
  ataTx.recentBlockhash = blockhash;
  ataTx.sign(owner);
  const ataSig = await connection.sendRawTransaction(ataTx.serialize(), { skipPreflight: true });
  console.log(`🪙 Created missing ATA(s): ${ataSig}`);

  // Retry confirmation up to 3 times with 60s timeout
  let confirmed = false;
  let attempts = 0;
  const maxAttempts = 3;
  const timeoutSeconds = 60;

  while (!confirmed && attempts < maxAttempts) {
    attempts++;
    try {
      await connection.confirmTransaction(
        {
          signature: ataSig,
          blockhash,
          lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight,
        },
        'confirmed',
        // { commitment: 'confirmed', preflightCommitment: 'confirmed' }
      );
      confirmed = true;
      console.log(`🪙 ATA transaction confirmed after ${attempts} attempt(s)`);
    } catch (err) {
      console.error(`🧾 Attempt ${attempts} failed:`, (err as Error).message);
      if (attempts === maxAttempts) {
        throw new Error(
          `❌ Failed to confirm ATA transaction after ${maxAttempts} attempts: ${(err as Error).message}. Check signature ${ataSig} on Solana Explorer.`
        );
      }
    }
  }
}

    // Get priority fee
    const { data: priorityFeeData } = await axios.get<{
      id: string;
      success: boolean;
      data: { default: { vh: number; h: number; m: number } };
    }>(`${API_URLS.BASE_HOST}${API_URLS.PRIORITY_FEE}`);

    if (!priorityFeeData?.data?.default?.h) {
      throw new Error('❌ Failed to fetch priority fee');
    }

    // Get swap quote
let swapResponse;
try {
  const { data } = await axios.get<any>(
    `${API_URLS.SWAP_HOST}/compute/swap-base-in?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${
      slippage * 100
    }&txVersion=${txVersion}`
  );
  swapResponse = data;
  console.log(`🧾 swapResponse:`, JSON.stringify(swapResponse, null, 2));
} catch (err) {
  if (err instanceof Error) {
    console.error('🧾 Swap quote error details:',err.message);
    throw new Error(`❌ Failed to fetch swap quote: ${err.message}`);
  } else {
    console.error('🧾 Swap quote error details:', err);
    throw new Error(`❌ Failed to fetch swap quote: ${err}`);
  }
}

if (!swapResponse || !swapResponse.success) {
  console.error(`🧾 swapResponse:`, JSON.stringify(swapResponse, null, 2));
  throw new Error(`❌ Swap quote request failed: ${swapResponse?.msg || 'Unknown error'}`);
}

// Build swap transaction
let swapTxData;
try {
  const response = await axios.post<{
    id: string;
    version: string;
    success: boolean;
    msg?: string;
    data: { transaction: string }[];
  }>(`${API_URLS.SWAP_HOST}/transaction/swap-base-in`, {
    computeUnitPriceMicroLamports: String(priorityFeeData.data.default.h),
    swapResponse,
    txVersion,
    wallet: owner.publicKey.toBase58(),
    wrapSol: isInputSol,
    unwrapSol: isOutputSol,
    inputAccount: isInputSol ? undefined : inputTokenAcc?.toBase58(),
    outputAccount: isOutputSol ? undefined : outputTokenAcc?.toBase58(),
  });
  swapTxData = response.data;
} catch (err) {
  if (err instanceof Error) {
    console.error('🧾 Swap transaction error details:',err.message);
    throw new Error(`❌ Failed to fetch swap transactions: ${err.message}`);
  } else {
    console.error('🧾 Swap transaction error details:', err);
    throw new Error(`❌ Failed to fetch swap transactions: ${err}`);
  }
}

// Validate swapTxData
if (!swapTxData.success) {
  console.error('🧾 swapTxData:', JSON.stringify(swapTxData, null, 2));
  throw new Error(`❌ Swap transaction request failed: ${swapTxData.msg || 'Unknown error'}`);
}

if (!swapTxData.data || !Array.isArray(swapTxData.data)) {
  console.error('🧾 swapTxData:', JSON.stringify(swapTxData, null, 2));
  throw new Error('❌ Swap transaction data is invalid, undefined, or not an array');
}

    const transactions = swapTxData.data.map((tx: any) => {
      if (!tx?.transaction) {
        throw new Error('❌ Transaction data is missing in swapTxData');
      }
      const buf = Buffer.from(tx.transaction, 'base64');
      return isV0Tx ? VersionedTransaction.deserialize(buf) : Transaction.from(buf);
    });

    console.log(`📦 Prepared ${transactions.length} transactions`);

    // Sign & send swap transactions
    let index = 0;
    for (const tx of transactions) {
      index++;
      if (!isV0Tx) {
        const transaction = tx as Transaction;
        transaction.sign(owner);
        const txid = await sendAndConfirmTransaction(connection, transaction, [owner], {
          skipPreflight: true,
          commitment: 'confirmed',
        });
        console.log(`✅ Tx ${index} confirmed: ${txid}`);
      } else {
        const transaction = tx as VersionedTransaction;
        transaction.sign([owner]);
        const txid = await connection.sendTransaction(transaction, {
          skipPreflight: true,
          maxRetries: 5,
        });
        console.log(`✅ V0 Tx ${index} sent: ${txid}`);
        console.log(`🔍 https://solscan.io/tx/${txid}`);
        const { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash({
          commitment: 'finalized',
        });
        await connection.confirmTransaction(
          {
            blockhash,
            lastValidBlockHeight,
            signature: txid,
          },
          'confirmed'
        );
        console.log(`✅ V0 Tx ${index} confirmed`);
        return txid;
      }
    }

    console.log('🎉 Token purchase completed successfully');
  } catch (err) {
    console.error('❌ Buy error:', err);
    return err;
    // throw err;
  }
}

// buyToken("A8fDCGHFCf2EtHBxbjxWcZFtxDxpwcdV92gvRUCURJqH");
