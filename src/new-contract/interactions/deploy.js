const highlayer = require("highlayer-sdk");
const fs = require("fs");

const PRIVATE_KEY = "cPMB77TJ2CgHdv3dfyba5AhUjCeSBrpyGdJcnJZzsAMj85db9HoB";
const ADDRESS =
  "tb1p0wt007yyzfswhsnwnc45ly9ktyefzyrwznwja0m4gr7n9vjactes80klh4";

(async () => {
  const client = new highlayer.SigningHighlayerClient({
    sequencer: "http://51.159.210.149:2880/",
    signingFunction: function signer(data) {
      return bip322.Signer.sign(PRIVATE_KEY, ADDRESS, data);
    },
  });

  const transaction = new highlayer.TransactionBuilder()
    .setAddress(ADDRESS)
    .addActions([
      highlayer.Actions.allocateGas({
        amount: "5000",
        price: 1,
      }),
      highlayer.Actions.uploadData({
        data: fs
          .readFileSync(path.join(__dirname, "test-assets", "contract.js"))
          .toString("base64"),
      }),
    ]);

  console.log(client.signAndBroadcast(transaction));
})();
