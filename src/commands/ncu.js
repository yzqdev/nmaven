const fs = require("fs-extra");
const kleur = require("kleur");
const commandExists = require("command-exists");
const {
  installNcu,
  askForPackageJson,
  checkPackageJsonExist,
  createPackageJson,
  runNcu,
} = require("../utils/index");
let dir = process.cwd();
const inquirer = require("inquirer");
const Logger = require("../utils/logger");
let logger = new Logger();
const execa = require("execa");
const ncu1 = require("npm-check-updates");

function checkNcu() {
  commandExists("ncu", (err, exists) => {
    if (exists) {
      inquirer
        .prompt([
          {
            type: "list",
            message: "是否进入交互式升级界面?",
            name: "inter",
            default: "yes",
            choices: ["yes", "no"],
          },
        ])
        .then((answer) => {
          let ncuOpts = {
            jsonAll: false,
            interactive: true,
            jsonUpgraded: true,
            packageManager: "npm",
            silent: false,
            upgrade:true
          };
          if (answer.inter == "yes") {
            runNcu(ncuOpts);
          } else {
            ncuOpts.interactive = false;
            runNcu(ncuOpts);
          }
        });
    } else {
      console.log(kleur.bgCyan("没有找到ncu"));
      installNcu();
    }
  });
}
module.exports = {
  setOptions: function () {},
  run: async function (argv) {
    let fileExist =checkPackageJsonExist();
    if (fileExist) {
      checkNcu();
    } else {
      logger.error(`没有找到package.json文件!`);
      askForPackageJson(checkNcu);
    }
  },
  desc: "更新package.json",
};
