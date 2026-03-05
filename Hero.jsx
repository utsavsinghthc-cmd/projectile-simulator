import React, { useRef, useEffect, useState } from 'react';

const Hero = ({ settings, triggerFire }) => {
  const canvasRef = useRef(null);
  
  // Animation State
  const [proj, setProj] = useState({ x: 0, y: 0, vx: 0, vy: 0, active: false });
  const [cannonState, setCannonState] = useState({ recoil: 0, smoke: [] });
  
  // Refs to hold state inside the animation loop
  const projRef = useRef(proj);
  const trailRef = useRef([]);
  const requestRef = useRef();
  
  // Constants
  const SCALE = 6; // Pixels per meter
  const GROUND_Y = 450; // Canvas pixel coordinate

  // --- Physics Logic ---
  useEffect(() => {
    if (triggerFire === null) return;

    // Calculate Initial Velocity based on Force and Mass (v = sqrt(2*F*d/m) simplified to F/m logic for sim)
    // F = ma -> a = F/m. v = a * t (arbitrary time factor for launch)
    // We'll use a simplified impulse formula: V0 = (Force / Mass) * Factor
    const v0 = (settings.force / settings.mass) * 2.5; 
    
    const angleRad = (settings.angle * Math.PI) / 180;
    
    const newProj = {
      x: 0,
      y: 0,
      vx: v0 * Math.cos(angleRad),
      vy: v0 * Math.sin(angleRad),
      active: true
    };

    setProj(newProj);
    projRef.current = newProj;
    trailRef.current = [];

    // Cannon Animation Effect
    setCannonState({ recoil: 15, smoke: [1, 2, 3] }); // Trigger recoil and smoke
    
    // Reset recoil after short time
    setTimeout(() => setCannonState(prev => ({ ...prev, recoil: 0 })), 100);

  }, [triggerFire, settings]);

  // --- Main Render Loop ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const draw = () => {
      const proj = projRef.current;
      
      // 1. Clear Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 2. Draw Sky & Ground
      // Sky
      let skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, '#2c3e50');
      skyGrad.addColorStop(1, '#4ca1af');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Ground
      ctx.fillStyle = '#27ae60';
      ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);
      ctx.fillStyle = '#2ecc71';
      ctx.fillRect(0, GROUND_Y, canvas.width, 5);

      // 3. Draw Boy (Reference)
      drawBoy(ctx, 20, GROUND_Y);

      // 4. Draw Cannon
      drawCannon(ctx, 50, GROUND_Y, settings.angle, cannonState.recoil, cannonState.smoke);

      // 5. Physics Update
      if (proj.active) {
        // Gravity
        proj.vy -= settings.gravity * 0.05; // 0.05 is time scale
        
        // Update Position
        proj.x += proj.vx * 0.05;
        proj.y += proj.vy * 0.05;

        // Collision
        if (proj.y < 0) {
          proj.y = 0;
          proj.active = false;
        }

        // Add Trail
        trailRef.current.push({ x: proj.x, y: proj.y });
        if (trailRef.current.length > 60) trailRef.current.shift();
      }

      // 6. Draw Trail
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(231, 76, 60, 0.5)';
      ctx.lineWidth = 3;
      trailRef.current.forEach((p, i) => {
        const px = 50 + p.x * SCALE;
        const py = GROUND_Y - p.y * SCALE;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();

      // 7. Draw Projectile
      if (proj.x > 0 || proj.active) {
        const px = 50 + proj.x * SCALE;
        const py = GROUND_Y - proj.y * SCALE;
        
        // Ball
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#e74c3c';
        ctx.fill();
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Stats HUD
      ctx.fillStyle = 'white';
      ctx.font = "14px Courier New";
      ctx.fillText(`Dist: ${proj.x.toFixed(1)}m`, 60, 30);
      ctx.fillText(`Height: ${proj.y.toFixed(1)}m`, 60, 50);
      ctx.fillText(`Speed: ${Math.sqrt(proj.vx**2 + proj.vy**2).toFixed(1)} m/s`, 60, 70);

      requestRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(requestRef.current);
  }, [settings, cannonState]);

  // --- Drawing Helper: Cannon ---
  const drawCannon = (ctx, x, y, angle, recoil, smoke) => {
    const angleRad = (angle * Math.PI) / 180;
    
    ctx.save();
    ctx.translate(x, y);

    // Wheels
    ctx.fillStyle = '#34495e';
    ctx.beginPath();
    ctx.arc(-10, -10, 15, 0, Math.PI * 2); // Left Wheel
    ctx.arc(10, -10, 15, 0, Math.PI * 2);  // Right Wheel
    ctx.fill();

    // Barrel
    ctx.rotate(-angleRad); // Rotate barrel
    
    // Recoil Animation (Move barrel back slightly)
    ctx.translate(recoil, 0); 

    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(0, -10, 60, 20);
    
    // Detail lines on barrel
    ctx.strokeStyle = '#95a5a6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, -10); ctx.lineTo(10, 10);
    ctx.moveTo(30, -10); ctx.lineTo(30, 10);
    ctx.stroke();

    // Muzzle
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(55, -12, 10, 24);

    ctx.restore();

    // Smoke Animation
    if (smoke.length > 0) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-angleRad);
      smoke.forEach((s, i) => {
        ctx.beginPath();
        const size = 10 + s * 5;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.8 - s*0.2})`;
        ctx.arc(60 + s * 10 + recoil, 0, size, 0, Math.PI*2);
        ctx.fill();
      });
      ctx.restore();
      
      // Animate smoke expansion
      setTimeout(() => {
        setCannonState(prev => {
            const newSmoke = prev.smoke.map(s => s + 1).filter(s => s < 5);
            return { ...prev, smoke: newSmoke };
        });
      }, 50);
    }
  };

  // --- Drawing Helper: Boy ---
  const drawBoy = (ctx, x, y) => {
    ctx.save();
    ctx.translate(x, y);
    
    // Simple Stick Figure "Boy" for scale reference
    
    // Body
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    
    // Head
    ctx.beginPath();
    ctx.arc(0, -40, 8, 0, Math.PI * 2); 
    ctx.stroke();
    
    // Torso
    ctx.beginPath();
    ctx.moveTo(0, -32);
    ctx.lineTo(0, -15);
    ctx.stroke();

    // Arms (looking up/at cannon)
    ctx.beginPath();
    ctx.moveTo(0, -28);
    ctx.lineTo(-10, -20);
    ctx.moveTo(0, -28);
    ctx.lineTo(10, -20);
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.lineTo(-8, 0);
    ctx.moveTo(0, -15);
    ctx.lineTo(8, 0);
    ctx.stroke();

    ctx.restore();
  };

  return (
    <div className="canvas-wrapper">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={500} 
      />
    </div>
  );
};

export default Hero;
