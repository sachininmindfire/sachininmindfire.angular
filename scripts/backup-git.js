const fs = require('fs-extra');
const path = require('path');

const gitPath = path.resolve(__dirname, '../../sachininmindfire.github.io/dist/.git');
const backupPath = path.resolve(__dirname, '../.git-backup');

// Check if .git exists and backup
if (fs.existsSync(gitPath)) {
    fs.copySync(gitPath, backupPath);
    console.log('.git folder backed up successfully');
} else {
    console.log('No .git folder found in dist directory');
}