<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dynamic Baseball Simulator</title>
    <style>
        :root {
            --sz-width: 100px;
            --sz-height: 120px;
            --sz-left: calc(50% - (var(--sz-width) / 2));
            --sz-top: calc(50% - (var(--sz-height) / 2));
        }
        body {
            font-family: 'Malgun Gothic', '맑은 고딕', sans-serif;
            background-color: #dcdcdc;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            overflow: hidden;
        }
        #title-screen, #difficulty-screen, #game-over-screen, #playball-overlay, #inning-selection-screen {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://source.unsplash.com/random/800x600/?baseball,stadium,night') no-repeat center center;
            background-size: cover;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 200;
            color: white;
            text-align: center;
            padding: 20px;
            box-sizing: border-box;
        }
        #difficulty-screen, #inning-selection-screen, #game-over-screen, #playball-overlay {
             display: none;
        }
        #difficulty-screen, #inning-selection-screen { z-index: 199; }
        #game-over-screen { z-index: 150; }
        #playball-overlay { z-index: 101; }

        #game-title, #difficulty-title, #game-result-title, #inning-title {
            font-size: 4rem;
            font-weight: bold;
            text-shadow: 3px 3px 6px #000;
            margin-bottom: 20px;
        }
        #game-result-title.win { color: #4ecca3; }
        #game-result-title.lose { color: #ff6b6b; }
        
        #final-score-display {
            font-size: 2.5rem;
            margin-bottom: 25px;
            font-weight: bold;
        }
        #final-scoreboard-container {
            background-color: rgba(255,255,255,0.9);
            border-radius: 5px;
            padding: 15px;
            width: 100%;
            max-width: 550px;
            color: #000;
            margin-bottom: 30px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.4);
        }
        
        .result-indicator {
            font-size: 0.7rem;
            font-weight: bold;
            margin-left: 8px;
            padding: 2px 5px;
            border-radius: 3px;
            color: white;
        }
        .result-win { background-color: #3498db; }
        .result-lose { background-color: #e74c3c; }

        #final-scoreboard-container .scoreboard-row { color: #333; }
        #final-scoreboard-container .header-row { background-color: #333; color: #fff; }

        #difficulty-buttons, #inning-buttons {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        #game-start-button, .difficulty-button, #play-again-button, #initial-playball-button, .inning-button, #tutorial-button {
             padding: 15px 40px; font-size: 1.5rem; font-weight: bold;
            color: #000; background-color: #fff; border: 2px solid #000;
            border-radius: 5px; cursor: pointer; transition: all 0.3s;
            width: 250px;
        }
        #game-start-button:hover, .difficulty-button:hover, #play-again-button:hover, #initial-playball-button:hover, .inning-button:hover, #tutorial-button:hover {
            background-color: #000;
            color: #fff;
        }
        #tutorial-button {
            margin-bottom: 20px;
            background-color: #f1c40f;
            border-color: #f39c12;
        }
        #tutorial-button:hover {
             background-color: #f39c12;
             color: #fff;
        }

        #initial-playball-button {
            font-size: 2.5rem; padding: 20px 60px; width: auto;
            border: 3px solid #fff; background-color: rgba(0,0,0,0.5);
            color: #fff; text-shadow: 2px 2px 4px #000;
            box-shadow: 0 0 20px rgba(255,255,255,0.5); text-transform: uppercase;
        }
        #initial-playball-button:hover {
            background-color: rgba(255,255,255,1); color: #000;
            border-color: #000; text-shadow: none;
        }

        @keyframes fadeOutScreen {
            from { opacity: 1; }
            to { opacity: 0; pointer-events: none; }
        }
        .game-container {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
            border: 1px solid #333;
            text-align: center;
            width: 95%;
            max-width: 600px;
            display: none;
            position: relative;
            z-index: 99;
        }
        
        #full-scoreboard, #final-scoreboard-container #full-scoreboard {
            border: 1px solid #333;
            margin-bottom: 10px;
        }
        .scoreboard-row {
            display: grid;
        }
        .header-row {
            font-weight: bold;
            background-color: #333;
            color: #fff;
        }
        .cell {
            padding: 4px 1px;
            border-left: 1px solid #ccc;
            border-top: 1px solid #ccc;
            font-size: 0.75rem;
            text-align: center;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            white-space: nowrap;
        }
        .team-name {
            font-weight: bold;
            font-size: 0.8rem;
            border-left: none;
            justify-content: flex-start;
            padding-left: 5px;
        }
        .stat-r, .stat-h, .stat-e, .stat-b {
            font-weight: bold;
            background-color: #a9a9a9;
        }
        #home-row .cell { border-bottom: 1px solid #333; }
        
        .header-row .extra-inning {
            background-color: #2980b9;
        }
        
        #field-container { position: relative; }
        #bases-diagram {
            position: absolute; top: 10px; right: 10px;
            width: 60px; height: 60px; z-index: 10;
        }
        .base {
            position: absolute; width: 15px; height: 15px;
            background-color: transparent; border: 2px solid #bbb;
            transform: rotate(45deg); transition: all 0.3s;
        }
        #base-2b { top: 0; left: 50%; transform: translateX(-50%) rotate(45deg); }
        #base-1b { top: 50%; right: 0; transform: translateY(-50%) rotate(45deg); }
        #base-3b { top: 50%; left: 0; transform: translateY(-50%) rotate(45deg); }
        .base.runner-on { background-color: #fff; border-color: #000; }
        #field {
            width: 100%; height: 350px; background-color: #4a4a4a;
            border: 3px solid #1a1a1a; position: relative;
            overflow: hidden; perspective: 500px;
        }
        #score-effect {
            position: absolute;
            top: 45%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 3.5rem;
            font-weight: bold;
            color: #ffdd57;
            text-shadow: 3px 3px 8px rgba(0,0,0,0.8);
            z-index: 110;
            pointer-events: none;
            display: none;
        }
        .score-anim {
            display: block !important;
            animation: score-animation 1.5s ease-out forwards;
        }
        @keyframes score-animation {
            0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
            30% { transform: translate(-50%, -60%) scale(1.1); opacity: 1; }
            50% { transform: translate(-50%, -60%) scale(1); opacity: 1; }
            100% { transform: translate(-50%, -80%) scale(1); opacity: 0; }
        }

        #strike-zone {
            position: absolute; width: var(--sz-width); height: var(--sz-height);
            border: 2px dotted rgba(255, 255, 255, 0.8);
            left: var(--sz-left); top: var(--sz-top);
            box-sizing: border-box; opacity: 1; 
            transition: opacity 0.5s ease-in-out;
        }
        #strike-zone.strike-hit { border-color: #fff; background-color: rgba(255, 255, 255, 0.1); }
        #home-plate {
            position: absolute; width: 82px; height: 82px;
            background-color: #e0e0e0; border: 1px solid #333;
            bottom: 7px; left: 50%; transform: translateX(-50%);
            clip-path: polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%);
        }
        #baseball {
            position: absolute; width: 4.5px; height: 4.5px;
            background: #fff; border-radius: 50%;
            top: 20%; left: calc(50% - 2.25px); transform: scale(1);
        }
        #pitch-markers { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
        .pitch-marker {
            position: absolute;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            animation: fadeOut 1.5s forwards;
        }
        .pitch-marker.strike {
            background-color: #4a90e2;
            border: 1px solid #fff;
        }
        .pitch-marker.ball {
            background-color: #888;
            border: 1px solid #fff;
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }

        .controls { 
            margin-top: 15px; display: flex; justify-content: center;
        }
        #pitch-button {
            padding: 12px 30px; font-size: 1.2rem; font-weight: bold;
            color: #fff; background-color: #000; border: 2px solid #000;
            border-radius: 0; cursor: pointer; transition: background-color 0.3s, color 0.3s;
        }
        #pitch-button:hover:not(:disabled) { background-color: #fff; color: #000; }
        #pitch-button:disabled { background-color: #888; border-color: #888; color: #ccc; cursor: not-allowed; }
        .bso-board { background-color: #e9e9e9; padding: 10px; border: 1px solid #aaa; margin-top: 10px; }
        #pitch-result { font-size: 1.5rem; font-weight: bold; margin-bottom: 5px; height: 30px; color: #000; }
        #pitch-info { font-size: 0.9rem; color: #555; height: 20px; margin-bottom: 10px; }
        .counts { display: flex; justify-content: space-around; align-items: center; }
        .count-display { display: flex; align-items: center; }
        .count-label { font-size: 1.2rem; font-weight: bold; margin-right: 8px; }
        .dots { display: flex; gap: 5px; }
        .dot { width: 16px; height: 16px; border-radius: 50%; background-color: #ccc; transition: background-color 0.3s; }
        .dot-b.active { background-color: #a3d900; }
        .dot-s.active { background-color: #f7ce00; }
        .dot-o.active { background-color: #e53935; }
        
        #turn-overlay {
            position: absolute; top: 0; left: 0;
            width: 100%; height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex; justify-content: center; align-items: center;
            z-index: 100; opacity: 0; pointer-events: none;
            animation: fadeOverlay 1.5s;
        }
        #turn-message {
            background-color: #fff; color: #000;
            padding: 20px 40px; font-size: 2rem; font-weight: bold;
            border-radius: 5px; border: 2px solid #000;
        }
        .tutorial-mode #full-scoreboard,
        .tutorial-mode .bso-board,
        .tutorial-mode #bases-diagram,
        .tutorial-mode .controls {
            display: none;
        }
        #tutorial-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.75);
            z-index: 120;
            display: none;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            padding: 20px;
            box-sizing: border-box;
            text-align: center;
        }
        #tutorial-message {
            font-size: 1.5rem;
            margin-bottom: 30px;
            line-height: 1.6;
            white-space: pre-line;
        }
        #tutorial-next-button {
             padding: 12px 35px; font-size: 1.2rem; font-weight: bold;
            color: #000; background-color: #f1c40f; border: 2px solid #f39c12;
            border-radius: 5px; cursor: pointer; transition: all 0.3s;
        }
        #tutorial-next-button:hover {
            background-color: #f39c12; color: #fff;
        }
        
        @keyframes fadeOverlay {
            0% { opacity: 0; } 25% { opacity: 1; }
            75% { opacity: 1; } 100% { opacity: 0; }
        }
    </style>
    <style id="pitch-animation-style"></style>
</head>
<body>
    <div id="title-screen">
        <h1 id="game-title">DYNAMIC BASEBALL</h1>
        <button id="game-start-button">GAME START</button>
    </div>
    <div id="difficulty-screen">
        <h1 id="difficulty-title">SELECT DIFFICULTY</h1>
        <div id="difficulty-buttons">
            <button id="tutorial-button">TUTORIAL</button>
            <button class="difficulty-button" data-difficulty="easy">EASY</button>
            <button class="difficulty-button" data-difficulty="normal">NORMAL</button>
            <button class="difficulty-button" data-difficulty="hard">HARD</button>
            <button class="difficulty-button" data-difficulty="extreme">EXTREME</button>
        </div>
    </div>
    <div id="inning-selection-screen">
        <h1 id="inning-title">SELECT INNINGS</h1>
        <div id="inning-buttons">
            <button class="inning-button" data-innings="3">3 Innings</button>
            <button class="inning-button" data-innings="6">6 Innings</button>
            <button class="inning-button" data-innings="9">9 Innings</button>
        </div>
    </div>
    <div id="game-over-screen">
        <h1 id="game-result-title">GAME OVER</h1>
        <div id="final-score-display">AWAY 0 : 0 HOME</div>
        <div id="final-scoreboard-container"></div>
        <button id="play-again-button">다시하기</button>
    </div>
    
    <div id="playball-overlay">
        <button id="initial-playball-button">PLAY BALL</button>
    </div>

<div class="game-container">
    <div id="turn-overlay" style="display: none;">
        <div id="turn-message"></div>
    </div>
    <div id="tutorial-overlay">
        <div id="tutorial-message"></div>
        <button id="tutorial-next-button">NEXT</button>
    </div>
    <div id="full-scoreboard">
    </div>
    <div id="field-container">
        <div id="score-effect"></div>
        <div id="bases-diagram">
            <div id="base-2b" class="base"></div>
            <div id="base-3b" class="base"></div>
            <div id="base-1b" class="base"></div>
        </div>
        <div id="field">
            <div id="strike-zone"></div>
            <div id="batter-box-left" class="batter-box"></div>
            <div id="batter-box-right" class="batter-box"></div>
            <div id="home-plate"></div>
            <div id="baseball"></div>
            <div id="pitch-markers"></div>
        </div>
    </div>
    <div class="controls">
        <button id="pitch-button" style="display: none;">PITCH</button>
    </div>
    <div class="bso-board">
        <div id="pitch-result">PLAY BALL!</div>
        <div id="pitch-info"></div>
        <div class="counts">
            <div class="count-display"><span class="count-label">B</span><div class="dots" id="ball-dots"></div></div>
            <div class="count-display"><span class="count-label">S</span><div class="dots" id="strike-dots"></div></div>
            <div class="count-display"><span class="count-label">O</span><div class="dots" id="out-dots"></div></div>
        </div>
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', () => {
        const elements = {
            titleScreen: document.getElementById('title-screen'),
            gameStartButton: document.getElementById('game-start-button'),
            difficultyScreen: document.getElementById('difficulty-screen'),
            difficultyButtons: document.querySelectorAll('.difficulty-button'),
            inningSelectionScreen: document.getElementById('inning-selection-screen'),
            inningButtons: document.querySelectorAll('.inning-button'),
            tutorialButton: document.getElementById('tutorial-button'),
            tutorialOverlay: document.getElementById('tutorial-overlay'),
            tutorialMessage: document.getElementById('tutorial-message'),
            tutorialNextButton: document.getElementById('tutorial-next-button'),
            gameOverScreen: document.getElementById('game-over-screen'),
            gameResultTitle: document.getElementById('game-result-title'),
            finalScoreDisplay: document.getElementById('final-score-display'),
            finalScoreboardContainer: document.getElementById('final-scoreboard-container'),
            playAgainButton: document.getElementById('play-again-button'),
            gameContainer: document.querySelector('.game-container'),
            pitchButton: document.getElementById('pitch-button'), 
            turnOverlay: document.getElementById('turn-overlay'),
            turnMessage: document.getElementById('turn-message'),
            playballOverlay: document.getElementById('playball-overlay'),
            initialPlayballButton: document.getElementById('initial-playball-button'),
            ball: document.getElementById('baseball'),
            strikeZone: document.getElementById('strike-zone'), 
            pitchMarkers: document.getElementById('pitch-markers'),
            field: document.getElementById('field'), 
            scoreEffect: document.getElementById('score-effect'),
            pitchResult: document.getElementById('pitch-result'),
            pitchInfo: document.getElementById('pitch-info'), 
            ballDots: document.getElementById('ball-dots'),
            strikeDots: document.getElementById('strike-dots'), 
            outDots: document.getElementById('out-dots'),
            fullScoreboard: document.getElementById('full-scoreboard'),
            bases: [document.getElementById('base-1b'), document.getElementById('base-2b'), document.getElementById('base-3b')],
            animationStyle: document.getElementById('pitch-animation-style')
        };
        
        const getInitialGameState = () => ({
            isPitching: false, inning: 1, half: 'Top', 
            bso: { b: 0, s: 0, o: 0 }, 
            runners: [false, false, false], 
            teams: { 
                away: { name: 'AWAY', inningScores: Array(12).fill(null), R: 0, H: 0, E: 0, BB: 0 }, 
                home: { name: 'HOME', inningScores: Array(12).fill(null), R: 0, H: 0, E: 0, BB: 0 } 
            },
            regularInnings: 9, 
            maxInnings: 12
        });

        let gameState = getInitialGameState();
        let isGameActive = false;
        let isTutorialActive = false;

        const BALL_DIAMETER = 4.5;
        const FINAL_SCALE = 3.5;

        const PITCH_TYPES = {
            FOUR_SEAM:  { name: '4-Seam Fastball', speedRange: [152, 168] },
            TWO_SEAM:   { name: '2-Seam Fastball', speedRange: [148, 160] },
            SWEEPER:    { name: 'Sweeper',         speedRange: [125, 135] },
            SLIDER:     { name: 'Slider',          speedRange: [135, 145] },
            CHANGEUP:   { name: 'Changeup',        speedRange: [130, 140] },
            FORKBALL:   { name: 'Forkball',        speedRange: [128, 138] },
            CURVEBALL:  { name: 'Curveball',       speedRange: [115, 130] },
        };
        
        // This is no longer used by the core logic but kept for UI flow
        const DIFFICULTY_SETTINGS = {
            easy:    { speedModifier: -20, durationModifier: 1.3 },
            normal:  { speedModifier: -10, durationModifier: 1.1 },
            hard:    { speedModifier: 0,   durationModifier: 0.95 },
            extreme: { speedModifier: 15,  durationModifier: 0.8 }
        };
        let currentDifficulty = DIFFICULTY_SETTINGS.normal; 
        function setDifficulty(level) {
            currentDifficulty = DIFFICULTY_SETTINGS[level];
        }
        
        // MODIFIED: Simplified animation duration calculation
        function calculateAnimationDuration(speed) { 
            const baseSpeed = 150; 
            const baseDuration = 460;
            return Math.round(baseDuration * (baseSpeed / speed));
        }

        function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
        function getQuadraticBezierPoint(t, p0, p1, p2) { const x = Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x; const y = Math.pow(1 - t, 2) * p0.y + 2 * (1 - t) * t * p1.y + Math.pow(t, 2) * p2.y; return { x, y }; }
        
        // MODIFIED: Pitch break points updated from snippet
        function createPitchAnimation(target, pitchTypeInfo) {
            const startX = elements.ball.offsetLeft; const startY = elements.ball.offsetTop;
            const endX = target.finalLeft; const endY = target.finalTop;
            const p0 = { x: startX, y: startY }; const p2 = { x: endX, y: endY };
            let p1; let breakX, breakY;
            switch (pitchTypeInfo.name) {
                case 'Curveball': breakX = (startX + endX) / 2 - 80; breakY = (startY + endY) / 2 - 40; break;
                case 'Slider': breakX = (startX + endX) / 2 - 70; breakY = endY - 20; break;
                case 'Sweeper': breakX = (startX + endX) / 2 - 100; breakY = endY - 15; break;
                case 'Forkball': breakX = (startX + endX) / 2 + 25; breakY = (startY + endY) / 2 - 90; break;
                case 'Changeup': breakX = (startX + endX) / 2 + 40; breakY = (startY + endY) / 2 - 70; break;
                case '2-Seam Fastball': breakX = (startX + endX) / 2 + 40; breakY = (startY + endY) / 2 + 20; break;
                default: breakX = (startX + endX) / 2; breakY = (startY + endY) / 2 - 30; break;
            }
            p1 = { x: breakX, y: breakY }; let keyframes = '@keyframes pitch-move {'; const steps = 20;
            for (let i = 0; i <= steps; i++) {
                const t = i / steps; const point = getQuadraticBezierPoint(t, p0, p1, p2);
                const scale = 1 + (FINAL_SCALE - 1) * t;
                keyframes += `${t * 100}% { top: ${point.y}px; left: ${point.x}px; transform: scale(${scale}); }`;
            }
            keyframes += '}'; elements.animationStyle.innerHTML = keyframes;
        }
        
        // ADDED: getStrikeZoneRect to support new logic
        function getStrikeZoneRect() {
            const style = getComputedStyle(elements.strikeZone);
            const rect = { left: parseFloat(style.left), top: parseFloat(style.top), width: parseFloat(style.width), height: parseFloat(style.height) };
            rect.right = rect.left + rect.width; rect.bottom = rect.top + rect.height;
            return rect;
        }

        // ADDED: New pitch result logic from snippet
        function decidePitchResult() {
            const szRect = getStrikeZoneRect();
            const targetArea = { left: szRect.left - 40, right: szRect.right + 40, top: szRect.top - 40, bottom: szRect.bottom + 40 };
            const randomX = Math.random() * (targetArea.right - targetArea.left) + targetArea.left;
            const randomY = Math.random() * (targetArea.bottom - targetArea.top) + targetArea.top;

            const ballLeft = randomX;
            const ballRight = ballLeft + BALL_DIAMETER * FINAL_SCALE;
            const ballTop = randomY;
            const ballBottom = ballTop + BALL_DIAMETER * FINAL_SCALE;
            
            const isStrikeLocation = !(ballRight < szRect.left || ballLeft > szRect.right || ballBottom < szRect.top || ballTop > szRect.bottom);

            let result;
            const rand = Math.random();
            if (isStrikeLocation) {
                if (rand < 0.60) result = { type: 'STRIKE' };
                else if (rand < 0.85) result = { type: 'OUT' };
                else if (rand < 0.97) result = { type: 'HIT', value: 1 };
                else if (rand < 0.99) result = { type: 'HIT', value: 2 };
                else result = { type: 'HIT', value: 4 };
            } else {
                result = { type: 'BALL' };
            }
            
            const pitchRand = Math.random();
            let pitchTypeInfo;
            if (pitchRand < 0.35) pitchTypeInfo = PITCH_TYPES.FOUR_SEAM; else if (pitchRand < 0.50) pitchTypeInfo = PITCH_TYPES.SLIDER;
            else if (pitchRand < 0.65) pitchTypeInfo = PITCH_TYPES.TWO_SEAM; else if (pitchRand < 0.75) pitchTypeInfo = PITCH_TYPES.SWEEPER;
            else if (pitchRand < 0.85) pitchTypeInfo = PITCH_TYPES.CURVEBALL; else if (pitchRand < 0.95) pitchTypeInfo = PITCH_TYPES.CHANGEUP;
            else pitchTypeInfo = PITCH_TYPES.FORKBALL;

            const speed = getRandomInt(pitchTypeInfo.speedRange[0], pitchTypeInfo.speedRange[1]);
            const target = { finalLeft: randomX, finalTop: randomY };
            return { target, result, pitchTypeInfo, speed };
        }
        
        // ADDED: showPitchMarker function from snippet
        function showPitchMarker(target, isStrike) {
            const marker = document.createElement('div');
            marker.className = `pitch-marker ${isStrike ? 'strike' : 'ball'}`;
            marker.style.left = `${target.finalLeft}px`;
            marker.style.top = `${target.finalTop}px`;
            elements.pitchMarkers.appendChild(marker);
            setTimeout(() => marker.remove(), 1500);
        }

        // REPLACED: Core game loop with simpler, non-interactive version
        function executePitch() {
            if (!isGameActive || gameState.isPitching) return;
            gameState.isPitching = true;
            
            if (gameState.half === 'Bot') {
                elements.pitchButton.disabled = true;
            }

            resetBallPosition();
            elements.strikeZone.style.opacity = '0';
            
            const { target, result, pitchTypeInfo, speed } = decidePitchResult();
            const animationDuration = calculateAnimationDuration(speed);
            
            createPitchAnimation(target, pitchTypeInfo);
            elements.ball.style.animation = `pitch-move ${animationDuration / 1000}s linear forwards`;
            
            const isStrike = (result.type === 'STRIKE' || result.type === 'OUT' || result.type === 'HIT');
            showPitchMarker(target, isStrike);
            if (isStrike) elements.strikeZone.classList.add('strike-hit');
            
            setTimeout(() => {
                if (!isGameActive) return;
                elements.strikeZone.classList.remove('strike-hit');
                handlePitchResult(result, pitchTypeInfo, speed);
                gameState.isPitching = false;

                if (gameState.bso.o >= 3) {
                    setTimeout(() => { if (isGameActive) changeInning(); }, 1500);
                } else {
                    if (gameState.half === 'Top') { // AI's turn, loop automatically
                        setTimeout(executePitch, 1200);
                    } else { // Player's turn, re-enable button
                        elements.pitchButton.disabled = false;
                    }
                }
            }, animationDuration + 250);

            setTimeout(() => {
                if (!isGameActive) return;
                elements.strikeZone.style.opacity = '1';
            }, 1500);
        }

        // REPLACED: Pitch result handler with simpler version from snippet
        function handlePitchResult(result, pitchTypeInfo, speed) {
            if (!isGameActive && !isTutorialActive) return false;
            const currentTeam = gameState.half === 'Top' ? 'away' : 'home';
            const opponentTeam = gameState.half === 'Top' ? 'home' : 'away';
            let displayText = '';
            let atBatEnded = false;

            elements.pitchInfo.textContent = `${Math.round(speed)} km/h ${pitchTypeInfo.name}`;

            switch (result.type) {
                case 'STRIKE':
                    gameState.bso.s++;
                    displayText = 'STRIKE!';
                    break;
                case 'BALL':
                    gameState.bso.b++;
                    displayText = 'BALL';
                    break;
                case 'OUT':
                    if (Math.random() < 0.15) { // Fielding Error
                        gameState.teams[opponentTeam].E++;
                        displayText = 'FIELDING ERROR!';
                        handleAdvancement(1, false);
                    } else {
                        gameState.bso.o++;
                        displayText = 'OUT!';
                    }
                    resetBSCount();
                    atBatEnded = true;
                    break;
                case 'HIT':
                    gameState.teams[currentTeam].H++;
                    displayText = result.value === 4 ? 'HOME RUN!' : (result.value === 1 ? 'SINGLE!' : 'DOUBLE!');
                    handleAdvancement(result.value, false);
                    resetBSCount();
                    atBatEnded = true;
                    break;
            }

            if (gameState.bso.s >= 3) {
                displayText = 'STRIKEOUT!';
                gameState.bso.o++;
                resetBSCount();
                atBatEnded = true;
            } else if (gameState.bso.b >= 4) {
                displayText = 'WALK';
                gameState.teams[currentTeam].BB++;
                handleAdvancement(1, true);
                resetBSCount();
                atBatEnded = true;
            }
            
            elements.pitchResult.textContent = displayText;
            if (!isTutorialActive) updateUI();
            
            return atBatEnded;
        }
        
        function showTurnMessage(message, callback) {
            elements.turnMessage.textContent = message;
            elements.turnOverlay.style.display = 'flex';
            elements.turnOverlay.style.animation = 'none';
            void elements.turnOverlay.offsetHeight; 
            elements.turnOverlay.style.animation = 'fadeOverlay 1.5s forwards';

            setTimeout(() => {
                elements.turnOverlay.style.display = 'none';
                setTimeout(() => { if (isGameActive) callback(); }, 500);
            }, 1500);
        }

        // MODIFIED: Starts the new automated game loop
        function startGameTurn() {
            if (!isGameActive) return;
            if (gameState.half === 'Top') {
                showTurnMessage("AI TURN", executePitch);
            } else {
                showTurnMessage("YOUR TURN", () => {
                    elements.pitchButton.style.display = 'block';
                    elements.pitchButton.disabled = false;
                    gameState.isPitching = false;
                    elements.pitchResult.textContent = 'Ready to bat!';
                });
            }
        }
        
        function changeInning() {
            if (!isGameActive) return;
            const currentTeam = gameState.half === 'Top' ? 'away' : 'home';
            const currentInning = gameState.inning - 1;
            if (gameState.teams[currentTeam].inningScores[currentInning] === null) {
                gameState.teams[currentTeam].inningScores[currentInning] = 0;
            }
            
            const homeScore = gameState.teams.home.R;
            const awayScore = gameState.teams.away.R;
            
            if ( (gameState.inning >= gameState.regularInnings && gameState.half === 'Top' && homeScore !== awayScore) || 
                 (gameState.inning > gameState.maxInnings) ) {
                endGame();
                return;
            }

            gameState.bso = { b: 0, s: 0, o: 0 };
            gameState.runners = [false, false, false];
            
            if (gameState.half === 'Top') {
                gameState.half = 'Bot';
                if (gameState.inning >= gameState.regularInnings && homeScore > awayScore) {
                     setTimeout(() => { if (isGameActive) endGame(); }, 500);
                     return;
                }
            } else {
                gameState.half = 'Top';
                gameState.inning++;
            }
            
            updateUI();
            
            setTimeout(() => {
                if (isGameActive) startGameTurn();
            }, 1500);
        }
        
        function endGame(isColdGame = false) {
            isGameActive = false;
            elements.pitchButton.style.display = 'none'; 
            elements.pitchButton.disabled = true;

            const homeScore = gameState.teams.home.R; 
            const awayScore = gameState.teams.away.R;
            
            let resultMessage = '';
            let playerWon = false;
            
            elements.gameResultTitle.classList.remove('win', 'lose');

            if (isColdGame) {
                resultMessage = 'YOU LOSE!';
                playerWon = false;
                elements.gameResultTitle.classList.add('lose');
            } else {
                 if (homeScore > awayScore) {
                    resultMessage = 'YOU WIN!';
                    playerWon = true;
                    elements.gameResultTitle.classList.add('win');
                } else if (awayScore > homeScore) {
                    resultMessage = 'YOU LOSE!';
                    playerWon = false;
                    elements.gameResultTitle.classList.add('lose');
                } else {
                    resultMessage = 'DRAW GAME!';
                }
            }
            
            elements.gameResultTitle.textContent = resultMessage;
            elements.finalScoreDisplay.textContent = `AWAY ${awayScore} : ${homeScore} HOME`;
            
            elements.finalScoreboardContainer.innerHTML = ''; 
            const finalBoardWrapper = document.createElement('div');
            const finalBoard = elements.fullScoreboard.cloneNode(true);
            finalBoardWrapper.appendChild(finalBoard);

            if (!isColdGame && homeScore !== awayScore) {
                const homeTeamRow = finalBoard.querySelector(`.home-team-row .team-name`);
                const awayTeamRow = finalBoard.querySelector(`.away-team-row .team-name`);
                if(playerWon) {
                    if(homeTeamRow) homeTeamRow.innerHTML += ' <span class="result-indicator result-win">WIN</span>';
                    if(awayTeamRow) awayTeamRow.innerHTML += ' <span class="result-indicator result-lose">LOSE</span>';
                } else {
                    if(homeTeamRow) homeTeamRow.innerHTML += ' <span class="result-indicator result-lose">LOSE</span>';
                    if(awayTeamRow) awayTeamRow.innerHTML += ' <span class="result-indicator result-win">WIN</span>';
                }
            }

            elements.finalScoreboardContainer.appendChild(finalBoardWrapper);
            elements.gameOverScreen.style.display = 'flex';
        }

        function resetGame() {
            isGameActive = false;
            
            gameState = getInitialGameState();
            
            elements.gameOverScreen.style.display = 'none';
            elements.titleScreen.style.display = 'flex';
            elements.titleScreen.style.animation = 'none';
            elements.difficultyScreen.style.display = 'none';
            elements.inningSelectionScreen.style.display = 'none';
            elements.gameContainer.style.display = 'none';
            elements.playballOverlay.style.display = 'none';
            
            elements.pitchButton.style.display = 'none';

            elements.pitchResult.textContent = 'PLAY BALL!';
            elements.pitchInfo.textContent = '';
            
            updateUI(); 
        }

        function showScoreEffect(runs) {
            const effectEl = elements.scoreEffect;
            effectEl.textContent = `+${runs} RUN${runs > 1 ? 'S' : ''}!`;

            effectEl.classList.remove('score-anim');
            void effectEl.offsetWidth; 
            effectEl.classList.add('score-anim');
        }
        
        // REPLACED: Base advancement logic with simpler station-to-station version
        function handleAdvancement(basesToAdvance, isWalk = false) {
            if (!isGameActive) return;
            const currentTeam = gameState.half === 'Top' ? 'away' : 'home';
            let runsScored = 0;
            
            if (isWalk) {
                if (gameState.runners[0] && gameState.runners[1] && gameState.runners[2]) {
                    runsScored++;
                } else if (gameState.runners[0] && gameState.runners[1]) {
                    gameState.runners[2] = true;
                } else if (gameState.runners[0]) {
                    gameState.runners[1] = true;
                }
                gameState.runners[0] = true;
            } else {
                const newRunners = [false, false, false];
                for (let i = 2; i >= 0; i--) {
                    if (gameState.runners[i]) {
                        const nextBase = i + basesToAdvance;
                        if (nextBase >= 3) runsScored++;
                        else newRunners[nextBase] = true;
                    }
                }
                if (basesToAdvance >= 4) {
                    runsScored++;
                } else if (basesToAdvance > 0) {
                    newRunners[basesToAdvance - 1] = true;
                }
                gameState.runners = newRunners;
            }
            
            if (runsScored > 0) {
                gameState.teams[currentTeam].R += runsScored;
                const currentInning = gameState.inning - 1;
                if (gameState.teams[currentTeam].inningScores[currentInning] === null) {
                    gameState.teams[currentTeam].inningScores[currentInning] = 0;
                }
                gameState.teams[currentTeam].inningScores[currentInning] += runsScored;
                showScoreEffect(runsScored);
            }
            
            if (gameState.half === 'Bot' && gameState.inning >= gameState.regularInnings && gameState.teams.home.R > gameState.teams.away.R) {
                setTimeout(() => { if (isGameActive) endGame(); }, 500);
            }
        }
        function resetBSCount() { gameState.bso.b = 0; gameState.bso.s = 0; }
        function initBSODots() {
            elements.ballDots.innerHTML = '';
            elements.strikeDots.innerHTML = '';
            elements.outDots.innerHTML = '';
            for (let i = 0; i < 3; i++) elements.ballDots.appendChild(Object.assign(document.createElement('div'), { className: 'dot dot-b' }));
            for (let i = 0; i < 2; i++) elements.strikeDots.appendChild(Object.assign(document.createElement('div'), { className: 'dot dot-s' }));
            for (let i = 0; i < 3; i++) elements.outDots.appendChild(Object.assign(document.createElement('div'), { className: 'dot dot-o' }));
        }
        function updateBSODots() {
            const { b, s, o } = gameState.bso;
            Array.from(elements.ballDots.children).forEach((dot, i) => dot.classList.toggle('active', i < b));
            Array.from(elements.strikeDots.children).forEach((dot, i) => dot.classList.toggle('active', i < s));
            Array.from(elements.outDots.children).forEach((dot, i) => dot.classList.toggle('active', i < o));
        }

        // MODIFIED: Updated grid-template-columns to match snippet
        function updateFullScoreboard() {
            elements.fullScoreboard.innerHTML = ''; 
            
            const headerRow = document.createElement('div');
            headerRow.className = 'scoreboard-row header-row';
            
            let gridTemplateColumns = `4fr repeat(${gameState.maxInnings}, 1fr) 2fr 2fr 2fr 2fr`;
            let headerHTML = `<div class="cell team-name">TEAM</div>`;

            for(let i = 1; i <= gameState.maxInnings; i++) {
                const isExtra = i > gameState.regularInnings ? ' extra-inning' : '';
                headerHTML += `<div class="cell inning-${i}${isExtra}">${i}</div>`;
            }
            headerHTML += `<div class="cell stat-r">R</div><div class="cell stat-h">H</div><div class="cell stat-e">E</div><div class="cell stat-b">B</div>`;
            
            headerRow.style.gridTemplateColumns = gridTemplateColumns;
            headerRow.innerHTML = headerHTML;
            elements.fullScoreboard.appendChild(headerRow);

            ['away', 'home'].forEach(team => {
                const teamState = gameState.teams[team];
                const row = document.createElement('div');
                row.className = `scoreboard-row ${team}-team-row`;
                row.style.gridTemplateColumns = gridTemplateColumns;
                if (team === 'home') row.id = 'home-row';

                let html = `<div class="cell team-name">${teamState.name}</div>`;
                for (let i = 0; i < gameState.maxInnings; i++) {
                    const score = teamState.inningScores[i];
                    let displayValue = '';
                    const isCurrentInning = (i === gameState.inning - 1);
                    const isBattingNow = (team === 'away' && gameState.half === 'Top') || (team === 'home' && gameState.half === 'Bot');
                    
                    if (score !== null) {
                        displayValue = score;
                    } else if (isGameActive && isCurrentInning && isBattingNow) {
                        displayValue = 0;
                    }
                    html += `<div class="cell inning-${i + 1}">${displayValue}</div>`;
                }
                html += `<div class="cell stat-r">${teamState.R}</div>`;
                html += `<div class="cell stat-h">${teamState.H}</div>`;
                html += `<div class="cell stat-e">${teamState.E}</div>`;
                html += `<div class="cell stat-b">${teamState.BB}</div>`;
                row.innerHTML = html;
                elements.fullScoreboard.appendChild(row);
            });
        }

        function resetBallPosition() {
            elements.ball.style.animation = ''; elements.ball.style.top = `calc(20% - ${BALL_DIAMETER / 2}px)`;
            elements.ball.style.left = `calc(50% - ${BALL_DIAMETER / 2}px)`; elements.ball.style.transform = 'scale(1)';
            elements.ball.offsetHeight;
        }
        function updateUI() { updateBSODots(); gameState.runners.forEach((hasRunner, i) => elements.bases[i].classList.toggle('runner-on', hasRunner)); updateFullScoreboard(); }
        
        function init() { 
            initBSODots(); 
            
            elements.gameStartButton.addEventListener('click', () => {
                elements.titleScreen.style.animation = 'fadeOutScreen 0.5s forwards';
                setTimeout(() => {
                    elements.titleScreen.style.display = 'none';
                    elements.titleScreen.style.animation = '';
                    elements.difficultyScreen.style.display = 'flex';
                }, 500);
            });

            elements.difficultyButtons.forEach(button => {
                button.addEventListener('click', () => {
                    setDifficulty(button.dataset.difficulty);
                    elements.difficultyScreen.style.animation = 'fadeOutScreen 0.5s forwards';
                    setTimeout(() => {
                        elements.difficultyScreen.style.display = 'none';
                        elements.difficultyScreen.style.animation = '';
                        elements.inningSelectionScreen.style.display = 'flex';
                    }, 500);
                });
            });

            elements.inningButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const innings = parseInt(button.dataset.innings, 10);
                    gameState.regularInnings = innings;
                    switch(innings) {
                        case 3: gameState.maxInnings = 5; break;
                        case 6: gameState.maxInnings = 9; break;
                        case 9: gameState.maxInnings = 12; break;
                    }
                    gameState.teams.away.inningScores = Array(gameState.maxInnings).fill(null);
                    gameState.teams.home.inningScores = Array(gameState.maxInnings).fill(null);

                    elements.inningSelectionScreen.style.animation = 'fadeOutScreen 0.5s forwards';
                    setTimeout(() => {
                        elements.inningSelectionScreen.style.display = 'none';
                        elements.inningSelectionScreen.style.animation = '';
                        elements.gameContainer.style.display = 'block';
                        elements.playballOverlay.style.display = 'flex';
                        isGameActive = true;
                        updateUI();
                    }, 500);
                });
            });

            elements.initialPlayballButton.addEventListener('click', () => {
                if (isGameActive) {
                    elements.playballOverlay.style.animation = 'fadeOutScreen 0.5s forwards';
                    setTimeout(() => {
                        elements.playballOverlay.style.display = 'none';
                        elements.playballOverlay.style.animation = '';
                         startGameTurn();
                    }, 500);
                }
            });
            
            // MODIFIED: Pitch button listener now calls the new game loop
            elements.pitchButton.addEventListener('click', () => {
                if (isGameActive && gameState.half === 'Bot' && !gameState.isPitching) {
                    executePitch();
                }
            });
            
            elements.playAgainButton.addEventListener('click', resetGame);
            
            elements.tutorialButton.addEventListener('click', () => {
                elements.difficultyScreen.style.animation = 'fadeOutScreen 0.5s forwards';
                setTimeout(() => {
                    elements.difficultyScreen.style.display = 'none';
                    elements.difficultyScreen.style.animation = '';
                    startTutorial();
                }, 500);
            });
            
            updateUI();
        }
        init();

        // --- 튜토리얼 관련 함수 (Now non-functional due to logic changes) ---
        let tutorialPitchCount = 0;
        const totalTutorialPitches = 5;
        const tutorialMessages = [
            "Welcome to the Batting Tutorial!\n(NOTE: This mode is non-functional with the current game logic)",
            "A pitch will be thrown from the center.\nYour goal is to click the ball right as it enters the strike zone (the dotted box).",
            `You will get ${totalTutorialPitches} practice pitches.\nLet's start!`,
            "Great! Let's try again.",
            "Tutorial complete!\nYou're ready for a real game."
        ];

        function startTutorial() {
            isTutorialActive = true;
            elements.gameContainer.style.display = 'block';
            elements.gameContainer.classList.add('tutorial-mode');
            elements.tutorialOverlay.style.display = 'flex';
            tutorialPitchCount = 0;
            currentTutorialStep = 0;
            showTutorialStep(currentTutorialStep);
        }

        function showTutorialStep(stepIndex) {
            elements.tutorialMessage.textContent = tutorialMessages[stepIndex];
            elements.tutorialNextButton.textContent = "NEXT";
            
            if (stepIndex === 2) {
                elements.tutorialNextButton.textContent = "START BATTING PRACTICE";
            } else if (stepIndex >= tutorialMessages.length -1) {
                elements.tutorialNextButton.textContent = "FINISH";
            }
        }

        elements.tutorialNextButton.addEventListener('click', () => {
            currentTutorialStep++;

            if (currentTutorialStep === tutorialMessages.length - 2) { 
                 elements.tutorialOverlay.style.display = 'none';
                 runTutorialPitch();
            } else if (currentTutorialStep >= tutorialMessages.length) { 
                endTutorial();
            } else {
                showTutorialStep(currentTutorialStep);
            }
        });

        function runTutorialPitch() {
            if (tutorialPitchCount >= totalTutorialPitches) {
                elements.tutorialOverlay.style.display = 'flex';
                showTutorialStep(tutorialMessages.length - 1);
                return;
            }
            tutorialPitchCount++;
            elements.pitchResult.textContent = `PRACTICE SWING: ${tutorialPitchCount} / ${totalTutorialPitches}`;
            
            // This part is broken as the swing handler logic has been removed from the main game.
            alert("Tutorial is not functional with the new game mechanics.");
            setTimeout(runTutorialPitch, 1000);
        }

        function endTutorial() {
            isTutorialActive = false;
            elements.gameContainer.style.display = 'none';
            elements.gameContainer.classList.remove('tutorial-mode');
            elements.tutorialOverlay.style.display = 'none';
            resetGame();
        }
    });
</script>
</body>
</html>