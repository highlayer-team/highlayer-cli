const { build } = require("esbuild");
const replace = require("replace-in-file");
const babel = require("@babel/core");
const path = require("path");
const fs = require("fs");
const { decrypt } = require("../helpers");
const highlayer = require("highlayer-sdk");
const readlineSync = require("readline-sync");
const bech32 = require("bcrypto/lib/encoding/bech32m");
const crypto = require("crypto");

module.exports = async (options) => {
  let walletData;
  if (!options.alans) {
    return console.error(
      "❌ You must add an --alans param to indicate how much you'd like to deposit"
    );
  }
  try {
    walletData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "keyStore.json"), {
        encoding: "utf8",
      })
    );
  } catch (e) {
    return console.error(
      "❌ Make sure you have a wallet identity created with setwallet command"
    );
  }

  if (walletData.encrypted) {
    const typePassword = readlineSync.question("Password?: ", {
      hideEchoBack: true,
    });

    try {
      walletData.privateKey = decrypt(walletData.privateKey, typePassword);
    } catch (e) {
      return console.error("❌ Invalid Password");
    }

    let SigningClinet = new highlayer.SigningHighlayerClient({
      sequencer: "http://51.159.210.149:2880",
      node: "http://51.159.210.149:3000",
      signingFunction: function signer(data) {
        return highlayer.bip322.Signer.sign(
          walletData.privateKey,
          walletData.address,
          data
        );
      },
    });

    const transaction = new highlayer.TransactionBuilder()
      .setAddress(walletData.address)
      .addActions([
        highlayer.Actions.sequencerDeposit({ amount: options.alans }),
      ]);

    const depositEstimatedFee = await SigningClinet.getTransactionFee(
      transaction
    );

    console.log(
      `🛠️  Upload contract fee ~${
        depositEstimatedFee.gasNeeded
      } Alans (${highlayer.AlanToHi(depositEstimatedFee.gasNeeded)} HI) 🛠️`
    );

    const verifyFee = readlineSync.question(`Proceed? Y/N: `).toLowerCase();

    if (verifyFee.startsWith("n")) {
      console.log("❌ Canceling");
      return;
    } else if (!verifyFee.startsWith("y")) {
      console.log("❌ Canceling, unsupported input.");
      return;
    }

    transaction.setActions([
      highlayer.Actions.allocateGas({
        amount: depositEstimatedFee.gasNeeded,
        price: 1,
      }),
      highlayer.Actions.sequencerDeposit({ amount: options.alans }),
    ]);

    const uploadContractData = await SigningClinet.signAndBroadcast(
      transaction
    );

    console.log(`Sequencer Response: `);
    console.log(uploadContractData);
    console.log("✅ Successfully Depositted");
  }
};
