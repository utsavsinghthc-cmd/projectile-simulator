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
  const SCALE = 6; 
  const GROUND_Y = 450; 

  // --- Physics Logic ---
  useEffect(() => {
    if (triggerFire === null) return;

    // v = F / m (simplified impulse for simulation)
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

    // Trigger recoil and smoke animation
    setCannonState({ recoil: 20, smoke: [1, 2, 3] });
    
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

      // 2. Draw Background
      let skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, '#0f2027'); // Dark gradient
      skyGrad.addColorStop(0.5, '#203a43');
      skyGrad.addColorStop(1, '#2c5364');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid lines for aesthetics
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for(let i=0; i<canvas.width; i+=50) {
          ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      }
      for(let i=0; i<canvas.height; i+=50) {
          ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
      }

      // Ground
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);
      ctx.fillStyle = '#4caf50';
      ctx.fillRect(0, GROUND_Y, canvas.width, 3);

      // 3. Draw Boy (Reference)
      drawBoy(ctx, 20, GROUND_Y);

      // 4. Draw Cannon
      drawCannon(ctx, 50, GROUND_Y, settings.angle, cannonState.recoil, cannonState.smoke);

      // 5. Physics Update
      if (proj.active) {
        proj.vy -= settings.gravity * 0.05;
        proj.x += proj.vx * 0.05;
        proj.y += proj.vy * 0.05;

        if (proj.y < 0) {
          proj.y = 0;
          proj.active = false;
        }

        trailRef.current.push({ x: proj.x, y: proj.y });
        if (trailRef.current.length > 60) trailRef.current.shift();
      }

      // 6. Draw Trail (Glow Effect)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 71, 87, 0.5)';
      ctx.lineWidth = 4;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ff4757';
      trailRef.current.forEach((p, i) => {
        const px = 50 + p.x * SCALE;
        const py = GROUND_Y - p.y * SCALE;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // 7. Draw Projectile
      if (proj.x > 0 || proj.active) {
        const px = 50 + proj.x * SCALE;
        const py = GROUND_Y - proj.y * SCALE;
        
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#ff4757';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Stats HUD
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = "16px 'Courier New'";
      ctx.fillText(`DIST: ${proj.x.toFixed(1)}m`, 60, 30);
      ctx.fillText(`HEIGHT: ${proj.y.toFixed(1)}m`, 60, 55);
      ctx.fillText(`SPEED: ${Math.sqrt(proj.vx**2 + proj.vy**2).toFixed(1)} m/s`, 60, 80);

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
    ctx.arc(-10, -10, 18, 0, Math.PI * 2);
    ctx.arc(10, -10, 18, 0, Math.PI * 2);
    ctx.fill();

    // Barrel
    ctx.rotate(-angleRad);
    ctx.translate(recoil, 0); // Recoil effect

    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(0, -12, 70, 24);
    
    // Muzzle Flash / End
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(70, 0, 14, 0, Math.PI*2);
    ctx.fill();

    ctx.restore();

    // Smoke Animation
    if (smoke.length > 0) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-angleRad);
      smoke.forEach((s, i) => {
        ctx.beginPath();
        const size = 15 + s * 8;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.6 - s*0.15})`;
        ctx.arc(80 + s * 15 + recoil, 0, size, 0, Math.PI*2);
        ctx.fill();
      });
      ctx.restore();
      
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
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    
    // Head
    ctx.beginPath();
    ctx.arc(0, -45, 10, 0, Math.PI * 2); 
    ctx.stroke();
    
    // Body
    ctx.beginPath();
    ctx.moveTo(0, -35);
    ctx.lineTo(0, -15);
    ctx.stroke();

    // Arms (looking up)
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.lineTo(-12, -20);
    ctx.moveTo(0, -30);
    ctx.lineTo(12, -20);
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
