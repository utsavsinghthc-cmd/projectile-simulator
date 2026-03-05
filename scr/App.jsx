import React, { useState } from 'react';
import Hero from './Hero';
import ControlPanel from './ControlPanel';

function App() {
  const [settings, setSettings] = useState({
    force: 500,
    mass: 10,
    angle: 45,
    gravity: 9.8
  });

  const [fireSignal, setFireSignal] = useState(null);

  const handleFire = () => {
    setFireSignal(Date.now());
  };

  return (
    <div className="app-container">
      <header>
        <h1>Projectile Physics Lab</h1>
      </header>
      
      <div className="main-content">
        <ControlPanel 
          settings={settings} 
          setSettings={setSettings} 
          onFire={handleFire} 
        />
        
        <Hero 
          settings={settings} 
          triggerFire={fireSignal} 
        />
      </div>
    </div>
  );
}

export default App;
