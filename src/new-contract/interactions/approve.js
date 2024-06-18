const highlayer = require("highlayer-sdk");

const PRIVATE_KEY = "";
const ADDRESS = "";

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
        amount: "100",
        price: 1,
      }),
      highlayer.Actions.contractInteraction({
        contractId: "",
        action: "approve",
        params: {
          amount: "100",
          spender: "",
        },
      }),
    ]);

  client.signAndBroadcast(transaction);
})();
