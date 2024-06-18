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

const numberToPaddedHex = (number) =>
  (number.toString(16).length % 2 ? "0" : "") + number.toString(16);

const isJSFile = (filePath) => path.extname(filePath) === ".js";

module.exports = async (dir, options) => {
  const contractFolder = dir || "dist/contract.js";

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
    sequencer: "http://51.159.210.149:2880",
    node: "http://51.159.210.149:3000",
    signingFunction: (data) =>
      highlayer.bip322.Signer.sign(
        walletData.privateKey,
        walletData.address,
        data
      ),
  });

  const uploadData = new highlayer.TransactionBuilder()
    .setAddress(walletData.address)
    .addActions([
      highlayer.Actions.uploadData({
        data: fs.readFileSync(path.join(contractFolder)).toString("base64"),
      }),
    ]);

  const createContract = new highlayer.TransactionBuilder()
    .setAddress(walletData.address)
    .addActions([
      highlayer.Actions.createContract({
        sourceId:
          "hlcontract1q0q8f3mgkax5lvc3hnedf54dtktmzap2v2z9flagt2z3jhvfwtwgq95anla", // Place holder contract, just so fee is accurate
        initActions: [],
        gasForInitActions: 50000,
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

  createContract.setActions([
    highlayer.Actions.allocateGas({
      amount: createContractEstimatedGas.gasNeeded,
      price: 1,
    }),
    highlayer.Actions.createContract({
      sourceId: uploadContractData.hash,
      initActions: [],
      gasForInitActions: 50000,
    }),
  ]);

  const contractUploadResponse = await client.signAndBroadcast(createContract);

  console.log("✅ Contract Src ID: " + uploadContractData.hash);
  console.log(
    "✅ Contract ID: " +
      bech32.encode(
        "hlcontract",
        0,
        crypto
          .createHash("sha256")
          .update(
            Buffer.concat([
              Buffer.from(contractUploadResponse.hash, "hex"),
              Buffer.from(numberToPaddedHex(1), "hex"),
              Buffer.from(uploadContractData.hash, "hex"),
            ])
          )
          .digest()
      )
  );
};
