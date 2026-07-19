const fs = require('fs');
let code = fs.readFileSync('src/components/dashboard/OpsCopilot.tsx', 'utf8');

code = code.replace(
  'onClick={() => {\n                  setInput(\'\');\n                  handleSend(suggestion);\n                }}',
  `role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setInput('');
                    handleSend(suggestion);
                  }
                }}
                onClick={() => {
                  setInput('');
                  handleSend(suggestion);
                }}`
);

// Add aria-live to chat messages
code = code.replace(
  '<div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar relative z-10">',
  '<div role="log" aria-live="polite" aria-relevant="additions" className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar relative z-10">'
);

fs.writeFileSync('src/components/dashboard/OpsCopilot.tsx', code);
