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
        program:
          "hlcontract1qjty79prmqevsrn6e6tutfu2tkmccvkrq4r6ztwkrd0mn7j5j5jyqtrp523",
        action: "increment",
        params: {},
      },
    ]);

  console.log(await client.signAndBroadcast(transaction));
})();
