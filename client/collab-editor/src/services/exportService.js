const exportAsText = (title, quill) => {
  if (!quill) return;
  const text = quill.getText();
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, `${sanitizeFilename(title)}.txt`);
};
const exportAsHTML = (title, quill) => {
  if (!quill) return;
  const html = quill.root.innerHTML;
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 800px;
      margin: 60px auto;
      padding: 0 24px;
      line-height: 1.8;
      color: #1a1a1a;
      font-size: 16px;
    }
    h1 { font-size: 2em; margin-bottom: 0.5em; }
    h2 { font-size: 1.5em; margin-bottom: 0.4em; }
    h3 { font-size: 1.25em; }
    blockquote {
      border-left: 4px solid #4F46E5;
      margin: 0;
      padding-left: 16px;
      color: #6B7280;
      font-style: italic;
    }
    pre {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
    }
    ul, ol { padding-left: 24px; }
    a { color: #4F46E5; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${html}
</body>
</html>`;
  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  downloadBlob(blob, `${sanitizeFilename(title)}.html`);
};
const exportAsMarkdown = (title, quill) => {
  if (!quill) return;
  const delta = quill.getContents();
  const markdown = deltaToMarkdown(delta, title);
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  downloadBlob(blob, `${sanitizeFilename(title)}.md`);
};
const exportAsJSON = (title, quill) => {
  if (!quill) return;
  const data = {
    title,
    content: quill.getContents(),
    exportedAt: new Date().toISOString(),
    format: 'quill-delta-v1',
  };
  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: 'application/json' }
  );
  downloadBlob(blob, `${sanitizeFilename(title)}.json`);
};
function deltaToMarkdown(delta, title) {
  let markdown = `# ${title}\n\n`;
  let currentLine = '';
  const ops = delta.ops || [];
  ops.forEach((op, index) => {
    if (typeof op.insert === 'string') {
      const text = op.insert;
      const attrs = op.attributes || {};
      let formatted = text;
      if (text !== '\n') {
        if (attrs.bold && attrs.italic) formatted = `***${text}***`;
        else if (attrs.bold) formatted = `**${text}**`;
        else if (attrs.italic) formatted = `*${text}*`;
        else if (attrs.underline) formatted = `<u>${text}</u>`;
        else if (attrs.strike) formatted = `~~${text}~~`;
        else if (attrs.code) formatted = `\`${text}\``;
        else if (attrs.link) formatted = `[${text}](${attrs.link})`;
      }
      if (text.includes('\n')) {
        const lines = formatted.split('\n');
        lines.forEach((line, lineIndex) => {
          if (lineIndex === 0) {
            currentLine += line;
          } else {
            const blockAttrs = op.attributes || {};
            let lineOutput = currentLine;
            if (blockAttrs.header === 1) lineOutput = `# ${currentLine}`;
            else if (blockAttrs.header === 2) lineOutput = `## ${currentLine}`;
            else if (blockAttrs.header === 3) lineOutput = `### ${currentLine}`;
            else if (blockAttrs.list === 'ordered') lineOutput = `1. ${currentLine}`;
            else if (blockAttrs.list === 'bullet') lineOutput = `- ${currentLine}`;
            else if (blockAttrs.blockquote) lineOutput = `> ${currentLine}`;
            else if (blockAttrs['code-block']) lineOutput = `\`\`\`\n${currentLine}\n\`\`\``;
            markdown += lineOutput + '\n';
            currentLine = line;
          }
        });
      } else {
        currentLine += formatted;
      }
    }
  });
  if (currentLine) {
    markdown += currentLine + '\n';
  }
  return markdown;
}
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function sanitizeFilename(name) {
  return name
    .replace(/[^a-zA-Z0-9\s-_]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 100);
}
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
const exportService = {
  exportAsText,
  exportAsHTML,
  exportAsMarkdown,
  exportAsJSON,
};
export default exportService;