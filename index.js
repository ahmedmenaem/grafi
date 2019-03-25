#!/usr/bin/env node

"use strict";
const program = require("commander");
const chalk = require("chalk");
const pkg = require("./package.json");
const log = console.log;
const core = require("./utils/").core;
const files = require("./utils").files;
const packages = require("./utils").packages;
const snapshots = require('./utils').snapshots;
const display = require('./utils').display;

// grafi cli
program
  .version(pkg["version"], "-v, --version")
  .option("-a, --analysis", "show project analysis")
  .option("-l, --list [packagesType]", "show project dependencies list")
  .option("--snapshot [name]", "take a snapshot of the current dependencies")
  .option("--snapshots [name]", "list all taken snapshots")
  .parse(process.argv);

// grafi with no args
(async () => {
  try {
    if (!process.argv.slice(2).length) {
      core.displayGrafiLogo(pkg);
      log(program.help());
    } else {
      const isNodeProject = await files.isFileExist("package.json");
      if (isNodeProject) {
        if (program.list) {
          switch (program.list) {
            case "dev":
              const devDependencies = await packages.getAll("devDependencies");
              await core.displayDevelopmentDependencies(devDependencies, "dev");
              break;
            case "prod":
              const dependencies = await packages.getAll("dependencies");
              await core.displayProductionDependencies(dependencies, "prod");
              break;
            default:
              const deps = await packages.getAll();
              await core.displayProductionAndDevelopmentDependencies(deps);
              break;
          }
        } else if (program.show) {
          await core.displayAnalysis(program.show);
        } else if (program.analysis) {
          await core.displayAnalysis();
        } else if (program.snapshot) {
          await snapshots.takeSnapshot(program.snapshot);
        } else if (program.snapshots) {
          await snapshots.displaySnapshots(program.snapshots)
        }
      } else {
        display.message('error', "make sure, you run command on node project!");
      }
    }
  } catch (ex) {
    core.displayErrorMessage();
  }
})();