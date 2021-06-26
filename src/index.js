const fs = require("fs-extra");
const path = require("path");
const yargs = require("yargs");
const utils = require("./utils");
const commandsDir = path.resolve(__dirname, "commands");
var commands = [];
var commandsFile = fs.readdirSync(commandsDir);
commandsFile.forEach((file) => {
  if (path.extname(file) !== ".js") return null;
  let commandModule = require(path.resolve(commandsDir, file));
  if (!commandModule) {
    throw new Error("找不到 module 在 " + file + "文件");
  }
  let commandName = path.basename(file, ".js");
  yargs.command(
    commandName,
    commandModule.desc,
    commandModule.setOptions,
    commandModule.run
  );
});

try {
  // yargs.argv;
  if (yargs.argv._.length === 0 && !process.argv[2]) {
  }
} catch (e) {
  console.error(e);
}
