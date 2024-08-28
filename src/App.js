import React from 'react';
import './App.css';
import GraphistryComponent from './components/Graphistry.js';
import Header from './components/Header.js';

function App() {
  return (
    <div className="App">
      <Header />

      <main>
        <GraphistryComponent />
      </main>
    </div>
  );
}

export default App;