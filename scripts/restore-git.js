const fs = require('fs-extra');
const path = require('path');

const gitPath = path.resolve(__dirname, '../../sachininmindfire.github.io/dist/.git');
const backupPath = path.resolve(__dirname, '../.git-backup');

// Restore .git if backup exists
if (fs.existsSync(backupPath)) {
    fs.copySync(backupPath, gitPath);
    fs.removeSync(backupPath);
    console.log('.git folder restored successfully');
} else {
    console.log('No .git backup found');
}