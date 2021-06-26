const path = require("path");
const npm=require('npm')
const fs=require('fs-extra')
const YARNRC = path.join(process.env.HOME, ".yarnrc");
const Logger=require('../utils/logger')
let logger=new Logger()
let taobaoRegistry=`"https://registry.npm.taobao.org"`

module.exports = {
  setOptions: function () {},
  run: async function (argv) {
    fs.writeFile(
      YARNRC,
      `registry ${taobaoRegistry}`,
      function (err) {
        if (err) throw err;
        // console.log('It\'s saved!');

        logger.info(
          `yarn 镜像设置为: ${taobaoRegistry}`
        );
      }
    );
//同时设置npm源
//     npm.load(function (err) {
//       if (err) return exit(err);
//
//       npm.commands.config(["set", "registry", taobaoRegistry], function (
//           err,
//           data
//       ) {
//         if (err) return exit(err);
//         console.log("------------------------> ");
//         var newR = npm.config.get("registry");
//         logger.info(   `npm 镜像设置为: ${ taobaoRegistry} `);
//       });
//     });
  },
  desc: "设置为淘宝镜像",
};
