const fs = require('fs');
const path = require('path');

const DIRECTORY = path.join(__dirname, '..', 'sample_artifacts', 'scenarios');

const REPLACEMENTS = [
  // Specific Product & Org names
  { search: /PayNet Transact/g, replace: 'ApexTransact' },
  { search: /PayNet/g, replace: 'ApexNet' },
  { search: /RENTAS/g, replace: 'ApexRTGS' },
  { search: /DuitNow/g, replace: 'DuitInstant' },
  { search: /FPX/g, replace: 'DirectPay' },
  { search: /eSPICK/g, replace: 'ChequeClear' },
  { search: /JomPAY/g, replace: 'BillPay' },
  { search: /NETS EFTPOS/g, replace: 'LionEFTPOS' },
  { search: /eNETS/g, replace: 'eLionPay' },
  { search: /NETS FAST/g, replace: 'LionFAST' },
  { search: /PayNow/g, replace: 'PayProxy' },
  { search: /NETS FlashPay/g, replace: 'TransitPay' },
  { search: /FlashPay/g, replace: 'TransitPay' },
  { search: /NETS/g, replace: 'LionNet' },
  { search: /SACH/g, replace: 'LionACH' },
  
  // Specific Singapore/Malaysia regional organization naming
  { search: /Electronic Road Pricing \(ERP\)/g, replace: 'Electronic Toll Pricing (ETP)' },
  { search: /ERP/g, replace: 'ETP' },
  { search: /Land Transport Authority \(LTA\)/g, replace: 'Transit Transport Authority (TTA)' },
  { search: /LTA/g, replace: 'TTA' }
];

function walk(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.md') || file.endsWith('.json')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      REPLACEMENTS.forEach(({ search, replace }) => {
        if (search.test(content)) {
          content = content.replace(search, replace);
          modified = true;
        }
      });
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`[+] Anonymized: ${path.relative(DIRECTORY, fullPath)}`);
      }
    }
  });
}

console.log('Starting anonymization across scenarios...');
walk(DIRECTORY);
console.log('Anonymization complete!');
