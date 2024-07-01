const { HighlayerClient, PrivateKeySigner } = require("highlayer-sdk");
const ContractAddress = "x";
const Key = "counter";

(async () => {
  let SigningClinet = new HighlayerClient({
    node: "https://node-1.highlayer.io/",
  });

  let contract = SigningClinet.KV(ContractAddress);

  console.log(await contract.get(Key));
})();
