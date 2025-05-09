import React from 'react';
import ReactDOM from 'react-dom';
import { useEffect, useState } from 'react';
import { invoke } from '@forge/bridge';
import ForgeReconciler from '@forge/react';
import Config from './config';

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

ForgeReconciler.addConfig(<Config />);

window.app = window.app || {};
window.app.invoke = invoke;

export default App;