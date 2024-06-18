const fs = require("fs");
const path = require("path");

module.exports = (dir) => {
  const fullPath = path.resolve(process.cwd(), dir);
  const contractPath = path.resolve(__dirname, "../new-contract");
  const destPath = path.join(fullPath);

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
