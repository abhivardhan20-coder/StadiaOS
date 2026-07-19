const fs = require('fs');

let cpCode = fs.readFileSync('src/components/dashboard/CrowdPulse.tsx', 'utf8');
cpCode = cpCode.replace(
  '<CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar max-h-64">',
  '<CardContent role="log" aria-live="polite" className="p-0 flex-1 overflow-y-auto custom-scrollbar max-h-64">'
);
fs.writeFileSync('src/components/dashboard/CrowdPulse.tsx', cpCode);

let nhCode = fs.readFileSync('src/components/notifications/NotificationHub.tsx', 'utf8');
nhCode = nhCode.replace(
  '<div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">',
  '<div role="log" aria-live="polite" aria-relevant="additions text" className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">'
);
fs.writeFileSync('src/components/notifications/NotificationHub.tsx', nhCode);
