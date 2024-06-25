const Big = require("big.js");
module.exports = function (transaction,changes) {
  ContractAssert(
    typeof transaction.params.amount == "string" && !isNaN(transaction.params.amount),
    "Invalid amount provided"
  );
  ContractAssert(typeof transaction.params.to == "string", 'No "to" specified');

  const to = transaction.params.to;
  const amount = Big(transaction.params.amount);
  ContractAssert(amount.mod(1).eq(0), "Cannot transfer fraction of minimal unit");
  const senderBalance = Big(KV.get(`balances.${transaction.sender}`) || "0");
  const receiverBalance = Big(KV.get(`balances.${to}`) || "0");

  ContractAssert(
    senderBalance.gte(amount),
    `Not enough tokens to transfer this amount (transferring: ${amount.toString()} balance: ${senderBalance.toString()})`
  );
  changes.push(
    KV.set(`balances.${transaction.sender}`, senderBalance.minus(amount).toString()),
    KV.set(`balances.${to}`, receiverBalance.plus(amount).toString())
  );
};
