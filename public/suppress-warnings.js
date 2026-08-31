(function() {
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = function(...args) {
    const msg = args.join(' ');
    if (
      msg.includes('#441') ||
      msg.includes('startTime') ||
      msg.includes('hydrat') ||
      msg.includes('Hydrat') ||
      msg.includes('web-vitals') ||
      msg.includes('reportAllChanges') ||
      msg.includes('preloaded') ||
      msg.includes('preload')
    ) return;
    originalError.apply(console, args);
  };
  
  console.warn = function(...args) {
    const msg = args.join(' ');
    if (
      msg.includes('hydrat') ||
      msg.includes('Hydrat') ||
      msg.includes('startTime') ||
      msg.includes('web-vitals') ||
      msg.includes('preloaded') ||
      msg.includes('preload')
    ) return;
    originalWarn.apply(console, args);
  };
  
  window.addEventListener('unhandledrejection', function(e) {
    const r = (e.reason && e.reason.message) || String(e.reason || '');
    if (
      r.includes('startTime') ||
      r.includes('hydrat') ||
      r.includes('#441') ||
      r.includes('web-vitals')
    ) {
      e.preventDefault();
    }
  });
})();