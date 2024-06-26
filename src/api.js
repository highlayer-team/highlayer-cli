const { decrypt } = require("./helpers");
const readlineSync = require("readline-sync");
const highlayer = require("highlayer-sdk");
const path = require("path");
const fs = require("fs");

function TransactionSigner(transactionData) {
  let walletData;
  try {
    walletData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "commands", "keyStore.json"), {
        encoding: "utf8",
      })
    );
  } catch (e) {
    console.error("❌ Make sure you have a wallet identity created");
    throw new Error("No wallet linked");
  }

  console.log(`You are about to sign following transaction: `, transactionData);

  const verify = readlineSync.question(`Proceed? Y/N: `).toLowerCase();

  if (verify.startsWith("n")) {
    console.log("❌ Canceling");
    throw new Error("Cancelled");
  } else if (!verify.startsWith("y")) {
    console.log("❌ Canceling, unsupported input.");
    throw new Error("Cancelled");
  }

  let HighlayerTx = new highlayer.HighlayerTx(transactionData);

  if (walletData.encrypted) {
    const typePassword = readlineSync.question("Password?: ", {
      hideEchoBack: true,
    });

    try {
      walletData.privateKey = decrypt(walletData.privateKey, typePassword);
    } catch (e) {
      console.error("❌ Invalid Password");
      throw new Error("Invalid decryption password");
    }
  }
  return highlayer.bip322.Signer.sign(
    walletData.privateKey,
    walletData.address,
    HighlayerTx.rawTxID()
  );
}

function getHighlayerCliAddress() {
  let walletData;
  try {
    walletData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "commands", "keyStore.json"), {
        encoding: "utf8",
      })
    );
  } catch (e) {
    console.error("❌ Make sure you have a wallet identity created");
    throw new Error("No wallet linked");
  }
  return walletData.address;
}

module.exports = {
  TransactionSigner,
  getHighlayerCliAddress,
};
