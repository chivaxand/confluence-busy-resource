import React from 'react';
import ReactDOM from 'react-dom';
import { useEffect, useState } from 'react';
import { invoke } from '@forge/bridge';

console.log("App started");

function App() {
  return (
    <div></div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

window.app = window.app || {};
window.app.invoke = invoke;
