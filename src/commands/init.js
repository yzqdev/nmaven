const { resolve } = require("path");
let template = resolve(__dirname, "../template/");
const inquirer = require("inquirer");
let currentDir = process.cwd();
const spawn = require("child_process").spawn;
const Logger = require("../utils/logger");
const FileActions = require("../libs/fileAction");
const parseArgs = require("../libs/parseArgs");
const commandExists = require("command-exists");
const kleur = require("kleur");
const execa = require("execa");
const path = require("path");
const readline = require("readline-sync");
const fs = require("fs-extra");
const { askForPackageJson } = require("../utils/index");
const outDir = path.join(process.cwd());
const argv = parseArgs(process.argv.slice(2));
let pkg = {};
let pkgName = "";
let logger = new Logger();
/**
 * Prompt user for input to populate template files
 */
let npmName = argv.get("name");
let ownerName = argv.get("owner");
const OWNER_NAME = "FEMessage";

const fileActions = new FileActions({
  argv,
  pkg,
  ownerName,
  outDir,
  templatesDir: path.join(__dirname, "../template"),
});

function installYarn() {
  try {
    execa.sync("npm i -g yarn").stdout.pipe(process.stdout);
  } catch (e) {
    console.log(kleur.red("未知错误,请重试"));
    process.exit(0);
  }
}
function executeYarn() {
  execa("yarn").stdout.pipe(process.stdout);
}
function checkPackageJsonAndInstall(dir) {
  let packageJson = "package.json";
  fs.exists(packageJson, function (exists) {
    if (exists) {
      setTimeout(() => {
        logger.info("设置yarn镜像为淘宝镜像");
        execa("nm taobao").stdout.pipe(process.stdout);
      }, 1000);

      setTimeout(() => {
        logger.info("执行yarn");
        execa("yarn").stdout.pipe(process.stdout);
      }, 2000);
    }
    if (!exists) {
      console.log(kleur.red(`${packageJson}文件不存在,无法执行!`));
      askForPackageJson(executeYarn);
    }
  });
}

module.exports = {
  setOptions: function (yargs) {},
  run: async function (argv) {
    fileActions.create();

    fileActions.move({
      patterns: {
        gitignore: ".gitignore",
      },
    });

    logger.success(`生成到 ${kleur.underline(outDir)}`);

    let upgradeMessage = "请直接执行 yarn 来添加依赖!";
    const upgradeBox = require("boxen")(upgradeMessage, {
      align: "center",
      borderColor: "green",
      dimBorder: true,
      padding: 1,
    });

    let title = `\n${upgradeBox}\n`;
    console.log(title);

    inquirer
      .prompt([
        {
          type: "list",
          message: "是否直接执行yarn:",
          name: "yarn",
          default: "yes",
          choices: ["yes", "no"],
          filter: function (val) {
            return val;
          },
        },
      ])
      .then((answers) => {
        if (answers.yarn === "yes") {
          console.log(kleur.red("正在检测是否有安装了yarn"));
          commandExists("yarn", function (err, commandExists) {
            if (commandExists) {
              console.log("已经安装了yarn,直接执行!");
              checkPackageJsonAndInstall(outDir);
              // execa.sync("yarn").stdout.pipe(process.stdout);
            } else {
              console.log(kleur.green("没有检测到yarn,正在安装"));
              console.log(kleur.magenta("执行"), kleur.red("npm i -g yarn"));
              installYarn();
              checkPackageJsonAndInstall(outDir);
            }
          });
        } else {
          console.log(
            kleur.red("再见,不过你可以下次再执行"),
            kleur.green("yarn"),
            kleur.red("命令")
          );
        }
        // Use user feedback for... whatever!!
      })
      .catch((error) => {
        if (error.isTtyError) {
          console.log("别玩了"); // Prompt couldn't be rendered in the current environment
        } else {
          // Something else when wrong
        }
      });
  },
  desc: "初始化yarn,升级为yarn2",
};
