import React from 'react';

const ControlPanel = ({ settings, setSettings, onFire }) => {
  
  const handleChange = (e) => {
    const { id, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [id]: parseFloat(value)
    }));
  };

  return (
    <div className="control-panel">
      <h3 style={{width: '100%', textAlign: 'center', margin: '0 0 10px 0', color: '#fff', letterSpacing: '2px'}}>PARAMETERS</h3>

      <div className="control-group">
        <div className="label-row">
          <label>Force (N)</label>
          <span className="value-display">{settings.force}</span>
        </div>
        <input 
          type="range" 
          id="force" 
          min="100" 
          max="2000" 
          value={settings.force} 
          onChange={handleChange} 
        />
      </div>

      <div className="control-group">
        <div className="label-row">
          <label>Mass (kg)</label>
          <span className="value-display">{settings.mass}</span>
        </div>
        <input 
          type="range" 
          id="mass" 
          min="1" 
          max="50" 
          value={settings.mass} 
          onChange={handleChange} 
        />
      </div>

      <div className="control-group">
        <div className="label-row">
          <label>Angle (°)</label>
          <span className="value-display">{settings.angle}</span>
        </div>
        <input 
          type="range" 
          id="angle" 
          min="5" 
          max="85" 
          value={settings.angle} 
          onChange={handleChange} 
        />
      </div>

      <div className="control-group">
        <div className="label-row">
          <label>Gravity (m/s²)</label>
          <span className="value-display">{settings.gravity}</span>
        </div>
        <input 
          type="range" 
          id="gravity" 
          min="1" 
          max="20" 
          step="0.1"
          value={settings.gravity} 
          onChange={handleChange} 
        />
      </div>

      <button className="fire-btn" onClick={onFire}>
        🚀 Launch
      </button>
    </div>
  );
};

export default ControlPanel;
