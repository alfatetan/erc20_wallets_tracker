'use strict';

// ------------------------------------------------------------
// ----------- Time calculation functions ---------------------
// ------------------------------------------------------------
function getCurrentDateTimeUnix() {
  const dateTime = Math.round(new Date().getTime() / 1000);
  return dateTime;
}

function getDatesArray(daysBefore = 1, step = 86400) {
  // add the milliseconds. 1 day = 86400 seconds or 86400000 milliseconds
  step = step;

  const now = new Date();
  const currentDay = now.getDate() < 9 ? `0` + now.getDate() : now.getDate();
  const currentMonth =
    now.getMonth() < 9 ? `0` + (now.getMonth() + 1) : now.getMonth + 1;
  const currentYear = now.getFullYear();

  const dayBegan = `${currentYear}-${currentMonth}-${currentDay}T00:00:00.000Z`;
  let previousDay = Math.round((new Date(dayBegan) - 501) / 1000);

  const days = [Math.round(now.getTime() / 1000), previousDay]; // return array of dates

  for (let i = 1; i < daysBefore; i++) {
    previousDay = previousDay - step;
    days.push(previousDay);
  }

  return days;
}

// ------------------------------------------------------------
// --------------- Google API variables -----------------------
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

// -------------------------------------------------------------
// ----- Token calculation functions and Wallets functions -----
// -------------------------------------------------------------
function getUserWallet() {
  // return the user's connected wallet adderess
  const userWallet = Moralis.User.current().get('ethAddress');
  return userWallet;
}

async function getTokensBalance(wallet, dateTime) {
  // get the block number from the dateTime. dateTime is array of Unix timestamps
  const block = await Moralis.Web3API.native.getDateToBlock({ date: dateTime });
  //   console.log(`The block number is ${block.block}`);

  const tokenBalances = await Moralis.Web3API.account.getTokenBalances({
    address: wallet,
    to_block: block.block,
  });
  console.log(`The token balances for wallet ${wallet} is ${tokenBalances}`);
  console.log(tokenBalances);

  const balanceOnDate = {
    dateTime: dateTime,
    block: block.block,
    balance: tokenBalances,
  };

  return balanceOnDate;
}

async function getTokensHistory(wallet, daysBefore, step = 86400) {
  const walletHistory = {
    walletAddress: wallet,
    tokenBalances: [],
  };

  const dates = getDatesArray(daysBefore, step);
  //   console.log(dates);
  for (let i = 0; i < dates.length; i++) {
    const balance = await getTokensBalance(wallet, dates[i]);
    walletHistory.tokenBalances.push(balance);
  }
  return walletHistory;
}

// ------------------------------------------------------------
// ------------- Work with modal window -----------------------
// ------------------------------------------------------------

const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.close-modal');
// const btnsOpenModal = document.querySelectorAll('.show-modal');
const btnsOpenModal = document.getElementById('btn-gsheets-ld');

const openModal = function () {
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

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

// ------------------------------------------------------------
// -- Data Compiling and structuring to show in on the charts -
// ------------------------------------------------------------

function getDigitBalance(balance, decimals) {
  // Input balance:str and decimals: str
  // Output didtBalane: float
  let digitBalance = `${balance.slice(
    0,
    balance.length - decimals
  )}.${balance.slice(-decimals)}`;
  digitBalance = Number(digitBalance).toFixed(3);
  digitBalance = Number(digitBalance);
  return digitBalance;
}

function tokenCalculation(tokenView, tokenAddresses, walletHistory) {
  // return the calculation of the token for the days
  // tokenAddresses - is array of token's addresses

  const result = {
    tokenView: tokenView,
    balance: [],
  };

  for (let i = 0; i < walletHistory.tokenBalances.length; i++) {
    const dateTime = walletHistory.tokenBalances[i].dateTime;
    const block = walletHistory.tokenBalances[i].block;
    const balance = walletHistory.tokenBalances[i].balance;
    let count = 0;

    for (let j = 0; j < balance.length; j++) {
      for (let k = 0; k < tokenAddresses.length; k++) {
        const configTokenAddress = tokenAddresses[k].toLowerCase();
        if (configTokenAddress === balance[j].token_address.toLowerCase()) {
          count += getDigitBalance(balance[j].balance, balance[j].decimals);
        }
      }
    }
    result.balance.push({
      dateTime: dateTime,
      block: block,
      balance: count,
    });
  }
  return result;
}

// Tokens chart calculation from configuration file
async function getChartData(wallet, daysBefore) {
  currentWallet.walletAddress = wallet;
  const history = await getTokensHistory(wallet, daysBefore);
  for (let i = 0; i < tokens.length; i++) {
    const calculation = tokenCalculation(
      tokens[i].token_view,
      tokens[i].token_addresses,
      history
    );
    currentWallet.balances.push(calculation);
  }
}

// ------------------------------------------------------------
// ------------------- Charts drawing -------------------------
// ------------------------------------------------------------

function addChartElement(chartsName) {
  const chartsArea = document.getElementById('charts-area');
  const chart = document.createElement('div');
  chartsArea.setAttribute('class', 'chart');
  chart.innerHTML = `<canvas id="${chartsName}"></canvas>`;

  chartsArea.appendChild(chart);
}

function getLabelsAndSortChartsData() {
  const balances = currentWallet.balances;
  const result = [];
  for (let i = 0; i < balances.length; i++) {
    const sortedData = {};
    sortedData.tokenView = balances[i].tokenView;

    const labels = [];
    for (let j = 0; j < balances[i].balance.length; j++) {
      labels.push(balances[i].balance[j].dateTime);
    }

    // Sort labels for the dateTime
    labels.sort(function (a, b) {
      return a - b;
    });

    sortedData.labels = labels;

    const drawingData = [];
    // Sorting data in the order of the dateTime
    for (let j = 0; j < labels.length; j++) {
      const findBalance = balances[i].balance.find(
        el => el.dateTime === labels[j]
      );
      drawingData.push(findBalance.balance);
    }
    sortedData.data = drawingData;
    result.push(sortedData);
  }
  return result;
}

function chartConfigTransform(chartSortedData) {
  const dates = [];
  for (let i = 0; i < chartSortedData.labels.length; i++) {
    const transformDate = new Date(chartSortedData.labels[i] * 1000);
    const day =
      transformDate.getDate() < 9
        ? `0` + transformDate.getDate()
        : transformDate.getDate();
    const month =
      transformDate.getMonth() < 9
        ? `0` + (transformDate.getMonth() + 1)
        : transformDate.getMonth + 1;
    dates.push(`${month}/${day}`);
  }

  const readyData = {
    labels: dates,
    datasets: [
      {
        label: chartSortedData.tokenView,
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: chartSortedData.data,
      },
    ],
  };

  return readyData;
}

function chartsDraw() {
  for (let i = 0; i < currentWallet.balances.length; i++) {
    const chartId = currentWallet.balances[i].tokenView;
    addChartElement(chartId);
  }

  const dataAndLabels = getLabelsAndSortChartsData();
  for (let i = 0; i < dataAndLabels.length; i++) {
    const chartReadyData = chartConfigTransform(dataAndLabels[i]);
    const chartConfig = {
      type: 'line',
      data: chartReadyData,
      options: {},
    };
    const elementId = chartReadyData.datasets[0].label;
    const myChart = new Chart(document.getElementById(elementId), chartConfig);
    readyCharts.push(myChart);
  }
}
