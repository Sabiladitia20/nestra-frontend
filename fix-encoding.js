const fs = require('fs');
const files = [
  'c:/Users/Sabil Aditia/OneDrive/Dokumen/Dashboard Mahi/nestra-web/src/app/wind-prediction/page.tsx',
  'c:/Users/Sabil Aditia/OneDrive/Dokumen/Dashboard Mahi/nestra-web/src/app/report-generator/page.tsx',
  'c:/Users/Sabil Aditia/OneDrive/Dokumen/Dashboard Mahi/nestra-web/src/app/data-analysis/page.tsx'
];
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/â€”/g, '—');
  content = content.replace(/â€¢/g, '•');
  content = content.replace(/Â°/g, '°');
  content = content.replace(/Ã—/g, '×');
  content = content.replace(/â€“/g, '–');
  fs.writeFileSync(f, content, 'utf8');
});
console.log('Fixed encoding issues');
