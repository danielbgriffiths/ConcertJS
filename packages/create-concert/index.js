#!/usr/bin/env node

const { Command } = require("commander");
const degit = require("degit");
const packageJson = require("./package.json");

const program = new Command();

program
  .name("create-concert")
  .version(packageJson.version)
  .argument("[project-name]", "Directory to create the new project in")
  .action(async projectName => {
    if (!projectName) {
      console.error("Please specify the project directory:");
      console.info("npx @concertjs/create-concert my-app");
      process.exit(1);
    }

    const emitter = degit(`danielbgriffiths/ConcertJS/templates/vite-typescript-todo`, {
      cache: false,
      force: true,
      verbose: true
    });

    try {
      await emitter.clone(projectName);
      console.log(`Project "${projectName}" created successfully!`);
      console.log("To get started:");
      console.log(`  cd ${projectName}`);
      console.log("  pnpm install");
      console.log("  pnpm dev");
    } catch (error) {
      console.error("Error cloning template:", error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);
