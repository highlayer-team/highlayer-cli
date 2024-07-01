const { HighlayerClient, PrivateKeySigner } = require("highlayer-sdk");
const ContractAddress = "x";
const Key = "counter";

(async () => {
  let SigningClinet = new HighlayerClient({
    sequencer: "http://sequencer.highlayer.io/",
    node: "https://seed-node.highlayer.io/",
  });

  let contract = SigningClinet.KV(ContractAddress);

  console.log(await contract.get(Key));
})();
