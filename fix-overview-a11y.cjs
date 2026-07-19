const fs = require('fs');
let code = fs.readFileSync('src/components/dashboard/OverviewMap.tsx', 'utf8');

code = code.replace(
  '<g \n                      key={zone.id}\n                      onClick={() => setSelectedZone(zone.id)}',
  `<g 
                      key={zone.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedZone(zone.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedZone(zone.id);
                        }
                      }}`
);

fs.writeFileSync('src/components/dashboard/OverviewMap.tsx', code);
