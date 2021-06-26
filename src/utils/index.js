const Logger = require("./logger");
const inquirer = require("inquirer");
const kleur = require("kleur");
const execa = require("execa");
const path = require("path");
const parseArgs = require("../libs/parseArgs");
const fs = require("fs-extra");
const outDir = path.join(process.cwd());
const argv = parseArgs(process.argv.slice(2));
let pkg = {};
const ncu = require("npm-check-updates");
let pkgName = "";
let logger = new Logger();
/**
 * Prompt user for input to populate template files
 */
let npmName = argv.get("name");
let ownerName = argv.get("owner");
const OWNER_NAME = "FEMessage";
const FileActions = require("../libs/fileAction");
const fileActions = new FileActions({
  argv,
  pkg,
  ownerName,
  outDir,
  templatesDir: path.join(__dirname, "../packageJson"),
});
function parseContent(content, { componentName, ownerName }) {
  return content
    .replace(createRegExp("componentNamePascal"), pascaliFy(componentName))
    .replace(createRegExp("componentName"), kebabcasify(componentName))
    .replace(createRegExp("ownerName"), ownerName)
    .replace(createRegExp("ownerNameLowerCase"), ownerName.toLowerCase())
    .replace(createRegExp("cliVersion"), require("../package.json").version)
    .replace(createRegExp("licenseYear"), new Date().getFullYear());
}

function kebabcasify(content) {
  return content
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function pascaliFy(content) {
  const camelized = content.replace(/-([a-z])/g, (c) => c[1].toUpperCase());
  return camelized.charAt(0).toUpperCase() + camelized.slice(1);
}
function camelCase(content) {
  return content.replace(/-([a-z])/g, (c) => c[1].toUpperCase());
}
function createRegExp(str) {
  return new RegExp(`{{\\s?${str}\\s?}}`, "g");
}

function checkPackageJsonExist() {
  let packageJson = "package.json";
  return !!fs.existsSync(packageJson);
}

function createPackageJson() {
  fileActions.createPackageJson();
}
function installNcu() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "是否安装 npm-check-updates 包?",
        name: "ncu",
        choices: ["yes", "no"],
        default: "yes",
      },
    ])
    .then((answer) => {
      if (answer.ncu === "yes") {
        try {
          logger.info("请执行 ncu 命令更新依赖!");
        } catch (e) {
          console.log("未知错误!");
        }
      } else {
        execa.sync("npm i -g npm-check-updates").stdout.pipe(process.stdout);
        execa("ncu").stdout.pipe(process.stdout);
      }
    });
}
function askForPackageJson(fn) {
  let packageJson = "package.json";
  inquirer
    .prompt([
      {
        type: "list",
        message: `是否创建示例${packageJson}:`,
        filter: function (val) {
          return val;
        },
        name: "package",
        default: "yes",

        choices: ["yes", "no"],
      },
    ])
    .then((answer) => {
      if (answer.package === "yes") {
        createPackageJson();
        fn();
      } else {
        console.log(kleur.red(`请自行创建${packageJson}`));
      }
    })
    .catch((error) => {
      logger.error(error);
    });
}
function runNcu(opts = {}) {
  ncu.run(opts).then((upgraded) => {
    console.log("需要升级的依赖:", upgraded);
    logger.info("请执行 yarn或者yarn install 进行升级");
  });
  // execa
  //   .command("ncu1 --packageFile package.json")
  //   .stdout.pipe(process.stdout);
  // execa.command("ncu1 -u").stdout.pipe(process.stdout);
}
module.exports = {
  pascaliFy,
  createRegExp,
  camelCase,
  kebabcasify,
  logger,
  checkPackageJsonExist,
  askForPackageJson,
  createPackageJson,
  installNcu,
  runNcu,
  parseContent,
};
