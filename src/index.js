import React from 'react';
import ReactDOM from 'react-dom/client';
import TicTacToe from './TicTacToe';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <TicTacToe />
  </React.StrictMode>
);
