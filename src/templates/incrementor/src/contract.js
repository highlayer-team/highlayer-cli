const increment = require("./functions/increment.js");

export function onTransaction(transaction) {
  let changes = [];
  if (
    !transaction.params ||
    typeof transaction.params !== "object" ||
    typeof transaction.action !== "string"
  ) {
    ContractError("Invalid input or function not provided");
  }

  const functionMap = {
    increment: increment,
  };

  const selectedFunction = functionMap[transaction.action];
  if (!selectedFunction) {
    ContractError(`Function '${transaction.action}' not found`);
  }

  try {
    selectedFunction(transaction, changes);
    return changes;
  } catch (error) {
    ContractError(`'${transaction.action}': ${error.message}`);
  }
}
