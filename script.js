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

// for (let i = 0; i < btnsOpenModal.length; i++) {
//   btnsOpenModal[i].addEventListener('click', openModal);
// }

//-------------------------------------------------------------------------------------------

console.log(tokens, moralisAPI, googleAPI);

console.log(moralisAPI.serverUrl);
// Moralis.start({moralisAPI.serverUrl, })

function consoleMsg(...messages) {
  for (let i = 0; i < messages.length; i++) {
    const paragraph = document.createElement('p');
    paragraph.innerHTML = `> ${messages[i]}`;
    document.querySelector('.console').appendChild(paragraph);
  }
}

consoleMsg('Welcome to aboard! Connect to Metamask and lets beginning!!!');

Moralis.start(moralisAPI);

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
btnsOpenModal.addEventListener('click', openModal);
overlay.addEventListener('click', closeModal);
btnCloseModal.addEventListener('click', closeModal);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
});
