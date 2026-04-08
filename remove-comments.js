const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (f !== 'node_modules' && f !== '.git' && f !== '.next' && f !== 'dist' && f !== 'build') {
        walk(p);
      }
    } else if (p.endsWith('.js') || p.endsWith('.jsx')) {
      const code = fs.readFileSync(p, 'utf8');
      
      // Match block comments /* ... */ and inline comments // ...
      // Uses a trick to ignore // inside strings:
      // This simple regex usually works for standard projects without complex url strings.
      // (?<!:) ignores http://
      const newCode = code
        .replace(/\/\*[\s\S]*?\*\//g, '') 
        .replace(/(?<![:"'])\/\/.*?$/gm, '') 
        .replace(/^\s*\/\/.*$/gm, '') // Also remove any full-line comments that might start directly
        .replace(/^\s*[\r\n]/gm, ''); // removing empty lines created

      if (code !== newCode) {
        fs.writeFileSync(p, newCode);
        console.log('Stripped comments from:', p);
      }
    }
  });
}

walk('.');
console.log('Done removing comments!');
