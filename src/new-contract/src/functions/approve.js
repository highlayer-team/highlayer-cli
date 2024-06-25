const Big = require("big.js");
module.exports = function (transaction,changes) {
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
    amount.mod(1).eq(0),
    "Cannot approve spending fraction of minimal unit"
  );
  changes.push(KV.set(`allowances.${transaction.sender}.${spender}`, amount.toString()));
};
