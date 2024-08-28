import React from 'react';
import '../App.css';

const Header = () => {

    return (
        <header className="bg-gray-800 text-white shadow-md">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Graphistry Visualization</h1>
        </div>
      </header>
    )
}

export default Header;