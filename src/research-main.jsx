import React from 'react';
import ReactDOM from 'react-dom/client';
import ResearchApp from './research/ResearchApp';
import 'lxgw-wenkai-screen-webfont/lxgwwenkaigbscreen.css';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import './styles/global.css';
import './App.css';

ReactDOM.createRoot(document.getElementById('research-root')).render(<React.StrictMode><ResearchApp /></React.StrictMode>);
