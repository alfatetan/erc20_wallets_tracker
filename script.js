'use strict';

// import { tokens, moralisAPI, googleAPI } from './config.js';

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

//-------------------------------------------------------------------------------------------

console.log(tokens, moralisAPI, googleAPI);

console.log(moralisAPI.serverUrl);
// Moralis.start({moralisAPI.serverUrl, })

function consoleMsg(...messages) {
  for (let i = 0; i < messages.length; i++) {
    const paragraph = document.createElement('p');
    // paragraph.style.color = color;
    paragraph.innerHTML = `> ${messages[i]}`;
    document.querySelector('.console').appendChild(paragraph);
  }
}

consoleMsg('Welcome to aboard! Connect to Metamask and lets beginning!!!');

Moralis.start(moralisAPI);

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
