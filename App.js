import React, { useState } from 'react';
import './App.css';
import Hero from './Hero';
import ControlPanel from './ControlPanel';

function App() {
  // State for all physics parameters
  const [settings, setSettings] = useState({
    force: 500,
    mass: 10,
    angle: 45,
    gravity: 9.8
  });

  // State to trigger the fire event in Hero component
  const [fireSignal, setFireSignal] = useState(null);

  const handleFire = () => {
    // Update timestamp to force re-render/trigger useEffect in Hero
    setFireSignal(Date.now());
  };

  return (
    <div className="app-container">
      <h1>Projectile Physics Simulator</h1>
      
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
