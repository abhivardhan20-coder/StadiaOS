const fs = require('fs');
let code = fs.readFileSync('src/components/dashboard/OverviewMap.tsx', 'utf8');

code = code.replace(
  '<span className="font-semibold text-slate-700 dark:text-slate-300">Current {LAYERS.find(l => l.id === activeLayer)?.label}</span>',
  '<span className="font-semibold text-slate-700 dark:text-slate-300">Current {LAYERS.find(l => l.id === activeLayer)?.label}</span>\n<span className="text-xs uppercase px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 font-bold ml-2">{selectedZoneData?.status}</span>'
);

fs.writeFileSync('src/components/dashboard/OverviewMap.tsx', code);
