const fs = require('fs');

let opCode = fs.readFileSync('src/components/dashboard/OpsCopilot.tsx', 'utf8');
opCode = opCode.replace(
  '<Button \n              variant="outline"\n              type="button"\n              onClick={toggleListening}',
  '<Button \n              aria-label={isListening ? "Stop listening" : "Start listening"}\n              variant="outline"\n              type="button"\n              onClick={toggleListening}'
);
opCode = opCode.replace(
  '<Button \n              size="icon"\n              onClick={() => handleSend()}',
  '<Button \n              aria-label="Send message"\n              size="icon"\n              onClick={() => handleSend()}'
);
fs.writeFileSync('src/components/dashboard/OpsCopilot.tsx', opCode);

let wfCode = fs.readFileSync('src/components/dashboard/WayfinderAI.tsx', 'utf8');
wfCode = wfCode.replace(
  '<Button \n              variant="outline"\n              className={cn("h-12 w-12 rounded-xl border-slate-200/50 shadow-sm transition-all duration-300", isListening ? "bg-red-50 text-red-500 border-red-200 animate-pulse" : "bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:bg-slate-900/50 dark:border-slate-800 dark:hover:bg-slate-800")}\n              onClick={toggleListening}',
  '<Button \n              aria-label={isListening ? "Stop listening" : "Start listening"}\n              variant="outline"\n              className={cn("h-12 w-12 rounded-xl border-slate-200/50 shadow-sm transition-all duration-300", isListening ? "bg-red-50 text-red-500 border-red-200 animate-pulse" : "bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:bg-slate-900/50 dark:border-slate-800 dark:hover:bg-slate-800")}\n              onClick={toggleListening}'
);
fs.writeFileSync('src/components/dashboard/WayfinderAI.tsx', wfCode);

let headerCode = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');
headerCode = headerCode.replace(
  '<Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">',
  '<Button aria-label="Open menu" variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">'
);
headerCode = headerCode.replace(
  '<Button variant="ghost" size="icon" onClick={toggleTheme} className="text-slate-500">',
  '<Button aria-label="Toggle theme" variant="ghost" size="icon" onClick={toggleTheme} className="text-slate-500">'
);
headerCode = headerCode.replace(
  '<Button variant="ghost" size="icon" className="relative text-slate-500">',
  '<Button aria-label="Notifications" variant="ghost" size="icon" className="relative text-slate-500">'
);
fs.writeFileSync('src/components/layout/Header.tsx', headerCode);

