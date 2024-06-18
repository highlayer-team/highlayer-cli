const Big = require("big.js");
module.exports = function (transaction) {
  ContractAssert(
    typeof transaction.params.amount == "string" && !isNaN(amount),
    "Invalid amount provided"
  );
  ContractAssert(
    typeof transaction.params.spender == "string",
    'No "spender" specified'
  );

  const spender = transaction.params.spender;
  const amount = Big(transaction.params.amount);

  ContractAssert(
    amount.c == "0",
    "Cannot approve spending fraction of minimal unit"
  );
  changes.push(KV.set(`allowances.${caller}.${spender}`, amount.toString()));
};
