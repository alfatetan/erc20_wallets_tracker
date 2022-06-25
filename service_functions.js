'use strict';

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

btnGSheetsLd = document.getElementById('btn-gsheets-ld');
btnGSheetsLd.visibility = 'hidden';
