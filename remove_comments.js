const fs = require('fs');
const path = require('path');

const filesToClean = [
  'server/routes/documents.js',
  'client/collab-editor/src/pages/EditorPage.jsx',
  'client/collab-editor/src/components/ShareModal.jsx',
  'client/collab-editor/src/components/DocumentCard.jsx'
];

filesToClean.forEach(relPath => {
  const fullPath = path.join(__dirname, relPath);
  if (!fs.existsSync(fullPath)) return;
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  
  const newLines = lines.filter(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || (trimmed.startsWith('{/*') && trimmed.endsWith('*/}'))) {
      return false; // remove this line
    }
    return true; // keep this line
  });
  
  fs.writeFileSync(fullPath, newLines.join('\n'), 'utf8');
  console.log(`Cleaned ${relPath}`);
});
