import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { World } from '../lib/physics/World';
import { Player } from '../lib/physics/Player';
import { Ball } from '../lib/physics/Ball';
import { Vector2 } from '../lib/math/Vector2';

const MAX_JOYSTICK_RADIUS = 80;

type JoystickState = {
  active: boolean;
  id: number | null;
  origin: Vector2;
  current: Vector2;
};

const Sandbox: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const worldRef = useRef<World | null>(null);
  const requestRef = useRef<number>();
  const activePlayerRef = useRef<Player | null>(null);
  
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [score, setScore] = useState({ team0: 0, team1: 0 });
  const [showGoalOverlay, setShowGoalOverlay] = useState(false);
  const isResettingRef = useRef(false);

  const joystickRef = useRef<JoystickState>({ active: false, id: null, origin: new Vector2(0,0), current: new Vector2(0,0) });
  const joystickBaseUiRef = useRef<HTMLDivElement>(null);
  const joystickHandleUiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateSize = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      setDimensions({
        width: clientWidth,
        height: clientHeight,
      });
      if (worldRef.current) {
        worldRef.current.width = clientWidth;
        worldRef.current.height = clientHeight;
      }
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, []);

  const dimensionsRef = useRef(dimensions);
  dimensionsRef.current = dimensions;

  const initWorld = useCallback((possessionTeamId: number = 0) => {
    const w = dimensionsRef.current.width;
    const h = dimensionsRef.current.height;
    if (w === 0 || h === 0) return;

    const isPortrait = h > w;
    const u = isPortrait ? w / 68 : h / 68;
    const physicalGoalWidth = 7.32 * u;

    const world = new World(w, h);
    
    world.setGoalConfig(physicalGoalWidth, isPortrait, (teamScoredId: number) => {
        if (isResettingRef.current) return;
        isResettingRef.current = true;
        
        setShowGoalOverlay(true);

        setScore(s => ({
            ...s,
            [teamScoredId === 0 ? 'team0' : 'team1']: s[teamScoredId === 0 ? 'team0' : 'team1'] + 1
        }));

        // The team that was scored ON gets possession
        const scoredOnTeam = teamScoredId === 0 ? 1 : 0;
        
        setTimeout(() => {
            initWorld(scoredOnTeam);
            isResettingRef.current = false;
            setShowGoalOverlay(false);
        }, 3000);
    });

    // Add a Ball
    const ball = new Ball({ x: w / 2, y: h / 2, radius: 10, mass: 0.5, color: '#111827' });
    world.addEntity(ball);

    if (isPortrait) {
        // Teams 0 (Bottom) & 1 (Top)
        const t0KickoffY = possessionTeamId === 0 ? h / 2 + 50 : h - 200;
        const t1KickoffY = possessionTeamId === 1 ? h / 2 - 50 : 200;

        const p1 = new Player({ id: "p1", x: w / 2, y: t0KickoffY, radius: 16, mass: 1.5, color: '#2563eb', team: 0, isActive: (possessionTeamId === 0), maxSpeed: 3 });
        world.addEntity(p1);
        if (possessionTeamId === 0) activePlayerRef.current = p1;

        world.addEntity(new Player({ x: w / 2 - 100, y: h - 150, radius: 16, mass: 1.5, color: '#2563eb', team: 0, maxSpeed: 2 }));
        world.addEntity(new Player({ x: w / 2 + 100, y: h - 150, radius: 16, mass: 1.5, color: '#2563eb', team: 0, maxSpeed: 2 }));

        const p2 = new Player({ id: "p2", x: w / 2, y: t1KickoffY, radius: 16, mass: 1.5, color: '#dc2626', team: 1, isActive: (possessionTeamId === 1), maxSpeed: 3 });
        world.addEntity(p2);
        if (possessionTeamId === 1) activePlayerRef.current = p2;

        for (let i=0; i<2; i++) {
          world.addEntity(new Player({ 
            x: w / 2 + (i === 0 ? -100 : 100), 
            y: 150, 
            radius: 16, 
            mass: 1.5, 
            color: '#dc2626', 
            team: 1, 
            maxSpeed: 2 
          }));
        }
    } else {
        // Teams 0 (Left) & 1 (Right)
        const t0KickoffX = possessionTeamId === 0 ? w / 2 - 50 : 200;
        const t1KickoffX = possessionTeamId === 1 ? w / 2 + 50 : w - 200;

        const p1 = new Player({ id: "p1", x: t0KickoffX, y: h / 2, radius: 16, mass: 1.5, color: '#2563eb', team: 0, isActive: (possessionTeamId === 0), maxSpeed: 3 });
        world.addEntity(p1);
        if (possessionTeamId === 0) activePlayerRef.current = p1;

        world.addEntity(new Player({ x: 150, y: h / 2 - 150, radius: 16, mass: 1.5, color: '#2563eb', team: 0, maxSpeed: 2 }));
        world.addEntity(new Player({ x: 150, y: h / 2 + 150, radius: 16, mass: 1.5, color: '#2563eb', team: 0, maxSpeed: 2 }));

        const p2 = new Player({ id: "p2", x: t1KickoffX, y: h / 2, radius: 16, mass: 1.5, color: '#dc2626', team: 1, isActive: (possessionTeamId === 1), maxSpeed: 3 });
        world.addEntity(p2);
        if (possessionTeamId === 1) activePlayerRef.current = p2;

        for (let i=0; i<2; i++) {
          world.addEntity(new Player({ 
            x: w - 150, 
            y: h / 2 + (i === 0 ? -150 : 150), 
            radius: 16, 
            mass: 1.5, 
            color: '#dc2626', 
            team: 1, 
            maxSpeed: 2 
          }));
        }
    }

    worldRef.current = world;
  }, []);

  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0 && !worldRef.current) {
        initWorld(0);
    }
  }, [dimensions.width, dimensions.height, initWorld]);

  useEffect(() => {
        const render = () => {
        if (!worldRef.current || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const w = canvasRef.current.clientWidth;
        const h = canvasRef.current.clientHeight;

        // Auto-switch active player to the teammate closest to the ball
        const ball = worldRef.current.entities.find(e => e instanceof Ball) as Ball | undefined;
        let pTeam = activePlayerRef.current?.team;
        
        if (ball && pTeam !== undefined) {
            let closestDstSq = Infinity;
            let closestTeammate: Player | null = null;
            
            for (const entity of worldRef.current.entities) {
                if (entity instanceof Player && entity.team === pTeam) {
                    const dstSq = entity.pos.sub(ball.pos).magSq();
                    if (dstSq < closestDstSq) {
                        closestDstSq = dstSq;
                        closestTeammate = entity;
                    }
                }
            }

            if (closestTeammate && closestTeammate !== activePlayerRef.current) {
                if (activePlayerRef.current) activePlayerRef.current.isActive = false;
                closestTeammate.isActive = true;
                activePlayerRef.current = closestTeammate;
            }
        }

        // Apply input force
        if (joystickRef.current.active && activePlayerRef.current) {
            const jDir = joystickRef.current.current.sub(joystickRef.current.origin);
            if (jDir.magSq() > 0.01) {
                // limit input vector to max joystick radius
                const limitedDir = jDir.mag() > MAX_JOYSTICK_RADIUS ? jDir.normalize().mult(MAX_JOYSTICK_RADIUS) : jDir;
                // apply scaled force
                activePlayerRef.current.applyForce(limitedDir.mult(0.015));
            }
        }

        // Tick Physics independently of draw if we wanted, but here they run in sequence per frame.
        worldRef.current.tick(16); // Target dt in ms ~16.6ms for 60fps

        // Fully clear the physical canvas first to avoid any smearing
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        ctx.save();
        const dpr = window.devicePixelRatio || 1;
        ctx.scale(dpr, dpr);

        // Draw Background
        ctx.fillStyle = '#f4f4f0'; // Off-white hand-drawn paper look
        ctx.fillRect(0, 0, w, h);

        // Draw Field Markings
        ctx.strokeStyle = '#cbd5e1'; // Raw pencil/marker grayish light
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        const isPortrait = h > w;
        
        // Base unit: the field's short side represents 68 meters.
        const u = isPortrait ? w / 68 : h / 68;

        if (isPortrait) {
            // Draw Portrait Field (Vertical play)
            // Center Line (horizontal)
            ctx.beginPath();
            ctx.moveTo(-10, h / 2);
            ctx.lineTo(w + 10, h / 2);
            ctx.stroke();

            // Center Circle
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, 9.15 * u, 0, Math.PI * 2);
            ctx.stroke();
            
            // Center Dot
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, Math.max(3, 0.4 * u), 0, Math.PI * 2);
            ctx.fillStyle = '#cbd5e1';
            ctx.fill();

            // Penalty Boxes (40.32m wide x 16.5m deep)
            const penBoxW = 40.32 * u;
            const penBoxH = 16.5 * u;
            ctx.strokeRect((w - penBoxW) / 2, -10, penBoxW, penBoxH + 10); // Top
            ctx.strokeRect((w - penBoxW) / 2, h - penBoxH, penBoxW, penBoxH + 10); // Bottom

            // Goal Areas (18.32m wide x 5.5m deep)
            const goalAreaW = 18.32 * u;
            const goalAreaH = 5.5 * u;
            ctx.strokeRect((w - goalAreaW) / 2, -10, goalAreaW, goalAreaH + 10);
            ctx.strokeRect((w - goalAreaW) / 2, h - goalAreaH, goalAreaW, goalAreaH + 10);

            // Penalty Spots (11m from goal line)
            const penSpotDist = 11 * u;
            ctx.beginPath(); ctx.arc(w / 2, penSpotDist, Math.max(2, 0.3 * u), 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(w / 2, h - penSpotDist, Math.max(2, 0.3 * u), 0, Math.PI * 2); ctx.fill();

            // Penalty Arcs
            const arcRadius = 9.15 * u;
            const arcAngle = Math.acos(5.5 / 9.15); // angle from center to intersect pen box
            // Top arc
            ctx.beginPath();
            ctx.arc(w / 2, penSpotDist, arcRadius, Math.PI/2 - arcAngle, Math.PI/2 + arcAngle);
            ctx.stroke();
            // Bottom arc
            ctx.beginPath();
            ctx.arc(w / 2, h - penSpotDist, arcRadius, -Math.PI/2 - arcAngle, -Math.PI/2 + arcAngle);
            ctx.stroke();

            // Corner Arcs
            const cornerRadius = Math.max(4, 1 * u);
            ctx.beginPath(); ctx.arc(0, 0, cornerRadius, 0, Math.PI/2); ctx.stroke();
            ctx.beginPath(); ctx.arc(w, 0, cornerRadius, Math.PI/2, Math.PI); ctx.stroke();
            ctx.beginPath(); ctx.arc(0, h, cornerRadius, -Math.PI/2, 0); ctx.stroke();
            ctx.beginPath(); ctx.arc(w, h, cornerRadius, Math.PI, Math.PI*1.5); ctx.stroke();

            // Goals representation
            const goalDepth = 2.44 * u;
            const goalWidth = 7.32 * u;
            ctx.fillStyle = 'rgba(203, 213, 225, 0.2)';
            ctx.fillRect((w - goalWidth) / 2, 0, goalWidth, goalDepth);
            ctx.fillRect((w - goalWidth) / 2, h - goalDepth, goalWidth, goalDepth);
            
            ctx.fillStyle = '#cbd5e1';
            ctx.fillRect((w - goalWidth) / 2, -2, goalWidth, 4);
            ctx.fillRect((w - goalWidth) / 2, h - 2, goalWidth, 4);

        } else {
            // Draw Landscape Field (Horizontal play)
            // Center Line (vertical)
            ctx.beginPath();
            ctx.moveTo(w / 2, -10);
            ctx.lineTo(w / 2, h + 10);
            ctx.stroke();

            // Center Circle (Radius 9.15m)
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, 9.15 * u, 0, Math.PI * 2);
            ctx.stroke();
            
            // Center Dot
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, Math.max(3, 0.4 * u), 0, Math.PI * 2);
            ctx.fillStyle = '#cbd5e1';
            ctx.fill();

            // Penalty Boxes (16.5m x 40.32m)
            const penBoxW = 16.5 * u;
            const penBoxH = 40.32 * u;
            ctx.strokeRect(-10, (h - penBoxH) / 2, penBoxW + 10, penBoxH);
            ctx.strokeRect(w - penBoxW, (h - penBoxH) / 2, penBoxW + 10, penBoxH);

            // Goal Areas (5.5m x 18.32m)
            const goalAreaW = 5.5 * u;
            const goalAreaH = 18.32 * u;
            ctx.strokeRect(-10, (h - goalAreaH) / 2, goalAreaW + 10, goalAreaH);
            ctx.strokeRect(w - goalAreaW, (h - goalAreaH) / 2, goalAreaW + 10, goalAreaH);

            // Penalty Spots (11m from goal line)
            const penSpotDist = 11 * u;
            ctx.beginPath();
            ctx.arc(penSpotDist, h / 2, Math.max(2, 0.3 * u), 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(w - penSpotDist, h / 2, Math.max(2, 0.3 * u), 0, Math.PI * 2);
            ctx.fill();

            // Penalty Arcs (Radius 9.15m from penalty spot)
            const arcRadius = 9.15 * u;
            const arcAngle = Math.acos(5.5 / 9.15);
            ctx.beginPath();
            ctx.arc(penSpotDist, h / 2, arcRadius, -arcAngle, arcAngle);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(w - penSpotDist, h / 2, arcRadius, Math.PI - arcAngle, Math.PI + arcAngle);
            ctx.stroke();

            // Corner Arcs (Radius 1m)
            const cornerRadius = Math.max(4, 1 * u);
            ctx.beginPath(); ctx.arc(0, 0, cornerRadius, 0, Math.PI/2); ctx.stroke();
            ctx.beginPath(); ctx.arc(0, h, cornerRadius, -Math.PI/2, 0); ctx.stroke();
            ctx.beginPath(); ctx.arc(w, 0, cornerRadius, Math.PI/2, Math.PI); ctx.stroke();
            ctx.beginPath(); ctx.arc(w, h, cornerRadius, Math.PI, Math.PI*1.5); ctx.stroke();

            // Goals representation
            const goalDepth = 2.44 * u;
            const goalWidth = 7.32 * u;
            ctx.fillStyle = 'rgba(203, 213, 225, 0.2)'; // Faint gray for net area
            ctx.fillRect(0, (h - goalWidth) / 2, goalDepth, goalWidth);
            ctx.fillRect(w - goalDepth, (h - goalWidth) / 2, goalDepth, goalWidth);
            
            ctx.fillStyle = '#cbd5e1';
            ctx.fillRect(-2, (h - goalWidth) / 2, 4, goalWidth);
            ctx.fillRect(w - 2, (h - goalWidth) / 2, 4, goalWidth);
        }

        // Render Entities
        for (const entity of worldRef.current.entities) {
            
            if (entity instanceof Ball) {
                // Ball: simple filled black circle
                ctx.beginPath();
                ctx.arc(entity.pos.x, entity.pos.y, entity.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#111827';
                ctx.fill();
            } else {
                // Player: thick stroked circle with inset color fill
                ctx.beginPath();
                ctx.arc(entity.pos.x, entity.pos.y, entity.radius, 0, Math.PI * 2);
                ctx.fillStyle = entity.color;
                ctx.fill();
                ctx.strokeStyle = '#111827';
                ctx.lineWidth = 3;
                ctx.stroke();
            }
            
            // Ring for active player
            if (entity instanceof Player && entity.isActive) {
                ctx.beginPath();
                ctx.arc(entity.pos.x, entity.pos.y, entity.radius + 10, 0, Math.PI * 2);
                ctx.strokeStyle = '#111827';
                ctx.lineWidth = 3;
                ctx.setLineDash([8, 8]);
                ctx.stroke();
                ctx.setLineDash([]); // reset
            }
        }

        // Update Joystick DOM overlay
        if (joystickBaseUiRef.current && joystickHandleUiRef.current) {
            if (joystickRef.current.active) {
                joystickBaseUiRef.current.style.opacity = '1';
                joystickBaseUiRef.current.style.left = `${joystickRef.current.origin.x - 96}px`; // 192px width / 2
                joystickBaseUiRef.current.style.top = `${joystickRef.current.origin.y - 96}px`;
                
                const offset = joystickRef.current.current.sub(joystickRef.current.origin);
                if (offset.mag() > MAX_JOYSTICK_RADIUS) {
                    const limited = offset.normalize().mult(MAX_JOYSTICK_RADIUS);
                    joystickHandleUiRef.current.style.transform = `translate(${limited.x}px, ${limited.y}px)`;
                } else {
                    joystickHandleUiRef.current.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
                }
            } else {
                joystickBaseUiRef.current.style.opacity = '0';
            }
        }
        
        ctx.restore();

        requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);
    
    return () => {
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }
    }
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only capture primary buttons or touches
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x < dimensions.width / 2) {
        // Activate joystick on left screen half
        joystickRef.current = {
            active: true,
            id: e.pointerId,
            origin: new Vector2(x, y),
            current: new Vector2(x, y)
        };
        try {
            // Capture pointer to track outside canvas optionally
            e.currentTarget.setPointerCapture(e.pointerId);
        } catch (err) {
            console.warn('Pointer capture failed', err);
        }
    } else {
        // Right screen half -> simulated "Flick" event (dash/shot)
        if (activePlayerRef.current && worldRef.current) {
            const ball = worldRef.current.entities.find(e => e instanceof Ball) as Ball | undefined;
            if (ball) {
                const player = activePlayerRef.current;
                const dirToBall = ball.pos.sub(player.pos);
                // Only normalize and apply if there is a distance
                if (dirToBall.mag() > 0) {
                    const dashVec = dirToBall.normalize();
                    player.applyForce(dashVec.mult(60)); // Slowed down from 150
                }
            }
        }
    }
  };
  
  const handlePointerMove = (e: React.PointerEvent) => {
      if (joystickRef.current.active && e.pointerId === joystickRef.current.id) {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (!rect) return;
          joystickRef.current.current = new Vector2(e.clientX - rect.left, e.clientY - rect.top);
      }
  }
  
  const handlePointerUp = (e: React.PointerEvent) => {
      if (joystickRef.current.active && e.pointerId === joystickRef.current.id) {
          joystickRef.current.active = false;
          joystickRef.current.id = null;
          try {
              e.currentTarget.releasePointerCapture(e.pointerId);
          } catch (err) {}
      }
  }

  return (
    <div className="relative w-full h-screen bg-[#f4f4f0] text-[#111827] flex flex-col overflow-hidden font-sans select-none border-8 border-[#111827]">
      
      {/* Minimal Top-Center Scoreboard */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
        <div className="flex items-center gap-6 bg-white border-4 border-[#111827] px-8 py-3 rounded-2xl shadow-[4px_4px_0_0_#111827]">
          <div className="text-2xl font-bold text-blue-600 tracking-wider">USA</div>
          <div className="text-3xl font-black">{score.team0}<span className="mx-2 text-gray-400">:</span>{score.team1}</div>
          <div className="text-2xl font-bold text-red-600 tracking-wider">ARG</div>
        </div>
        <div className="mt-4 bg-white border-4 border-[#111827] shadow-[4px_4px_0_0_#111827] px-6 py-1 rounded-full text-2xl font-bold">
          74:22
        </div>
      </div>

      <main ref={containerRef} className="flex-1 relative flex overflow-hidden">
        {/* The canvas handles physics rendering entirely */}
        <canvas
          ref={canvasRef}
          width={dimensions.width * (window.devicePixelRatio || 1)}
          height={dimensions.height * (window.devicePixelRatio || 1)}
          style={{ width: dimensions.width, height: dimensions.height }}
          className="absolute inset-0 block touch-none z-0"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
        
        {/* Virtual Joystick UI Overlay */}
        <div 
          ref={joystickBaseUiRef} 
          className="absolute w-48 h-48 rounded-full border-4 border-[#111827] border-dashed flex items-center justify-center pointer-events-none transition-opacity duration-150 z-10"
          style={{ opacity: 0 }}
        >
          <div 
            ref={joystickHandleUiRef} 
            className="w-16 h-16 rounded-full bg-black/10 border-4 border-[#111827] transition-transform duration-75"
          ></div>
        </div>
        
        {/* "Flick" zone visual indicator (right side) */}
        <div className="absolute bottom-12 right-12 flex flex-col items-center justify-center pointer-events-none z-10">
            <div className="w-24 h-24 rounded-full bg-white border-4 border-[#111827] border-dashed shadow-[4px_4px_0_0_#111827] flex flex-col items-center justify-center opacity-80">
                <span className="text-2xl font-bold text-[#111827]">FLICK</span>
            </div>
        </div>

        <AnimatePresence>
          {showGoalOverlay && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 bg-black/20 backdrop-blur-sm"
            >
              <svg viewBox="0 0 1000 300" className="w-full max-w-5xl drop-shadow-2xl">
                <motion.text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="font-bold text-8xl md:text-9xl"
                  style={{ fontFamily: 'cursive' }}
                  initial={{ strokeDasharray: 3000, strokeDashoffset: 3000 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                >
                  Gooooooooooal!
                </motion.text>
                <motion.text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fbbf24"
                  stroke="none"
                  className="font-bold text-8xl md:text-9xl"
                  style={{ fontFamily: 'cursive' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.3 }}
                >
                  Gooooooooooal!
                </motion.text>
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Sandbox;
