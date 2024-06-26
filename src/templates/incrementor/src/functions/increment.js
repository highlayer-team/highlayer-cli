// Increment Function

module.exports = function (transaction, changes) {
  // Fetch counter state
  let counter = KV.get("counter") || 0;

  // Increment the counter
  counter += 1;

  // Push new state
  changes.push(KV.set(`counter`, counter));
};
