const highlayer = require("highlayer-sdk");
const { TransactionSigner, getHighlayerCliAddress } = require("highlayer-cli");

(async () => {
  const client = new highlayer.SigningHighlayerClient({
    sequencer: "http://sequencer.highlayer.io/",
    node: "https://seed-node.highlayer.io/",
    signingFunction: TransactionSigner,
  });

  const transaction = new highlayer.TransactionBuilder()
    .setAddress(getHighlayerCliAddress())
    .addActions([
      highlayer.Actions.allocateGas({
        amount: 5000000,
        price: 1,
      }),
      {
        program: "yourContractId",
        action: "test",
        params: {},
      },
    ]);

  console.log(await client.signAndBroadcast(transaction));
})();
