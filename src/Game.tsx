import React, { useState, useEffect, useRef, Component } from 'react';
import styled from 'styled-components';
import { saveScore } from './utils/scoreUtils';
import { useAuth } from './contexts/AuthContext';
import { db, ref, get, set } from './firebase/firebase';

const GameCanvas = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Toasty Milk';
  position: relative;
  overflow: hidden;
`;

const InfoScreen = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px;
  border-radius: 15px;
  text-align: center;
  font-size: 18px;
  font-family: 'Toasty Milk';
  z-index: 1000;
`;

const StartButton = styled.button`
  background: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 16px;
  font-family: 'Toasty Milk';
  color: black;
  cursor: pointer;
  margin-top: 15px;
`;


const Circle = ({x, y }: {x: number, y: number}) => {
    
  
    return <div style={{
    position: "absolute",
    width: "50px",
    height: "50px",
    background: "white",
    borderRadius: "50%",
    left: x,
    top: y,
    border: "4px solid rgb(0, 0, 0)"
  }} />;
  };
  


interface TriangleData {
  id: number;
  x: number;
  y: number;
  speed: number;
  element: HTMLDivElement;
  collected: boolean;
}

interface WallTriangleData {
  id: number;
  x: number;
  y: number;
  speed: number;
  direction: 'left' | 'right' | 'up' | 'down';
  wall: 'top' | 'bottom' | 'left' | 'right';
  element: HTMLDivElement;
  startPos: number;
  endPos: number;
}

interface GameProps {
  showUI?: boolean;
}

const Game: React.FC<GameProps> = ({ showUI = true }) => {
  const [position, setPosition] = useState({ x: 150, y: 50 });
  const [gameOver, setGameOver] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [score, setScore] = useState(0);
  const [deathCount, setDeathCount] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [fps, setFps] = useState(0);
  const trianglesRef = useRef<TriangleData[]>([]);
  const wallTrianglesRef = useRef<WallTriangleData[]>([]);
  const gameState = useRef({
    x: 150,
    y: 50,
    vx: 0,
    vy: 0,
    onGround: false,
    onWall: false,
    wallSide: 'none',
    jumpsUsed: 0,
    maxJumps: 2
  });
  const keysPressed = useRef<Set<string>>(new Set());
  const keysJustPressed = useRef<Set<string>>(new Set());
  const animationRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);
  const triangleIdCounter = useRef(0);
  const wallTriangleIdCounter = useRef(0);
  const frameCount = useRef(0);
  const difficultyLevel = useRef<number>(1);
  
  // FPS tracking
  const lastFrameTime = useRef(performance.now());
  const fpsUpdateInterval = useRef(0);

  const GRAVITY = 0.8;
  const JUMP_FORCE = -20;
  const WALL_JUMP_FORCE = -15;
  const MOVE_SPEED = 9;
  const MAX_TRIANGLES = 15;
  const WALL_TRIANGLES_PER_WALL = 1; // Number of triangles per wall
  const deathCounter = useRef(0);
  const { currentUser } = useAuth();
  const [highscore, setHighscore] = useState(0);

  useEffect(() => {
    if (currentUser) {
      const userRef = ref(db, `users/${currentUser.uid}`);

      get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
          setHighscore(snapshot.val().highscore);
          console.log(snapshot.val().highscore);
        }
      });
    }
  }, [currentUser]);

  const createTriangleElement = (x: number, y: number): HTMLDivElement => {
    const triangle = document.createElement('div');
    triangle.style.position = 'absolute';
    triangle.style.width = '50px';
    triangle.style.height = '50px';
    triangle.style.background = '#ff0000';
    triangle.style.border = '4px solid rgb(0, 0, 0)';
    triangle.style.borderRadius = '50%';
    triangle.style.left = `${x}px`;
    triangle.style.top = `${y}px`;
    triangle.style.pointerEvents = 'none';
    triangle.style.transition = 'background-color 0.2s ease-in-out';
    return triangle;
  };

  const createWallTriangleElement = (x: number, y: number, direction: 'left' | 'right' | 'up' | 'down'): HTMLDivElement => {
    const triangle = document.createElement('div');
    triangle.style.position = 'absolute';
    triangle.style.width = '30px';
    triangle.style.height = '30px';
    triangle.style.background = '#000000';
    triangle.style.border = '2px solid #333333';
    triangle.style.borderRadius = '50%';
    triangle.style.left = `${x - 15}px`;
    triangle.style.top = `${y - 15}px`;
    triangle.style.pointerEvents = 'none';
    triangle.style.zIndex = '10';
    
    return triangle;
  };

  const startGame = () => {
    setGameStarted(true);
    // Save test data when game starts
  };

  const resetGame = () => {
    gameState.current = {
      x: 150,
      y: 50,
      vx: 0,
      vy: 0,
      onGround: false,
      onWall: false,
      wallSide: 'none',
      jumpsUsed: 0,
      maxJumps: 3
    };
    deathCounter.current = deathCounter.current + 1;
    setDeathCount(deathCounter.current);
    setPosition({ x: 150, y: 50 });
    
    // Remove all triangle elements from DOM
    trianglesRef.current.forEach(triangle => {
      if (triangle.element && triangle.element.parentNode) {
        triangle.element.parentNode.removeChild(triangle.element);
      }
    });
    trianglesRef.current = [];
    
    // Remove all wall triangle elements from DOM
    wallTrianglesRef.current.forEach(triangle => {
      if (triangle.element && triangle.element.parentNode) {
        triangle.element.parentNode.removeChild(triangle.element);
      }
    });
    wallTrianglesRef.current = [];
    setGameOver(false);
    setGameTime(0);
    setScore(0);
    frameCount.current = 0;
    difficultyLevel.current = 1;
    // Note: deathCount is not reset - it persists across game restarts
  };

  const spawnTriangle = () => {
    if (trianglesRef.current.length >= MAX_TRIANGLES) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const containerWidth = container.clientWidth;
    const x = Math.random() * (containerWidth - 0);
    const speed = 2 + Math.random() * 1; // Minimum 2, maximum 3 (tighter range)
    
    const triangleElement = createTriangleElement(x, 0);
    container.appendChild(triangleElement);
    
    const newTriangle: TriangleData = {
      id: triangleIdCounter.current++,
      x,
      y: 0,
      speed,
      element: triangleElement,
      collected: false
    };
    
    trianglesRef.current.push(newTriangle);
  };

  const createWallTriangles = () => {
    const container = containerRef.current;
    if (!container) return;
    
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Create triangles for each wall, avoiding player starting area
    const walls = [
      { wall: 'top' as const, direction: 'down' as const, y: 0, isHorizontal: true },
      { wall: 'bottom' as const, direction: 'up' as const, y: containerHeight, isHorizontal: true },
      { wall: 'left' as const, direction: 'right' as const, x: 0, isHorizontal: false },
      { wall: 'right' as const, direction: 'left' as const, x: containerWidth, isHorizontal: false }
    ];
    
    walls.forEach(({ wall, direction, x = 0, y = 0, isHorizontal }) => {
      for (let i = 0; i < WALL_TRIANGLES_PER_WALL; i++) {
        let startPos: number, endPos: number, currentPos: number;
        
        if (isHorizontal) {
          // Horizontal walls (top/bottom)
          const segmentSize = containerWidth / WALL_TRIANGLES_PER_WALL;
          startPos = i * segmentSize;
          endPos = (i + 1) * segmentSize;
          currentPos = startPos + (segmentSize / 2);
          
          // Skip if too close to player starting position (x: 150) but only for top wall
          if (wall === 'top' && Math.abs(currentPos - 150) < 50) continue;
          
          const triangleElement = createWallTriangleElement(currentPos, y, direction);
          container.appendChild(triangleElement);
          console.log(`Created wall triangle: ${wall} at (${currentPos}, ${y})`);
          
          const newWallTriangle: WallTriangleData = {
            id: wallTriangleIdCounter.current++,
            x: currentPos,
            y,
            speed: 1 + difficultyLevel.current,
            direction,
            wall,
            element: triangleElement,
            startPos,
            endPos
          };
          
          wallTrianglesRef.current.push(newWallTriangle);
        } else {
          // Vertical walls (left/right)
          const segmentSize = containerHeight / WALL_TRIANGLES_PER_WALL;
          startPos = i * segmentSize;
          endPos = (i + 1) * segmentSize;
          currentPos = startPos + (segmentSize / 2);
          
          // Skip if too close to player starting position (y: 50) but only for left wall
          if (wall === 'left' && Math.abs(currentPos - 50) < 100) continue;
          
          const triangleElement = createWallTriangleElement(x!, currentPos, direction);
          container.appendChild(triangleElement);
          console.log(`Created wall triangle: ${wall} at (${x}, ${currentPos})`);
          
          const newWallTriangle: WallTriangleData = {
            id: wallTriangleIdCounter.current++,
            x: x!,
            y: currentPos,
            speed: 1 + difficultyLevel.current,
            direction,
            wall,
            element: triangleElement,
            startPos,
            endPos
          };
          
          wallTrianglesRef.current.push(newWallTriangle);
        }
      }
    });
  };

  const checkCollision = (playerX: number, playerY: number, triangleX: number, triangleY: number) => {
    const playerRadius = 25; // Updated to match new player size (50px diameter = 25px radius)
    const triangleRadius = 25; // Updated to match new circle size (50px diameter = 25px radius)
    
    const dx = playerX + playerRadius - (triangleX + 25);
    const dy = playerY + playerRadius - (triangleY + 25);
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < (playerRadius + triangleRadius);
  };

  const checkWallTriangleCollision = (playerX: number, playerY: number, triangleX: number, triangleY: number) => {
    const playerRadius = 25; // Updated to match new player size (50px diameter = 25px radius)
    const triangleRadius = 15; // Smaller collision radius for wall triangles
    
    const dx = playerX + playerRadius - triangleX;
    const dy = playerY + playerRadius - triangleY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < (playerRadius + triangleRadius);
  };

  useEffect(() => {
    if (!gameStarted) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!keysPressed.current.has(e.key)) {
        keysJustPressed.current.add(e.key);
      }
      keysPressed.current.add(e.key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
      keysJustPressed.current.delete(e.key);
    };

    const gameLoop = () => {
      frameCount.current++;
      
      // Calculate FPS
      const currentTime = performance.now();
      const deltaTime = currentTime - lastFrameTime.current;
      lastFrameTime.current = currentTime;
      
      // Update FPS every 30 frames (about twice per second)
      if (frameCount.current % 30 === 0) {
        const currentFps = Math.round(1000 / deltaTime);
        setFps(currentFps);
      }
      
      if (gameOver) {
        if (keysJustPressed.current.has(' ')) {
          resetGame();
        }
        keysJustPressed.current.clear();
        animationRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      const state = gameState.current;
      
      const container = containerRef.current;
      const containerWidth = container?.clientWidth || 400;
      const containerHeight = container?.clientHeight || 400;
      const GROUND_Y = containerHeight - 55; // Updated for smaller player (50px + 5px buffer)
      const MAX_X = containerWidth - 55; // Updated for smaller player (50px + 5px buffer)
      const TOP_Y = 0;

      // Handle input
      if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('a') || keysPressed.current.has('A')) {
        state.vx = -MOVE_SPEED;
      } else if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('d') || keysPressed.current.has('D')) {
        state.vx = MOVE_SPEED;
      } else {
        state.vx *= 0.8;
      }

      if (keysJustPressed.current.has('ArrowUp') || keysJustPressed.current.has('w') || keysJustPressed.current.has('W')) {
        if (state.onGround) {
          state.vy = JUMP_FORCE;
          state.onGround = false;
          state.jumpsUsed = 1;
        } else if (state.onWall) {
          state.vy = WALL_JUMP_FORCE;
          state.onWall = false;
          state.wallSide = 'none';
          state.jumpsUsed = 1;
          
          if (state.wallSide === 'left') {
            state.vx = MOVE_SPEED * 1.5;
          } else if (state.wallSide === 'right') {
            state.vx = -MOVE_SPEED * 1.5;
          }
        } else if (state.jumpsUsed < state.maxJumps) {
          state.vy = JUMP_FORCE * 0.8;
          state.jumpsUsed++;
        }
      }

      keysJustPressed.current.clear();

      state.vy += GRAVITY;
      state.x += state.vx;
      state.y += state.vy;

      if (state.y <= TOP_Y) {
        state.y = TOP_Y;
        state.vy = 0;
      }

      if (state.y >= GROUND_Y) {
        state.y = GROUND_Y;
        state.vy = 0;
        state.onGround = true;
        state.onWall = false;
        state.wallSide = 'none';
        state.jumpsUsed = 0;
      } else {
        state.onGround = false;
      }

      if (state.x <= 0) {
        state.x = 0;
        state.vx = 0;
        state.onWall = true;
        state.wallSide = 'left';
      } else if (state.x >= MAX_X) {
        state.x = MAX_X;
        state.vx = 0;
        state.onWall = true;
        state.wallSide = 'right';
      } else {
        state.onWall = false;
        state.wallSide = 'none';
      }

      // Update triangles using direct DOM manipulation
      trianglesRef.current = trianglesRef.current.filter(triangle => {
        triangle.y += triangle.speed;
        triangle.element.style.top = `${triangle.y}px`;
        
        // Check collision
        if (checkCollision(state.x, state.y, triangle.x, triangle.y)) {
          setGameOver(true);
        }
        
        // Check if player goes over the circle (collection)
        if (!triangle.collected) {
          const playerCenterX = state.x + 25; // Updated for smaller player (50px diameter = 25px radius)
          const playerCenterY = state.y + 25; // Updated for smaller player (50px diameter = 25px radius)
          const circleCenterX = triangle.x + 25;
          const circleCenterY = triangle.y + 25;
          
          // Check if player is over the circle (above it horizontally)
          const horizontalDistance = Math.abs(playerCenterX - circleCenterX);
          const verticalDistance = circleCenterY - playerCenterY; // Positive when circle is below player
          
          if (horizontalDistance < 50 && verticalDistance > 0) { // Player is above the circle
            triangle.collected = true;
            triangle.element.style.background = '#00ff00'; // Turn green
            setScore(prevScore => {
              const newScore = prevScore + 100;
              console.log('Circle collected! +100 points');
              console.log('New score:', newScore);
              return newScore;
            });
          }
        }
        
        // Remove if off screen
        if (triangle.y > containerHeight + 50) {
          if (triangle.element && triangle.element.parentNode) {
            triangle.element.parentNode.removeChild(triangle.element);
          }
          return false;
        }
        return true;
      });

      // Update wall triangles - they move back and forth along their walls
      wallTrianglesRef.current.forEach(triangle => {
        // Update speed based on difficulty - starts slow, speeds up gradually
        triangle.speed = 0.5 + (difficultyLevel.current * 0.3);
        
        // Move triangle based on direction
        if (triangle.wall === 'top' || triangle.wall === 'bottom') {
          // Horizontal movement
          if (triangle.direction === 'right') {
            triangle.x += triangle.speed;
            if (triangle.x >= triangle.endPos) {
              triangle.x = triangle.endPos;
              triangle.direction = 'left';
            }
          } else {
            triangle.x -= triangle.speed;
            if (triangle.x <= triangle.startPos) {
              triangle.x = triangle.startPos;
              triangle.direction = 'right';
            }
          }
          triangle.element.style.left = `${triangle.x}px`;
        } else {
          // Vertical movement
          if (triangle.direction === 'down') {
            triangle.y += triangle.speed;
            if (triangle.y >= triangle.endPos) {
              triangle.y = triangle.endPos;
              triangle.direction = 'up';
            }
          } else {
            triangle.y -= triangle.speed;
            if (triangle.y <= triangle.startPos) {
              triangle.y = triangle.startPos;
              triangle.direction = 'down';
            }
          }
          triangle.element.style.top = `${triangle.y}px`;
        }
        
        // Check collision
        if (checkWallTriangleCollision(state.x, state.y, triangle.x, triangle.y)) {
          setGameOver(true);
        }
      });

      // Update difficulty based on time
      if (frameCount.current % 600 === 0) { // Every 10 seconds
        difficultyLevel.current++;
      }
      
      // Update game time and score
      setGameTime(Math.floor(frameCount.current / 60)); // Convert frames to seconds
       setScore(prevScore => {
        const newScore = prevScore + 0.1;
        console.log('Score increased by:', 0.1);
        console.log('New score:', newScore);
        return newScore;
      });
      
      // Spawn triangles - starts every 2 seconds, speeds up to every 1 second
      const baseSpawnRate = 120; // 2 seconds at 60fps
      const difficultyMultiplier = Math.max(0.5, 1 - (difficultyLevel.current - 1) * 0.1); // Slower scaling
      const currentSpawnRate = Math.floor(baseSpawnRate * difficultyMultiplier);
      
      if (frameCount.current % currentSpawnRate === 0 && Math.random() < 0.8) {
        spawnTriangle();
      }

      setPosition({ x: state.x, y: state.y });

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Create initial wall triangles
    createWallTriangles();
    
    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Clean up triangles
      trianglesRef.current.forEach(triangle => {
        if (triangle.element && triangle.element.parentNode) {
          triangle.element.parentNode.removeChild(triangle.element);
        }
      });
      
      // Clean up wall triangles
      wallTrianglesRef.current.forEach(triangle => {
        if (triangle.element && triangle.element.parentNode) {
          triangle.element.parentNode.removeChild(triangle.element);
        }
      });

      
    };
  }, [gameOver, gameStarted]);

  // Handle score saving when game ends
  useEffect(() => {
    if (gameOver && currentUser) {
      const finalScore = Math.round(score);
      saveScore(currentUser.uid, finalScore).then((result) => {
        if (result.isNewHighScore) {
          console.log(`🎉 New high score! Previous: ${result.previousHighScore}, New: ${finalScore}`);
          setIsNewHighScore(true);
        } else {
          console.log(`Score: ${finalScore}, High score: ${result.currentHighScore}`);
          setIsNewHighScore(false);
        }
      });
    }
  }, [gameOver, currentUser]);

  return (
    <GameCanvas ref={containerRef}>
      {!gameStarted ? (
        <InfoScreen>
          <div>Arrows or WASD to move</div>
          <p> - </p>
          <div>Collect red circles for points by jumping OVER them</div>
          <p> - </p>
          <div>Avoid black circles and red circles</div>
          <p> - </p>
          <StartButton onClick={startGame}>
            Start Game
          </StartButton>
        </InfoScreen>
      ) : (
        <>
          <Circle x={position.x} y={position.y} />
          
          {showUI && (
            <>
              {/* Game Stats Display */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                
                padding: '15px',
                borderRadius: '10px',
                fontSize: '18px',
                fontFamily: 'Toasty Milk',
                zIndex: 100
              }}>
                <div>Time: {Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}</div>
                <div>Difficulty: {difficultyLevel.current}</div>
                <div>Deaths: {deathCount}</div>
                <div style={{ color: fps < 30 ? '#ff6b6b' : fps < 50 ? '#ffd93d' : '#6bcf7f' }}>
                  FPS: {fps}
                </div>
              </div>
              
              {/* Score Display */}
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '10%',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '15px',
                borderRadius: '10px',
                fontSize: '48px',
                fontFamily: 'Toasty Milk',
                zIndex: 100,
                fontWeight: 'bold'
              }}>
                {Math.round(score)}
              </div>
            </>
          )}
          
          {gameOver && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '75%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '20px',
              borderRadius: '10px',
              textAlign: 'center',
              fontSize: '24px'
            }}>
              <p style={{ fontSize: '28px', fontFamily: 'Toasty Milk', fontWeight: 'bold', color: 'rgb(255, 63, 63)' }}>Game Over!</p>
              <p>Score: {Math.round(score)}</p>
              {isNewHighScore && (
                <p style={{ fontSize: '20px', fontFamily: 'Toasty Milk', fontWeight: 'bold', color: 'rgb(255, 215, 0)' }}>🎉 NEW HIGH SCORE! 🎉</p>
              )}
              <p>Survived for {Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')} seconds</p>
              <p style={{ fontSize: '20px', fontFamily: 'Toasty Milk', fontWeight: 'bold', color: 'rgb(59, 170, 255)' }}>Press SPACE to restart</p>
            </div>
          )}
        </>
      )}
    </GameCanvas>
  );
};

export default Game;
