// import { Connection, PublicKey } from '@solana/web3.js'
// import { getAccount } from '@solana/spl-token'

// const connection = new Connection('https://api.devnet.solana.com')

// async function inspectPool(poolAddressStr: string) {
//   const poolAddress = new PublicKey(poolAddressStr)
//   try {
//     const accountInfo = await connection.getAccountInfo(poolAddress)
//     console.log('Raw data:', accountInfo?.data)

//     // Optional: if it's a token account, decode it
//     try {
//       const tokenAcc = await getAccount(connection, poolAddress)
//       console.log('✅ Mint:', tokenAcc.mint.toBase58())
//       console.log('✅ Owner:', tokenAcc.owner.toBase58())
//     } catch (e) {
//       console.log('Not a token account:', e.message)
//     }
//   } catch (err) {
//     console.error('Failed to fetch account:', err)
//   }
// }

// inspectPool('43ruaiBvmMMTzh3fZcbJq2Em7V6coyT7yvAdJeRwqMMb')
