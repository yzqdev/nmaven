const package = require("../package.json");
const fs = require("fs-extra");
const chalk = require("chalk");
function getVersion() {
  return package.version;
}

/**
 * copy file
 *
 * @param  {String} from copied file
 * @param  {String} to   target file
 */
function copyFile(from, to) {
  fs.writeFileSync(to, fs.readFileSync(from));
  // console.log(success(from, to));
}

/**
 * copy directory
 *
 * @param  {String} from
 * @param  {String} to
 */
function copyDir(from, to) {
  console.log(chalk.magenta(`🏇 copy ${from}  to ${to}`));
  try {
    isExist(to).then((r) => {
      fs.copy(from, to)
        .then(() => console.log("success!"))
        .catch((err) => console.error(err));
    });
  } catch (err) {
    fs.mkdirSync(to);
  }
}

/**
 * is exists
 *
 * @param  {String} file
 * @return {Promise}
 */
function isExist(path) {
  return new Promise((resolve, reject) => {
    fs.access(path, (err) => {
      if (err !== null) {
        reject(`${path} does not exist`);
      } else {
        resolve(true);
      }
    });
  });
}

/**
 * file or a folder
 *
 * @param  {String} path
 * @return {Promise}
 */
function pathType(path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err === null) {
        if (stats.isDirectory()) {
          resolve("dir"); // it's directory
        } else if (stats.isFile()) {
          resolve("file"); // it's file
        }
      } else {
        reject(error(path)); // files or directory don't exist
      }
    });
  });
}

module.exports = { getVersion, copyDir, copyFile, isExist, pathType };
