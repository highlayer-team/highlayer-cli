#!/usr/bin/env node

const { Command } = require("commander");

const program = new Command();

program
  .name("highlayer-cli")
  .description("CLI to build and deploy projects")
  .version("0.0.1");

program
  .command("build [dir]")
  .description("Build the contract")
  .option("-o, --output <output>", "Where the dist/ folder is created")
  .action((dir, options) => {
    require("./commands/build")(dir, options);
  });

program
  .command("init <dir>")
  .description("Initilize a new Highlayer app")
  .action((dir) => {
    require("./commands/init")(dir);
  });

program
  .command("deploy [dir]")
  .description("Deploys contract source & instantiates a new contract")
  .action(async (dir, options) => {
    await require("./commands/deploy")(dir, options);
  });

program
  .command("setwallet <privateKey> <address>")
  .description("Set your private key and address")
  .option(
    "-p, --password <password>",
    "Optionally Encrypt your wallet information"
  )
  .action((privateKey, address, options) => {
    require("./commands/set")(privateKey, address, options);
  });

program.parse(process.argv);
