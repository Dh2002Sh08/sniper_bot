import fetch from 'node-fetch';
const NEW_API_KEY = process.env.NEXT_MORALIS_KEY;
console.log("API_KEY", NEW_API_KEY);
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    'X-API-Key': NEW_API_KEY,
  },
};

fetch('https://solana-gateway.moralis.io/token/mainnet/exchange/pumpfun/new?limit=100', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));