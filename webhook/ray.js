import { Connection, PublicKey } from '@solana/web3.js';

const RAYDIUM_PUBLIC_KEY = "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8";
const HTTP_URL = "https://frequent-frosty-owl.solana-mainnet.quiknode.pro/151491430ea4ee8c133a898d37eacae827489983/";
const WSS_URL = "wss://frequent-frosty-owl.solana-mainnet.quiknode.pro/151491430ea4ee8c133a898d37eacae827489983/";
const RAYDIUM = new PublicKey(RAYDIUM_PUBLIC_KEY);
const INSTRUCTION_NAME = "initialize2";

const connection = new Connection(HTTP_URL, {
    wsEndpoint: WSS_URL
});

async function startConnection(connection, programAddress, searchInstruction) {
    console.log("Monitoring logs for program:", programAddress.toString());
    connection.onLogs(
        programAddress,
        ({ logs, err, signature }) => {
            if (err) return;

            if (logs && logs.some((log) => log.includes(searchInstruction))) {
                console.log("Signature for 'initialize2':", `https://explorer.solana.com/tx/${signature}`);
                fetchRaydiumMints(signature, connection);
            }
        },
        "finalized"
    );
}

async function fetchRaydiumMints(txId, connection) {
    try {
        const tx = await connection.getParsedTransaction(txId, {
            maxSupportedTransactionVersion: 0,
            commitment: 'confirmed'
        });

        if (!tx) {
            console.log("Transaction not found:", txId);
            return;
        }

        const instruction = tx.transaction.message.instructions.find(ix =>
            ix.programId.toBase58() === RAYDIUM_PUBLIC_KEY
        );

        if (!instruction || !('accounts' in instruction)) {
            console.log("No matching instruction or accounts found.");
            return;
        }

        //@ts-ignore
        const accounts = instruction.accounts;

        // Print all associated accounts in this instruction
        const accountList = accounts.map((acc, index) => ({
            Index: index,
            'Account Public Key': acc.toBase58()
        }));

        console.log("New LP Found - All Accounts:");
        console.table(accountList);

        // If you want to extract mint addresses, you might need extra logic here
        // e.g., fetching account info and checking if it's a Mint account

    } catch (err) {
        console.error("Error fetching transaction:", txId, err);
    }
}


startConnection(connection, RAYDIUM, INSTRUCTION_NAME).catch(console.error);