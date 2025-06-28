document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        pitchButton: document.getElementById('pitch-button'), ball: document.getElementById('baseball'),
        strikeZone: document.getElementById('strike-zone'), pitchMarkers: document.getElementById('pitch-markers'),
        pitchResult: document.getElementById('pitch-result'),
        pitchInfo: document.getElementById('pitch-info'),
        ballDots: document.getElementById('ball-dots'), strikeDots: document.getElementById('strike-dots'),
        outDots: document.getElementById('out-dots'), awayRow: document.getElementById('away-row'),
        homeRow: document.getElementById('home-row'),
        bases: [document.getElementById('base-1b'), document.getElementById('base-2b'), document.getElementById('base-3b')],
        animationStyle: document.getElementById('pitch-animation-style')
    };

    let gameState = {
        isPitching: false, inning: 1, half: 'Top',
        bso: { b: 0, s: 0, o: 0 },
        runners: [false, false, false],
        teams: {
            away: { name: 'AWAY', inningScores: Array(12).fill(null), R: 0, H: 0, E: 0, BB: 0 },
            home: { name: 'HOME', inningScores: Array(12).fill(null), R: 0, H: 0, E: 0, BB: 0 }
        }
    };

    // --- [핵심 수정] 공 크기(지름)를 CSS와 일치 ---
    const BALL_DIAMETER = 4.5; // 3 -> 4.5
    
    const PITCH_TYPES = {
        FOUR_SEAM:  { name: '4-Seam Fastball', speedRange: [152, 168] },
        TWO_SEAM:   { name: '2-Seam Fastball', speedRange: [148, 160] },
        SWEEPER:    { name: 'Sweeper',         speedRange: [125, 135] },
        SLIDER:     { name: 'Slider',          speedRange: [135, 145] },
        CHANGEUP:   { name: 'Changeup',        speedRange: [130, 140] },
        FORKBALL:   { name: 'Forkball',        speedRange: [128, 138] },
        CURVEBALL:  { name: 'Curveball',       speedRange: [115, 130] },
    };

    function calculateAnimationDuration(speed) {
        const baseSpeed = 150;
        const baseDuration = 460; 
        return Math.round(baseDuration * (baseSpeed / speed));
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getQuadraticBezierPoint(t, p0, p1, p2) {
        const x = Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x;
        const y = Math.pow(1 - t, 2) * p0.y + 2 * (1 - t) * t * p1.y + Math.pow(t, 2) * p2.y;
        return { x, y };
    }
    
    function createPitchAnimation(target, pitchTypeInfo) {
        const startX = elements.ball.offsetLeft;
        const startY = elements.ball.offsetTop;
        const endX = target.finalLeft;
        const endY = target.finalTop;
        
        const p0 = { x: startX, y: startY };
        const p2 = { x: endX, y: endY };
        let p1;

        let breakX, breakY;

        switch (pitchTypeInfo.name) {
            case PITCH_TYPES.CURVEBALL.name:
                breakX = (startX + endX) / 2 - 80; 
                breakY = (startY + endY) / 2 - 40; 
                break;
            case PITCH_TYPES.SLIDER.name:
                breakX = (startX + endX) / 2 - 70; 
                breakY = endY - 20; 
                break;
            case PITCH_TYPES.SWEEPER.name:
                breakX = (startX + endX) / 2 - 100;
                breakY = endY - 15;
                break;
            case PITCH_TYPES.FORKBALL.name:
                breakX = (startX + endX) / 2 + 25;
                breakY = (startY + endY) / 2 - 90;
                break;
            case PITCH_TYPES.CHANGEUP.name:
                breakX = (startX + endX) / 2 + 40;
                breakY = (startY + endY) / 2 - 70;
                break;
            case PITCH_TYPES.TWO_SEAM.name:
                breakX = (startX + endX) / 2 + 40; 
                breakY = (startY + endY) / 2 + 20;
                break;
            default: // FOUR_SEAM
                breakX = (startX + endX) / 2; 
                breakY = (startY + endY) / 2 - 30;
                break;
        }
        
        p1 = { x: breakX, y: breakY };

        let keyframes = '@keyframes pitch-move {';
        const steps = 20;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const point = getQuadraticBezierPoint(t, p0, p1, p2);
            const scale = 1 + (2.5 * t);
            keyframes += `
                ${t * 100}% {
                    top: ${point.y}px;
                    left: ${point.x}px;
                    transform: scale(${scale});
                }
            `;
        }
        keyframes += '}';
        
        elements.animationStyle.innerHTML = keyframes;
    }
    
    // --- [핵심 수정] 판정 로직을 "위치 판정"과 "결과 판정"으로 분리하여 직관성 향상 ---
    function decidePitchResult() {
        const szLeft = elements.strikeZone.offsetLeft;
        const szTop = elements.strikeZone.offsetTop;
        const szRight = szLeft + elements.strikeZone.offsetWidth;
        const szBottom = szTop + elements.strikeZone.offsetHeight;
        const szRect = { left: szLeft, right: szRight, top: szTop, bottom: szBottom };

        const targetArea = { left: szRect.left - 40, right: szRect.right + 40, top: szRect.top - 40, bottom: szRect.bottom + 40 };
        const randomX = Math.random() * (targetArea.right - targetArea.left) + targetArea.left;
        const randomY = Math.random() * (targetArea.bottom - targetArea.top) + targetArea.top;

        // 1. 위치 판정: 공의 일부라도 존에 겹치면 스트라이크 존 통과로 간주
        const ballLeft = randomX;
        const ballRight = ballLeft + BALL_DIAMETER;
        const ballTop = randomY;
        const ballBottom = ballTop + BALL_DIAMETER;

        const isStrikeLocation = !(ballRight < szRect.left || ballLeft > szRect.right || ballBottom < szRect.top || ballTop > szRect.bottom);

        // 2. 결과 판정: 위치에 따라 다른 확률 적용
        let result;
        const rand = Math.random();
        if (isStrikeLocation) {
            // 스트라이크 존으로 통과했을 때의 결과
            if (rand < 0.60) result = { type: 'STRIKE' };      // 60% 확률로 스트라이크
            else if (rand < 0.85) result = { type: 'OUT' };    // 25% 확률로 아웃
            else if (rand < 0.97) result = { type: 'HIT', value: 1 }; // 12% 확률로 1루타
            else if (rand < 0.99) result = { type: 'HIT', value: 2 }; // 2% 확률로 2루타
            else result = { type: 'HIT', value: 4 };           // 1% 확률로 홈런
        } else {
            // 스트라이크 존을 벗어났을 때는 무조건 볼
            result = { type: 'BALL' };
        }
        
        const pitchRand = Math.random();
        let pitchTypeInfo;
        if      (pitchRand < 0.35) pitchTypeInfo = PITCH_TYPES.FOUR_SEAM;
        else if (pitchRand < 0.50) pitchTypeInfo = PITCH_TYPES.SLIDER;
        else if (pitchRand < 0.65) pitchTypeInfo = PITCH_TYPES.TWO_SEAM;
        else if (pitchRand < 0.75) pitchTypeInfo = PITCH_TYPES.SWEEPER;
        else if (pitchRand < 0.85) pitchTypeInfo = PITCH_TYPES.CURVEBALL;
        else if (pitchRand < 0.95) pitchTypeInfo = PITCH_TYPES.CHANGEUP;
        else                       pitchTypeInfo = PITCH_TYPES.FORKBALL;

        const speed = getRandomInt(pitchTypeInfo.speedRange[0], pitchTypeInfo.speedRange[1]);
        const target = { finalLeft: randomX, finalTop: randomY };
        return { target, result, pitchTypeInfo, speed };
    }
    
    function mainPitch() {
        if (gameState.isPitching) return;
        gameState.isPitching = true;
        elements.pitchButton.disabled = true;
        elements.pitchResult.textContent = '...';
        elements.pitchInfo.textContent = '';
        resetBallPosition();

        const { target, result, pitchTypeInfo, speed } = decidePitchResult();
        const animationDuration = calculateAnimationDuration(speed);
        
        createPitchAnimation(target, pitchTypeInfo);
        elements.ball.style.animation = `pitch-move ${animationDuration / 1000}s linear forwards`;
        
        const isStrike = (result.type === 'STRIKE' || result.type === 'OUT' || result.type === 'HIT');
        showPitchMarker(target, isStrike);
        if (isStrike) elements.strikeZone.classList.add('strike-hit');
        
        setTimeout(() => {
            handlePitchResult(result, pitchTypeInfo, speed);
            elements.strikeZone.classList.remove('strike-hit');
        }, animationDuration);
    }

    function handlePitchResult(result, pitchTypeInfo, speed) {
        const currentTeam = gameState.half === 'Top' ? 'away' : 'home';
        const opponentTeam = gameState.half === 'Top' ? 'home' : 'away';
        let displayText = '';

        elements.pitchInfo.textContent = `${pitchTypeInfo.name} - ${speed} km/h`;

        switch (result.type) {
            case 'STRIKE': gameState.bso.s++; displayText = 'STRIKE!'; break;
            case 'BALL': gameState.bso.b++; displayText = 'BALL'; break;
            case 'OUT':
                if (Math.random() < 0.15) {
                    gameState.teams[opponentTeam].E++; displayText = 'FIELDING ERROR!';
                    handleAdvancement(1, false);
                } else {
                    gameState.bso.o++; displayText = 'OUT!';
                }
                resetBSCount();
                break;
            case 'HIT':
                gameState.teams[currentTeam].H++;
                displayText = result.value === 4 ? 'HOME RUN!' : (result.value === 1 ? 'SINGLE!' : (result.value === 2 ? 'DOUBLE!' : 'TRIPLE!'));
                handleAdvancement(result.value, false);
                resetBSCount();
                break;
        }
        if (gameState.bso.b >= 4) {
            displayText = 'WALK'; gameState.teams[currentTeam].BB++;
            handleAdvancement(1, true); resetBSCount();
        }
        if (gameState.bso.s >= 3) {
            displayText = 'STRIKEOUT!'; gameState.bso.o++; resetBSCount();
        }
        elements.pitchResult.textContent = displayText;
        updateUI();
        if (gameState.bso.o >= 3) {
            setTimeout(changeInning, 1500);
        } else {
            gameState.isPitching = false;
            elements.pitchButton.disabled = false;
        }
    }

    function getOrdinal(n) {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }

    function changeInning() {
        const currentTeam = gameState.half === 'Top' ? 'away' : 'home';
        const currentInning = gameState.inning - 1;
        if (gameState.teams[currentTeam].inningScores[currentInning] === null) {
            gameState.teams[currentTeam].inningScores[currentInning] = 0;
        }
        gameState.bso = { b: 0, s: 0, o: 0 };
        gameState.runners = [false, false, false];
        if (gameState.half === 'Top') {
            gameState.half = 'Bot';
        } else {
            gameState.half = 'Top'; 
            gameState.inning++;
        }
        if (gameState.inning > 12) {
            endGame(); return;
        }
        const inningDisplay = getOrdinal(gameState.inning);
        elements.pitchResult.textContent = `${gameState.half} of the ${inningDisplay}`;
        updateUI();
        setTimeout(() => {
            elements.pitchResult.textContent = 'Next Batter';
            gameState.isPitching = false;
            elements.pitchButton.disabled = false;
        }, 1500);
    }
    
    function endGame() {
        elements.pitchButton.disabled = true;
        const homeScore = gameState.teams.home.R; 
        const awayScore = gameState.teams.away.R;
        let message = `Final Score\nAWAY ${awayScore} : ${homeScore} HOME\n\n`;
        if (homeScore > awayScore) {
            message += 'HOME TEAM WINS!';
        } else if (awayScore > homeScore) {
            message += 'AWAY TEAM WINS!';
        } else {
            message += 'DRAW GAME!';
        }
        elements.pitchResult.textContent = `GAME OVER`;
        alert(message);
    }
    
    function handleAdvancement(basesToAdvance, isWalk = false) {
        const currentTeam = gameState.half === 'Top' ? 'away' : 'home';
        let runsScored = 0;
        let newRunners = [...gameState.runners];
        if (isWalk) {
            if (newRunners[0]) {
                if (newRunners[1]) {
                    if (newRunners[2]) { runsScored++; }
                    newRunners[2] = true;
                }
                newRunners[1] = true;
            }
            newRunners[0] = true;
        } else {
            newRunners = [false, false, false];
            for (let i = 2; i >= 0; i--) {
                if (gameState.runners[i]) {
                    const nextBase = i + basesToAdvance;
                    if (nextBase >= 3) runsScored++;
                    else newRunners[nextBase] = true;
                }
            }
            if (basesToAdvance >= 4) runsScored++;
            else newRunners[basesToAdvance - 1] = true;
        }
        gameState.runners = newRunners;
        if (runsScored > 0) {
            gameState.teams[currentTeam].R += runsScored;
            const currentInning = gameState.inning - 1;
            if (gameState.teams[currentTeam].inningScores[currentInning] === null) {
                gameState.teams[currentTeam].inningScores[currentInning] = 0;
            }
            gameState.teams[currentTeam].inningScores[currentInning] += runsScored;
        }
    }

    function resetBSCount() { gameState.bso.b = 0; gameState.bso.s = 0; }

    function initBSODots() {
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
    
    function updateFullScoreboard() {
        ['away', 'home'].forEach(team => {
            const teamState = gameState.teams[team];
            const row = elements[`${team}Row`];
            let html = `<div class="cell team-name">${teamState.name}</div>`;
            teamState.inningScores.forEach((score, index) => {
                let displayValue = '';
                if (score !== null) {
                    displayValue = score;
                } else {
                    const isCurrentInning = (index === gameState.inning - 1);
                    const isBattingNow = (team === 'away' && gameState.half === 'Top') || (team === 'home' && gameState.half === 'Bot');
                    if (isCurrentInning && isBattingNow) {
                        displayValue = '0';
                    }
                }
                html += `<div class="cell">${displayValue}</div>`;
            });
            html += `<div class="cell stat-r">${teamState.R}</div>`;
            html += `<div class="cell stat-h">${teamState.H}</div>`;
            html += `<div class="cell stat-e">${teamState.E}</div>`;
            html += `<div class="cell stat-b">${teamState.BB}</div>`;
            row.innerHTML = html;
        });
    }

    function resetBallPosition() {
        elements.ball.style.animation = '';
        elements.ball.style.top = `calc(20% - ${BALL_DIAMETER / 2}px)`;
        elements.ball.style.left = `calc(50% - ${BALL_DIAMETER / 2}px)`;
        elements.ball.style.transform = 'scale(1)';
        elements.ball.offsetHeight;
    }

    function showPitchMarker(target, isStrike) {
        const marker = document.createElement('div');
        marker.className = `pitch-marker ${isStrike ? 'strike' : 'ball'}`;
        marker.style.left = target.finalLeft + 'px';
        marker.style.top = target.finalTop + 'px';
        elements.pitchMarkers.appendChild(marker);
        setTimeout(() => marker.remove(), 1500);
    }
    
    function updateUI() {
        updateBSODots();
        gameState.runners.forEach((hasRunner, i) => elements.bases[i].classList.toggle('runner-on', hasRunner));
        updateFullScoreboard();
    }
    
    function init() {
        initBSODots();
        elements.pitchButton.addEventListener('click', mainPitch);
        updateUI();
    }

    init();
});