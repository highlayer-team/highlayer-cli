const fs = require("fs");
const path = require("path");

module.exports = (dir, options) => {
  const fullPath = path.resolve(process.cwd(), dir);
  const starter = options.template ? options.template : "bare";
  const templatesDir = path.resolve(__dirname, "../templates");
  const contractPath = path.resolve(templatesDir, starter);
  const destPath = path.join(fullPath);

  if (!fs.existsSync(contractPath)) {
    const templates = fs
      .readdirSync(templatesDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
    return console.log("❌ Ensure you used a valid template: ", templates);
  }

  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(destPath, { recursive: true });
  }

  copyRecursiveSync(contractPath, destPath);
};

const copyRecursiveSync = (src, dest) => {
  if (!fs.existsSync(src)) {
    console.error(`Source directory ${src} does not exist`);
    return;
  }

  const stats = fs.statSync(src);
  const isDirectory = stats.isDirectory();

  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
};
