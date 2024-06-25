const highlayer = require("highlayer-sdk");
const { TransactionSigner, getHighlayerCliAddress } = require("highlayer-cli");

(async () => {
  const client = new highlayer.SigningHighlayerClient({
    sequencer: "http://51.159.210.149:2880",
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
        action: "transfer",
        params: { to: "test", amount: "5000" },
      },
    ]);

  console.log(await client.signAndBroadcast(transaction));
})();
