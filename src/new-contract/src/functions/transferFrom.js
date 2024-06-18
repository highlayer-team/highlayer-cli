const Big = require("big.js");
module.exports = function (transaction) {
  ContractAssert(
    typeof transaction.params.amount == "string" && !isNaN(amount),
    "Invalid amount provided"
  );
  ContractAssert(
    typeof transaction.params.from == "string",
    'No "from" specified.'
  );
  ContractAssert(
    typeof transaction.params.to == "string",
    'No "to" specified.'
  );

  const to = transaction.params.to;
  const from = transaction.params.from;
  const allowance = Big(KV.get(`allowances.${from}.${caller}`) || "0");
  const amount = Big(transaction.params.amount);

  ContractAssert(
    amount.c == "0",
    "Cannot approve spending fraction of minimal unit"
  );
  ContractAssert(allowance.gte(amount), "Trying spending more than allowed");

  const senderBalance = Big(KV.get(`balances.${from}`) || "0");
  const receiverBalance = Big(KV.get(`balances.${to}`) || "0");

  ContractAssert(
    senderBalance.gte(amount),
    "Not enough tokens to transfer this amount"
  );

  changes.push(
    KV.set(`allowances.${from}.${caller}`, allowance.minus(amount).toString()),
    KV.set(`balances.${from}`, senderBalance.minus(amount).toString()),
    KV.set(`balances.${to}`, receiverBalance.plus(amount).toString())
  );
};
