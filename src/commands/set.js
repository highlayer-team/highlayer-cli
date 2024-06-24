const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const readlineSync = require("readline-sync");

const { encrypt } = require("../helpers");

module.exports = (privateKey, address, options) => {
  let data = {
    privateKey,
    address,
    encrypted: false,
  };
  let genesis;
  if (options.actions) {
  } else {
    return console.error("❌ You must provide a --actions param");
  }
  if (options.password) {
    const retypedPassword = readlineSync.question("Retype password: ", {
      hideEchoBack: true,
    });

    if (options.password === retypedPassword) {
      console.log("✅ Passwords match.");
      data.privateKey = encrypt(privateKey, options.password);
      data.encrypted = true;
    } else {
      return console.log("❌ Ensure password matches");
    }
  }

  fs.writeFileSync(
    path.join(__dirname, "keyStore.json"),
    JSON.stringify(data),
    "utf8"
  );
  console.log("✅ Private key, and Address have been saved.");
};
