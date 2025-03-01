# Preserve .git Folder During Angular Build

## Problem
When running `npm run build`, the Angular build process cleans the dist directory, which also removes the `.git` folder. This is problematic as it breaks Git version control in the distribution directory.

## Solution
Create a custom build script that will:
1. Back up the .git folder before build
2. Execute the Angular build
3. Restore the .git folder after build

## Implementation Steps

1. Modify package.json to add a new build script:
```json
{
  "scripts": {
    "prebuild": "node scripts/backup-git.js",
    "build": "ng build",
    "postbuild": "node scripts/restore-git.js"
  }
}
```

2. Create a new directory for build scripts:
```
mkdir scripts
```

3. Create backup-git.js:
```javascript
const fs = require('fs-extra');
const path = require('path');

const gitPath = path.resolve(__dirname, '../../sachininmindfire.github.io/dist/.git');
const backupPath = path.resolve(__dirname, '../.git-backup');

// Check if .git exists and backup
if (fs.existsSync(gitPath)) {
  fs.copySync(gitPath, backupPath);
  console.log('.git folder backed up successfully');
}
```

4. Create restore-git.js:
```javascript
const fs = require('fs-extra');
const path = require('path');

const gitPath = path.resolve(__dirname, '../../sachininmindfire.github.io/dist/.git');
const backupPath = path.resolve(__dirname, '../.git-backup');

// Restore .git if backup exists
if (fs.existsSync(backupPath)) {
  fs.copySync(backupPath, gitPath);
  fs.removeSync(backupPath);
  console.log('.git folder restored successfully');
}
```

5. Install required dependency:
```bash
npm install fs-extra --save-dev
```

## Usage
After implementation, the regular `npm run build` command will automatically:
1. Back up the .git folder
2. Run the Angular build
3. Restore the .git folder

This ensures the Git repository remains intact while still allowing clean builds.