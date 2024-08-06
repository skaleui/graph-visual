import React from 'react';
import './App.css';
import GraphistryComponent from './components/Graphistry.js';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Graphistry with React</h1>
      </header>
      <main>
        <GraphistryComponent />
      </main>
    </div>
  );
}

export default App;