import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost:5173/',
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, val) { this.store[key] = String(val); },
  removeItem(key) { delete this.store[key]; },
  clear() { this.store = {}; }
};

// matchMedia mock
global.window.matchMedia = () => ({
  matches: false,
  addEventListener: () => {},
  removeEventListener: () => {},
});

console.log('[TEST] Initializing React rendering test in JSDOM...');

try {
  const React = await import('react');
  const ReactDOMServer = await import('react-dom/server');
  const { App } = await import('./src/App.jsx');

  const html = ReactDOMServer.renderToString(React.createElement(App));
  console.log('[PASS] App rendered successfully to HTML string!');
  console.log('[OUTPUT PREVIEW]:', html.slice(0, 300));
} catch (err) {
  console.error('[ERROR IN RENDER]:', err);
}
