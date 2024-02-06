'use strict';

const readyCharts = [];

// import { tokens } from './config_template';

// Start Moralis API
Moralis.start(moralisAPI);
// Moralis.settings.setAPIRateLimit({
//   anonymous: 10,
//   authenticated: 20,
//   windowMs: 60000,
// });

// The current wallet what we'll use to show the information
const currentWallet = {
  walletAddress: getUserWallet(),
  name: "The current user's wallet address",
  balances: [],
};

//-------------------------------------------------------------------------------------------

function consoleMsg(...messages) {
  for (let i = 0; i < messages.length; i++) {
    const paragraph = document.createElement('p');
    // paragraph.style.color = color;
    paragraph.innerHTML = `> ${messages[i]}`;
    document.querySelector('.console').appendChild(paragraph);
  }
}

consoleMsg('Welcome to aboard! Connect to Metamask and lets beginning!!!');

// Connect to Metamask needed for a first time while program works
document
  .querySelector('#btn-connect-mm')
  .addEventListener('click', function () {
    if (!Moralis.User.current()) {
      metamaskLogin();
    } else {
      consoleMsg('MetaMask already connected');
    }
    document.querySelector('#btn-connect-mm').removeAttribute('class');
  });

// Google Spreadsheets load modal window
// This function works just once to load the wallets data from Google Spreadsheets
btnsOpenModal.addEventListener('click', openModal);
overlay.addEventListener('click', closeModal);
btnCloseModal.addEventListener('click', closeModal);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
});

// Switch the views for view switcher
document
  .querySelector('#table-chart-view')
  .addEventListener('change', function (e) {
    const tableView = document.querySelectorAll('.table-view');
    const chartView = document.querySelectorAll('.chart-view');

    if (e.target.checked) {
      tableView.forEach(el => {
        el.style.display = 'none';
      });
      chartView.forEach(el => {
        el.style.display = 'block';
      });
    } else {
      tableView.forEach(el => {
        el.style.display = 'block';
      });
      chartView.forEach(el => {
        el.style.display = 'none';
      });
    }
  });

document
  .querySelector('#btn-search')
  .addEventListener('click', async function () {
    const wallet = document.querySelector('#search').value || getUserWallet();
    currentWallet.walletAddress = wallet;
    const currentTokensBalance = await Moralis.Web3API.account.getTokenBalances(
      {
        address: wallet,
      }
    );
    // Show the wallet as a label over the charts
    document.querySelector(
      '.wallet-address-label h2'
    ).textContent = `Wallet address: ${wallet}`;

    if (wallet && currentTokensBalance) {
      console.log(wallet);
      document.querySelector('#table-chart-view').click();
      // document.querySelector('#btn-show-charts').click();
    } else {
      consoleMsg('ERROR! Empty or wrong wallet number!');
    }
  });

document
  .querySelector('#btn-show-charts')
  .addEventListener('click', async function (wallet = '') {
    for (let i = 0; i < readyCharts.length; i++) {
      readyCharts[i].destroy();
    }

    const loadingLabel = document.querySelector('.loading-label h1');
    console.log('SHOW CHART button clicked');
    const daysBefore = Number(document.querySelector('#days-before').value);

    loadingLabel.style.display = 'block';
    const chartData = await getChartData(
      currentWallet.walletAddress,
      daysBefore
    );
    loadingLabel.style.display = 'none';

    chartsDraw();
  });
