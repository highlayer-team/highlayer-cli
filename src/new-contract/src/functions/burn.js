const Big = require("big.js");
module.exports = function (transaction) {
  ContractAssert(
    typeof transaction.params.amount == "string" &&
      !isNaN(transaction.params.amount),
    "Invalid amount provided"
  );
  const amount = Big(transaction.params.amount);

  ContractAssert(amount.c == "0", "Cannot burn fraction of minimal unit");

  const burnerBalance = Big(KV.get(`balances.${caller}`) || "0");
  const totalSupply = Big(KV.get("totalSupply"));
  ContractAssert(
    burnerBalance.gte(amount),
    "Not enough tokens to burn this amount"
  );
  changes.push(
    KV.set(`balances.${caller}`, burnerBalance.minus(amount).toString()),
    KV.set(`totalSupply`, totalSupply.minus(amount).toString())
  );
};
