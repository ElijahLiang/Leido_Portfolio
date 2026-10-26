import React from 'react';
import ReactDOM from 'react-dom/client';
import ResearchApp from './research/ResearchApp';
import './styles/global.css';
import './App.css';

ReactDOM.createRoot(document.getElementById('research-root')).render(<React.StrictMode><ResearchApp /></React.StrictMode>);
