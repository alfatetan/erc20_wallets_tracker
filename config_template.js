'use strict';
// Fill this configuration file your data and rename it to "config.js".

// * required
//"token" contains the tokens data wich will be used in the wallets analysis table.
// e.g. if we want to bind for counting all USD stablecoins we can include those addresses
// in the token address

const tokens = [
  {
    token_view: 'USD',
    token_img: './token_images/centre-usdc_28.webp',
    // USD = USDC + USDT + DAI stablecoins
    token_addresses: [
      '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT stablecoin
      '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI stablecoin
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC stablecoin
    ],
  },
  {
    token_view: 'HEX',
    token_img: './token_images/hex_32.webp',
    token_addresses: [
      '0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39', // HEX ERC20 token
    ],
  },
  {
    token_view: 'PLSD',
    token_img: './token_images/pulsedogecoin_32.webp',
    token_addresses: [
      '0x34F0915a5f15a66Eba86F6a58bE1A471FB7836A7', // Pulse DogeCoin ERC20 token
    ],
  },
];

// * required
// The service works via Moralis API. You need to register on the moralis.io and
// fill your API configuration
const moralisAPI = {
  serverUrl: '***************************************',
  appId: '********************************',
};

// (optional)
// Google API to download data from Google Spreadsheets
const googleAPI = {
  CLIENT_ID: '****************************************************************',
  API_KEY: '********************************',
  DISCOVERY_DOC: 'https://sheets.googleapis.com/$discovery/rest?version=v4',
  SCOPES: 'https://www.googleapis.com/auth/spreadsheets.readonly',
};

export { tokens, moralisAPI, googleAPI };
