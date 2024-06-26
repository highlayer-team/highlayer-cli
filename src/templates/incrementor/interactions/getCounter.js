const { HighlayerClient, PrivateKeySigner } = require("highlayer-sdk");
const ContractAddress = "x";
const Key = "counter";

(async () => {
  let SigningClinet = new HighlayerClient({
    node: "http://51.159.210.149:3000",
  });

  let contract = SigningClinet.KV(ContractAddress);

  console.log(await contract.get(Key));
})();
