const path = require("path");
const fs = require("fs");
const { decrypt } = require("../helpers");
const highlayer = require("highlayer-sdk");
const readlineSync = require("readline-sync");
const bech32 = require("bcrypto/lib/encoding/bech32m");
const crypto = require("crypto");

const numberToPaddedHex = (number) =>
  (number.toString(16).length % 2 ? "0" : "") + number.toString(16);

const isJSFile = (filePath) => path.extname(filePath) === ".js";

module.exports = async (dir, options) => {
  const contractFolder = dir || "dist/contract.js";
  let genesisActions;

  if (!options.actions) {
    return console.error(`❌ You must provide the --actions param`);
  }

  if (!fs.existsSync(options.actions)) {
    return console.log(`❌ ${options.actions} file does not exist `);
  }
  try {
    genesisActions = JSON.parse(fs.readFileSync(options.actions));
  } catch (e) {
    return console.log(`❌ Invalid genesis file`);
  }

  if (!fs.existsSync(contractFolder)) {
    console.error(
      `❌ '${contractFolder}' doesn't exist, make sure you ran highlayer-cli build`
    );
    return;
  }

  if (!isJSFile(contractFolder)) {
    console.error(`❌ Make sure you are uploading a JavaScript file`);
    return;
  }
  let walletData;

  try {
    walletData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "keyStore.json"), {
        encoding: "utf8",
      })
    );
  } catch (e) {
    return console.error("❌ Make sure you have a wallet identity created");
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
  }

  const client = new highlayer.SigningHighlayerClient({
    sequencer: "http://sequencer.highlayer.io/",
    node: "https://seed-node.highlayer.io/",
    signingFunction: highlayer.PrivateKeySigner(
      walletData.privateKey,
      walletData.address
    ),
  });

  const uploadData = new highlayer.TransactionBuilder()
    .setAddress(walletData.address)
    .addActions([
      highlayer.Actions.uploadData({
        data: fs.readFileSync(path.join(contractFolder)).toString("base64"),
      }),
    ]);

  const stubGenesisActionsTx = new highlayer.TransactionBuilder()
    .setAddress(
      "hlcontract100000000000000000000000000000000000000000000000000000000000"
    )
    .setActions(genesisActions);
  const gasForInitActions = await client.getTransactionFee(
    stubGenesisActionsTx
  );

  const createContract = new highlayer.TransactionBuilder()
    .setAddress(walletData.address)
    .addActions([
      highlayer.Actions.createContract({
        sourceId:
          "hlcontract1q0q8f3mgkax5lvc3hnedf54dtktmzap2v2z9flagt2z3jhvfwtwgq95anla", // Place holder contract, just so fee is accurate
        initActions: genesisActions,
        gasForInitActions: gasForInitActions.gasNeeded,
      }),
    ]);

  const uploadEstimatedGas = await client.getTransactionFee(uploadData);
  const createContractEstimatedGas = await client.getTransactionFee(
    createContract
  );
  const totalFee =
    uploadEstimatedGas.gasNeeded + createContractEstimatedGas.gasNeeded;

  uploadData.actions.unshift(
    highlayer.Actions.allocateGas({
      amount: uploadEstimatedGas.gasNeeded,
      price: 1,
    })
  );
  console.log(
    `🛠️  Upload contract fee ~${totalFee} Alans (${highlayer.AlanToHi(
      totalFee
    )} HI) 🛠️`
  );

  const verifyFee = readlineSync.question(`Proceed? Y/N: `).toLowerCase();

  if (verifyFee.startsWith("n")) {
    console.log("❌ Canceling");
    return;
  } else if (!verifyFee.startsWith("y")) {
    console.log("❌ Canceling, unsupported input.");
    return;
  }

  const uploadContractData = await client.signAndBroadcast(uploadData);
  const sourceId =
    new highlayer.HighlayerTx(uploadData).txID() + numberToPaddedHex(1);

  if (uploadContractData.Error == "Insufficient Sequencer Balance") {
    return console.error(
      "❌ Insufficient Sequencer Balance, please run the `highlayer-cli deposit`"
    );
  }

  createContract.setActions([
    highlayer.Actions.allocateGas({
      amount: createContractEstimatedGas.gasNeeded,
      price: 1,
    }),
    highlayer.Actions.createContract({
      sourceId: sourceId,
      initActions: genesisActions,
      gasForInitActions: gasForInitActions.gasNeeded,
    }),
  ]);

  const contractUploadResponse = await client.signAndBroadcast(createContract);

  console.log("✅ Contract Src ID: " + sourceId);
  console.log(
    "✅ Contract ID: " +
      bech32.encode(
        "hlcontract",
        0,
        crypto
          .createHash("blake2s256")
          .update(
            Buffer.concat([
              Buffer.from(
                new highlayer.HighlayerTx(createContract).txID(),
                "hex"
              ),
              Buffer.from(numberToPaddedHex(1), "hex"),
              Buffer.from(sourceId, "hex"),
            ])
          )
          .digest()
      )
  );
};
