'use strict';

// ------------------------------------------------------------
// Google API variables
// ------------------------------------------------------------
let tokenClient;
let gapiInited = false;
let gisInited = false;

// The array of wallets after download from Google Spreadsheets
let walletsList;

// -------------------------------------------------------------
// ------------- Metamask login via Moralis --------------------
// -------------------------------------------------------------

/* MetaMask authenticate */
async function metamaskLogin() {
  let user = Moralis.User.current();
  if (!user) {
    user = await Moralis.authenticate({
      signingMessage: 'Log in using Moralis',
    })
      .then(function (user) {
        console.log('logged in user:', user);
        console.log(user.get('ethAddress'));
        consoleMsg('Metamask connected successfully!');
      })
      .catch(function (error) {
        console.log(error);
      });
  }
}

async function metamaskLogOut() {
  await Moralis.User.logOut();
  console.log('logged out');
  consoleMsg("ERROR: Metamask wasn't connected");
}

// -------------------------------------------------------------
// ------------- Google Spreadsheets login ---------------------
// -------------------------------------------------------------

const btnGoogleSignOut = document.getElementById('btn-google-signout');
const btnGoogleLogin = document.getElementById('btn-google-login');
btnGoogleSignOut.style.visibility = 'hidden';
btnGoogleLogin.style.visibility = 'hidden';

/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
  gapi.load('client', intializeGapiClient);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function intializeGapiClient() {
  await gapi.client.init({
    apiKey: googleAPI.API_KEY,
    discoveryDocs: [googleAPI.DISCOVERY_DOC],
  });
  gapiInited = true;
  maybeEnableButtons();
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: googleAPI.CLIENT_ID,
    scope: googleAPI.SCOPES,
    callback: '', // defined later
  });
  gisInited = true;
  maybeEnableButtons();
}

/**
 * Enables user interaction after all Google libraries are loaded.
 */
function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    btnGoogleLogin.style.visibility = 'visible';
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick() {
  tokenClient.callback = async resp => {
    if (resp.error !== undefined) {
      throw resp;
    }
    await getWalletsList();
    btnGoogleLogin.style.visibility = 'hidden';
    btnGoogleSignOut.style.visibility = 'visible';
  };

  if (gapi.client.getToken() === null) {
    // Prompt the user to select a Google Account and ask for consent to share their data
    // when establishing a new session.
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    // Skip display of account chooser and consent dialog for an existing session.
    tokenClient.requestAccessToken({ prompt: '' });
  }
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick() {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken('');

    btnGoogleLogin.style.visibility = 'visible';
    btnGoogleSignOut.style.visibility = 'hidden';
  }
}

/**
 * Load the wallets list from Google Spreadsheets account
 * Main restriction: the first column is the address of wallets
 * The second column of the spreadsheet is the name of the wallets
 */
async function getWalletsList() {
  const cleanSpreadsheetId = function (url) {
    // leave only spreadsheetId from the URL
    return url.slice(39, 83);
  };
  // get the spreadsheet ID from the URL
  const spreadsheetId = cleanSpreadsheetId(
    document.getElementById('spreadseet-link').value
  );
  const listSpreadsheet = 'Sheet1'; // the list where wallets data stored

  let response;
  try {
    response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: listSpreadsheet, // use the default sheet of spreadsheet
    });
    consoleMsg('Wallets list successfully uploaded!');
  } catch (err) {
    consoleMsg(
      'ERROR:',
      'Something went wrong with the spreadsheet loading.',
      err.message
    );
    return;
  }

  const range = response.result;
  // Check if the list is empty
  if (!range || !range.values || range.values.length == 0) {
    consoleMsg('Upload data ERROR:', 'No values found in the spreadsheet!');
    return;
  }

  // Moove the list to the global variable
  walletsList = range.values;
  console.log(walletsList);
}

// Load the wallets list after button click
btnGoogleLogin.addEventListener('click', function () {
  handleAuthClick();
});
// Sign out if user wants to disconnect the Google Account
btnGoogleSignOut.addEventListener('click', function () {
  handleSignoutClick();
});

// ****************************************************************
// table rendering
// the example was taken from https://www.fwait.com/how-to-create-table-from-an-array-of-objects-in-javascript/
// ****************************************************************

const tmpWalletsListFull = [
  {
    wallet_address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    wallet_name: 'Big boy',
    balances: [
      {
        token_view: 'HEX',
        quantity: 500,
      },
      {
        token_view: 'USD',
        quantity: 25000,
      },
      {
        token_view: 'PLSD',
        quantity: 450,
      },
    ],
  },
  {
    wallet_address: '0x6B175474E89094C44Da98b954Eed999999999999',
    wallet_name: 'Big boy',
    balances: [
      {
        token_view: 'HEX',
        quantity: 1000,
      },
      {
        token_view: 'USD',
        quantity: 5000,
      },
      {
        token_view: 'PLSD',
        quantity: 0,
      },
    ],
  },
  {
    wallet_address: '0x9999999999999999Da98b954EedeAC495271d0F',
    wallet_name: 'Big boy',
    balances: [
      {
        token_view: 'HEX',
        quantity: 55000,
      },
      {
        token_view: 'USD',
        quantity: 25000000,
      },
      {
        token_view: 'PLSD',
        quantity: 56000000,
      },
    ],
  },
];

function tableRender(tmpWalletsListFull) {
  const getAllTokens = function () {
    // Get all token views to create the columns for table
    const allTokensView = [];
    for (let i = 0; i < tokens.length; i++) {
      allTokensView.push(tokens[i].token_view);
    }
    return allTokensView;
  };
  const tableHeader = ['Wallet name', 'Wallet address', ...getAllTokens()];
  console.log(tableHeader);
}
