const Logger = require("../utils/logger");
const glob = require("glob");
const path = require("path");
const fs = require("fs-extra");
let logger = new Logger();
module.exports = class FileActions {
  constructor(opts = {}) {
    this.opts = Object.assign({}, opts);
    // console.log(__dirname);
    this.templates = glob.sync(path.join(this.opts.templatesDir, "**"), {
      nodir: true,
      dot: true,
    });
  }
checkPackagejson(){console.log(this)
}
  create() {
    this.templates.forEach((filepath) => {
      const fileName = path.relative(this.opts.templatesDir, filepath);
      const target = path.join(this.opts.outDir, fileName);
      const content = fs.readFileSync(filepath, "utf8");
      fs.outputFileSync(target, content);

      logger.fileAction(
        "magenta",
        "已写入",
        path.relative(process.cwd(), target)
      );
    });
  }
  createPackageJson() {
    fs.exists("_package", (err, exists) => {
      const from = path.relative(this.opts.templatesDir, "_package");
      const to = path.join(this.opts.outDir, "package.json");
      if (exists) {
        fs.moveSync("_package", to, {
          overwrite: true,
        });
        logger.info("创建成功!");
      } else {
        try {
          fs.moveSync(from, to, {
            overwrite: true,
          });
          logger.info("创建成功!");
        } catch (e) {
         logger.info("成功")
        }
      }
    });
    this.templates.forEach((filepath) => {
      const fileName = path.relative(this.opts.templatesDir, filepath);
      const target = path.join(this.opts.outDir, fileName);
      const content = fs.readFileSync(filepath, "utf8");
      if (fileName === "_package") {
        fs.outputFileSync(target, content);
        fs.moveSync("_package", "package.json", {
          overwrite: true,
        });
      }

      logger.fileAction(
        "magenta",
        "已写入",
        path.relative(process.cwd(), target)
      );
    });
  }
  move(
    opts = {
      patterns: {},
    }
  ) {
    Object.keys(opts.patterns).forEach((pattern, index) => {
      const files = glob.sync(pattern, {
        cwd: this.opts.outDir,
        absolute: true,
      });
      const from = files[index];
      console.log("frome  e  ", from);
      const to = path.join(this.opts.outDir, opts.patterns[pattern]).toString();
      try {
        fs.moveSync(from, to, {
          overwrite: true,
        });
      } catch (e) {
        console.log("success");
      }
      logger.fileMoveAction(from, to);
    });
  }

  upgrade(extraFiles = []) {
    const filesFromCli = this.opts.argv.get("files") || "";
    const shouldUpdateFiles = require("../config/update-files");

    const files = shouldUpdateFiles.concat(extraFiles, filesFromCli.split(","));

    const upgradeFiles = glob.sync(`*(${files.join("|")})`, {
      cwd: this.opts.templatesDir,
      nodir: true,
      dot: true,
      absolute: true,
    });

    upgradeFiles.forEach((filepath) => {
      const fileName = path.relative(this.opts.templatesDir, filepath);
      const target = path.join(process.cwd(), fileName);
      const content = parseContent(
        fs.readFileSync(filepath, "utf8"),
        this.opts
      );

      fs.outputFileSync(target, content);

      logger.fileAction(
        "yellow",
        "Upgraded",
        path.relative(process.cwd(), target)
      );
    });

    upgradePackageJson(Object.assign(this.opts, {}));
  }
};

function upgradePackageJson({
  pkg,
  source,
  componentName,
  ownerName,
  includePkg,
}) {
  const properties = ["scripts", "devDependencies", "husky", "lint-staged"];
  const cliVersion = require("../package.json").version;

  const templatePkg = JSON.parse(
    parseContent(source, { componentName, ownerName })
  );
  const currentPkg = pkg;

  if (currentPkg["vue-sfc-cli"]) {
    currentPkg["vue-sfc-cli"] = cliVersion;
  }

  if (includePkg) {
    properties.forEach((key) => {
      currentPkg[key] = Object.assign(pkg[key] || {}, templatePkg[key]);
    });
  }

  fs.outputJSONSync(path.join(process.cwd(), "package.json"), currentPkg, {
    spaces: 2,
  });

  logger.fileAction("yellow", "Upgraded", "package.json");
}
