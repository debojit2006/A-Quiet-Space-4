document.addEventListener('DOMContentLoaded', () => {

    // --- STATE ---
    let activeFeature = null; // 'breathing', 'words', 'timer', or 'environment'
    let activeEnvironment = 'sky';
    let intervals = [];
    const isMobile = window.innerWidth < 768;

    // --- DOM ELEMENTS ---
    const appContainer = document.getElementById('app-container');
    const featureBtns = document.querySelectorAll('[data-feature]');
    const envBtns = document.querySelectorAll('[data-environment]');
    
    const initialMessage = document.getElementById('initial-message');
    const envInstructions = document.getElementById('environment-instructions');
    const envInstructionsText = document.getElementById('environment-text');

    const featureDisplayArea = document.getElementById('feature-display-area');
    const allFeatures = {
        breathing: document.getElementById('breathing-feature'),
        words: document.getElementById('kind-words-feature'),
        timer: document.getElementById('focus-timer-feature'),
    };

    // Breathing Elements
    const breathingCircle = document.getElementById('breathing-circle');
    const breathingInstructions = document.getElementById('breathing-instructions');

    // Kind Words Elements
    const kindWordText = document.getElementById('kind-word-text');
    const anotherWordBtn = document.getElementById('another-word-btn');

    // Focus Timer Elements
    const timerTimeLeft = document.getElementById('timer-time-left');
    const timerProgressRingFg = document.getElementById('timer-progress-ring-fg');
    const timerStartPauseBtn = document.getElementById('timer-start-pause-btn');
    const timerStartPauseText = document.getElementById('timer-start-pause-text');
    const timerPlayIcon = timerStartPauseBtn.querySelector('.play-icon');
    const timerPauseIcon = timerStartPauseBtn.querySelector('.pause-icon');
    const timerResetBtn = document.getElementById('timer-reset-btn');
    const timerModeSwitcher = document.getElementById('timer-mode-switcher');
    const timerModeStatus = document.getElementById('timer-mode-status');

    // Wish Modal Elements
    const wishPrompt = document.getElementById('wish-prompt');
    const wishConfirmation = document.getElementById('wish-confirmation');
    const makeWishBtn = document.getElementById('make-wish-btn');
    const wishInput = document.getElementById('wish-input');

    const kindWords = ["You’re not just studying Computer Science, you’re rewriting your own future with every line of code.", "I see how hard you work, and it inspires me every single day.", "You carry so much strength in your silence and so much fire in your focus.", "Behind every sleepless night, there's a brighter tomorrow waiting just for you.", "Your dedication isn’t ordinary—it’s rare, powerful, and beautiful.", "The world needs more minds like yours—sharp, sincere, and kind.", "Keep going, even when it’s tough—you're closer to your goals than you think.", "Your grind today is the glow-up the future will thank you for.", "You might feel overwhelmed now, but one day you’ll look back and smile at how far you’ve come.", "I know it’s not easy, but I also know you were never meant for the easy path—you were made for greatness.", "You're not just studying code, you're building the foundation for your dreams.", "Every bug you fix, every concept you master is one more proof of how capable you are.", "Don’t let stress make you forget how brilliant you are.", "Even on your worst days, you’re doing more than enough.", "The late nights, the frustration, the doubt—it’s all part of your powerful journey.", "I know it’s exhausting sometimes, but you’re stronger than anything life throws at you.", "You’re not behind—you’re blooming in your own time.", "It's okay to rest, but never forget the fire that made you start.", "You’ve come too far to not be proud of yourself.", "There’s something extraordinary about the way you never give up.", "Not everyone sees how hard you work—but I do, and it amazes me.", "You’re writing your own success story—one challenge at a time.", "Your ambition is magnetic, and your energy is something rare.", "You’re the kind of person who turns stress into strength.", "The way you manage everything—even when it's hard—is a quiet kind of heroism.", "Your mind is powerful, but your heart makes it even more incredible.", "Remember: pressure turns coal into diamonds—and you’re already sparkling.", "You’re not just going through it—you’re growing through it.", "If only you could see yourself through my eyes—you'd see someone unstoppable.", "There’s magic in your persistence. Don’t ever let it fade.", "You’ve got the kind of grit that changes lives—starting with your own.", "Take breaks, but never break down—you’re too brilliant to quit.", "I believe in your journey, even on the days you don’t.", "You’re not meant to be perfect—only persistent.", "When you’re tired, let your dreams rest—but never let them die.", "There’s no shortcut to success, but I see you building the whole road yourself.", "You’re not behind—you’re learning what most never dare to.", "The hard work you’re doing today is shaping a life full of possibilities.", "Some people study; you transform every lesson into power.", "No algorithm can calculate the brilliance of your determination.", "Even machines would admire your logic and your heart.", "Your strength is not in always having the answers, but in never being afraid to seek them.", "I know you’re tired, but that spark in your eyes is still there.", "You’re a storm of intelligence, kindness, and resilience.", "Keep showing up, even when it’s hard—especially then.", "What you’re building matters. You matter.", "When things get hard, remember who you are and why you started.", "I’m proud of your ambition and grateful to know someone so driven.", "Your dreams aren’t just dreams—they’re blueprints for a future only you can build.", "Keep being you—brilliant, hardworking, and truly one of a kind."];
    let currentWordIndex = 0;

    // --- RENDER & STATE MANAGEMENT ---
    function render() {
        stopAllAnimations();
        initialMessage.classList.add('hidden');
        envInstructions.classList.add('hidden');
        Object.values(allFeatures).forEach(el => el.classList.add('hidden'));

        document.querySelectorAll('.feature-btn').forEach(b => b.classList.remove('active'));
        
        if (activeFeature && allFeatures[activeFeature]) {
            document.querySelector(`[data-feature="${activeFeature}"]`).classList.add('active');
            allFeatures[activeFeature].classList.remove('hidden');
            if (activeFeature === 'breathing') startBreathingAnimation();
            if (activeFeature === 'words') showNewKindWord();
            if (activeFeature === 'timer') initializeTimer();
        } else if (activeFeature === 'environment') {
            document.querySelector(`[data-environment="${activeEnvironment}"]`).classList.add('active');
            envInstructions.classList.remove('hidden');
            startEnvironment(activeEnvironment);
        } else {
            initialMessage.classList.remove('hidden');
        }
    }

    function stopAllAnimations() {
        intervals.forEach(clearInterval);
        intervals = [];
        const envContainer = document.querySelector('.environment-container');
        if (envContainer) envContainer.remove();
    }
    
    // --- EVENT LISTENERS ---
    featureBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const feature = btn.dataset.feature;
            activeFeature = activeFeature === feature ? null : feature;
            render();
        });
    });

    envBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            activeEnvironment = btn.dataset.environment;
            activeFeature = 'environment';
            render();
        });
    });

    anotherWordBtn.addEventListener('click', () => {
        if (anotherWordBtn.classList.contains('refreshing')) return;
        anotherWordBtn.classList.add('refreshing');
        showNewKindWord();
        setTimeout(() => anotherWordBtn.classList.remove('refreshing'), 500);
    });
    
    makeWishBtn.addEventListener('click', handleMakeWish);
    wishInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleMakeWish();
    });

    function handleMakeWish() {
        if (wishInput.value.trim()) {
            wishPrompt.classList.add('hidden');
            wishConfirmation.classList.remove('hidden');
            wishInput.value = '';
            setTimeout(() => wishConfirmation.classList.add('hidden'), 3000);
        }
    }

    // --- UTILITY ---
    function createAndAppend(parent, tag, className, styles = {}) {
        const el = document.createElement(tag);
        el.className = className;
        Object.assign(el.style, styles);
        parent.appendChild(el);
        return el;
    }

    function addInterval(callback, duration) {
        callback();
        intervals.push(setInterval(callback, duration));
    }
    
    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    // --- FEATURE LOGIC ---

    function startBreathingAnimation() {
        const cycle = [
            { text: 'Breathe in slowly...', scale: 1.5, duration: 4000 },
            { text: 'Hold...', scale: 1.5, duration: 2000 },
            { text: 'Breathe out gently...', scale: 0.8, duration: 6000 },
            { text: 'Rest...', scale: 0.8, duration: 2000 }
        ];
        let currentPhaseIndex = 0;

        function runCycle() {
            const current = cycle[currentPhaseIndex];
            breathingInstructions.classList.add('fade-out');
            setTimeout(() => {
                breathingInstructions.textContent = current.text;
                breathingInstructions.classList.remove('fade-out');
            }, 500);
            breathingCircle.style.transitionDuration = `${current.duration / 1000}s`;
            breathingCircle.style.transform = `scale(${current.scale})`;
            currentPhaseIndex = (currentPhaseIndex + 1) % cycle.length;
        }
        
        function schedulePhases() {
            let cumulativeTime = 0;
            cycle.forEach((phase, index) => {
                setTimeout(() => runCycle(index), cumulativeTime);
                cumulativeTime += phase.duration;
            });
        }
        
        schedulePhases();
        const totalCycleTime = cycle.reduce((sum, p) => sum + p.duration, 0);
        addInterval(schedulePhases, totalCycleTime);
    }

    function showNewKindWord() {
        let newIndex;
        do { newIndex = Math.floor(Math.random() * kindWords.length); } while (newIndex === currentWordIndex && kindWords.length > 1);
        currentWordIndex = newIndex;
        kindWordText.style.opacity = 0;
        kindWordText.style.transform = 'translateY(20px)';
        setTimeout(() => {
            kindWordText.textContent = kindWords[currentWordIndex];
            kindWordText.style.opacity = 1;
            kindWordText.style.transform = 'translateY(0)';
        }, 300);
    }
    
    // --- FOCUS TIMER LOGIC ---
    let timerState = {
        mode: 'work', // work, shortBreak, longBreak
        status: 'idle', // idle, running, paused
        timeLeft: 25 * 60,
        totalTime: 25 * 60,
        timerInterval: null
    };
    const timerSettings = { work: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 };
    const radius = timerProgressRingFg.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    timerProgressRingFg.style.strokeDasharray = `${circumference} ${circumference}`;

    function updateTimerDisplay() {
        const minutes = Math.floor(timerState.timeLeft / 60);
        const seconds = timerState.timeLeft % 60;
        timerTimeLeft.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const offset = circumference - (timerState.timeLeft / timerState.totalTime) * circumference;
        timerProgressRingFg.style.strokeDashoffset = offset;
        
        timerModeStatus.textContent = {
            'idle': 'Ready', 'running': 'In Progress', 'paused': 'Paused'
        }[timerState.status];
    }
    
    function startTimer() {
        if (timerState.status === 'running') return;
        timerState.status = 'running';
        timerPauseIcon.classList.remove('hidden');
        timerPlayIcon.classList.add('hidden');
        timerStartPauseText.textContent = 'Pause';
        
        timerState.timerInterval = setInterval(() => {
            timerState.timeLeft--;
            updateTimerDisplay();
            if (timerState.timeLeft <= 0) {
                clearInterval(timerState.timerInterval);
                timerState.status = 'idle';
                // Switch modes automatically
                const nextMode = timerState.mode === 'work' ? 'shortBreak' : 'work';
                switchMode(nextMode);
            }
        }, 1000);
        addInterval(() => {}, 1000); // Add to master interval list for cleanup
    }
    
    function pauseTimer() {
        if (timerState.status !== 'running') return;
        timerState.status = 'paused';
        clearInterval(timerState.timerInterval);
        timerPlayIcon.classList.remove('hidden');
        timerPauseIcon.classList.add('hidden');
        timerStartPauseText.textContent = 'Resume';
    }
    
    function resetTimer() {
        clearInterval(timerState.timerInterval);
        timerState.status = 'idle';
        timerState.timeLeft = timerSettings[timerState.mode];
        timerState.totalTime = timerSettings[timerState.mode];
        updateTimerDisplay();
        timerPlayIcon.classList.remove('hidden');
        timerPauseIcon.classList.add('hidden');
        timerStartPauseText.textContent = 'Start';
    }

    function switchMode(newMode) {
        timerState.mode = newMode;
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === newMode);
        });
        resetTimer();
    }

    function initializeTimer() {
        timerStartPauseBtn.onclick = () => {
            if (timerState.status === 'running') pauseTimer();
            else startTimer();
        };
        timerResetBtn.onclick = resetTimer;
        timerModeSwitcher.querySelectorAll('.mode-btn').forEach(btn => {
            btn.onclick = () => switchMode(btn.dataset.mode);
        });
        resetTimer();
    }


    // --- ENVIRONMENT LOGIC ---
    function startEnvironment(envType) {
        const container = document.createElement('div');
        container.className = `environment-container ${envType}-container`;
        
        const instructions = {
            sky: "Gaze at the galaxy and catch a shooting star to make a wish ✨",
            mountains: "Breathe in the mountain air and watch the clouds drift by 🏔️",
            beach: "Listen to the gentle waves and watch the seagulls soar 🌊",
            rain: "Let the gentle rain wash your worries away 🌧️",
            forest: "Breathe in the fresh morning air and listen to nature's symphony 🌲",
            fireplace: "Warm yourself by the crackling fire and feel the cozy comfort 🔥"
        };
        envInstructionsText.textContent = instructions[envType];

        const envFunctions = { sky: startNightSky, mountains: startMountains, beach: startBeach, rain: startGentleRain, forest: startForestMorning, fireplace: startCracklingFireplace };
        if (envFunctions[envType]) {
            envFunctions[envType](container);
        }
        appContainer.prepend(container);
    }
    
    function startNightSky(container) {
        const starCount = isMobile ? 75 : 200;
        for (let i = 0; i < starCount; i++) {
            createAndAppend(container, 'div', 'star', { 
                width: `${random(1, 3)}px`, height: `${random(1, 3)}px`, 
                left: `${random(0, 100)}%`, top: `${random(0, 100)}%`, 
                animationDuration: `${random(3, 5)}s`, animationDelay: `${random(0, 5)}s`,
                '--start-opacity': random(0.3, 1)
            });
        }
        addInterval(() => {
            const startX = random(10, 90);
            const startY = random(5, 40);
            const angle = random(110, 140);
            const starEl = createAndAppend(container, 'div', 'shooting-star', {
                left: `${startX}%`, top: `${startY}%`,
                transform: `rotate(${angle}deg) scaleX(0)`
            });
            setTimeout(() => { starEl.remove(); }, 2000);

            // Show wish prompt
            wishPrompt.classList.remove('hidden');
            setTimeout(() => wishPrompt.classList.add('hidden'), 8000); // 8 second duration
        }, 12000);
    }

    function startMountains(container) {
        container.innerHTML = `
            <svg viewBox="0 0 1200 400" style="height: 66.7%; fill: rgba(147, 197, 253, 0.3);"><path d="M0,400 L0,200 Q150,120 300,160 Q450,200 600,140 Q750,80 900,120 Q1050,160 1200,100 L1200,400 Z"></path></svg>
            <svg viewBox="0 0 1200 350" style="height: 60%; fill: rgba(99, 102, 241, 0.4);"><path d="M0,350 L0,250 Q100,180 250,220 Q400,260 550,200 Q700,140 850,180 Q1000,220 1200,160 L1200,350 Z"></path></svg>
            <svg viewBox="0 0 1200 300" style="height: 50%; fill: rgba(79, 70, 229, 0.5);"><path d="M0,300 L0,280 Q120,200 280,240 Q440,280 600,220 Q760,160 920,200 Q1080,240 1200,180 L1200,300 Z"></path></svg>
            <div style="position:absolute; bottom: 25%; left:0; width:100%; height:8rem; background: linear-gradient(to top, rgba(255,255,255,0.1), transparent);"></div>
        `;
        const cloudCount = isMobile ? 4 : 8;
        for (let i = 0; i < cloudCount; i++) { 
            createAndAppend(container, 'div', 'mountain-cloud', { width: `${random(20, 60)}vw`, height: `${random(5, 15)}vh`, left: `${random(0, 100)}vw`, top: `${random(10, 50)}%`, opacity: random(0.3, 0.7), animationDuration: `${random(40, 80)}s` }); 
        }
    }

    function startBeach(container) {
        createAndAppend(container, 'div', 'ocean'); 
        createAndAppend(container, 'div', 'sand'); 
        createAndAppend(container, 'div', 'sun');
        for (let i = 0; i < 4; i++) {
            const wave = createAndAppend(container, 'svg', 'wave', { height: `${15-i*3}%`, zIndex: 10-i, animationDuration: `${random(4,6)}s`, animationDelay: `${i*0.5}s` });
            wave.setAttribute('viewBox', '0 0 1200 100');
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.style.fill = `rgba(59, 130, 246, ${0.3 - i * 0.05})`;
            path.style.animation = `wave-morph ${random(4,6)}s ease-in-out infinite ${i*0.5}s`;
            wave.appendChild(path);
        }
        const cloudCount = isMobile ? 3 : 6;
        for (let i = 0; i < cloudCount; i++) { 
            createAndAppend(container, 'div', 'beach-cloud', { width: `${random(15, 45)}vw`, height: `${random(4, 12)}vh`, left: `${random(0, 100)}vw`, top: `${random(5, 35)}%`, opacity: random(0.6, 1), animationDuration: `${random(60, 100)}s` }); 
        }
        addInterval(() => {
            const seagull = createAndAppend(container, 'div', 'seagull', { top: `${random(15, 55)}%`, animationDuration: `${random(20, 30)}s` });
            seagull.innerHTML = `<svg width="20" height="14" viewBox="0 0 20 14" fill="currentColor"><path d="M10 0C8 3 6 6 0 8c6 2 8 5 10 8 2-3 4-6 10-8-6-2-8-5-10-8z"/></svg>`;
            setTimeout(() => seagull.remove(), 25000);
        }, 10000);
    }
    
    function startGentleRain(container) {
        const dropCount = isMobile ? 50 : 150;
        for(let i=0; i< dropCount; i++) {
            createAndAppend(container, 'div', 'raindrop', {
                left: `${random(0, 100)}%`,
                animationDuration: `${random(0.5, 1.5)}s`,
                animationDelay: `${random(0, 5)}s`
            });
        }
    }
    
    function startForestMorning(container) {
        const treeCount = isMobile ? 5 : 10;
        const leafCount = isMobile ? 10 : 25;
        for(let i=0; i < treeCount; i++) {
            const height = random(30, 70);
            const width = height * 0.6;
            const left = random(0, 100 - (width / window.innerWidth * 100));
            createAndAppend(container, 'div', 'tree-trunk', { width: `${width*0.1}px`, height: `${height*0.5}vh`, left: `${left + (width*0.45)/window.innerWidth * 100}%`, backgroundColor: '#4a2c2a' });
            createAndAppend(container, 'div', 'tree-canopy', { width: `${width}px`, height: `${height}vh`, left: `${left}%`, bottom: `${height * 0.3}vh` });
        }
         for(let i=0; i < 8; i++) {
            createAndAppend(container, 'div', 'sunbeam', {
                left: `${random(0, 100)}%`,
                width: `${random(2, 6)}%`,
                transform: `skewX(${random(-15, 15)}deg)`,
                animationDelay: `${random(0, 4)}s`
            });
        }
        for(let i=0; i < leafCount; i++) {
            const leaf = createAndAppend(container, 'div', 'leaf', {
                left: `${random(0, 100)}%`,
                fontSize: `${random(10, 20)}px`,
                animationDuration: `${random(8, 15)}s`,
                animationDelay: `${random(0, 10)}s`
            });
            leaf.innerHTML = '&#127809;'; // Leaf emoji
        }
    }
    
    function startCracklingFireplace(container) {
        const structure = createAndAppend(container, 'div', 'fireplace-structure');
        createAndAppend(structure, 'div', 'fireplace-back');
        const logsContainer = createAndAppend(structure, 'div', '');
        createAndAppend(logsContainer, 'div', 'log', { width: '80%', bottom: '1rem', left: '10%', transform: 'rotate(-2deg)'});
        createAndAppend(logsContainer, 'div', 'log', { width: '70%', bottom: '2rem', left: '15%', transform: 'rotate(2deg)'});

        const flameCount = isMobile ? 8 : 15;
        for(let i = 0; i < flameCount; i++) {
            createAndAppend(structure, 'div', 'flame', {
                left: `${random(20, 80)}%`,
                width: `${random(20, 50)}px`,
                height: `${random(40, 100)}px`,
                animationDelay: `${random(0, 1)}s`
            });
        }
        addInterval(() => {
            for(let i = 0; i < (isMobile ? 1 : 3); i++) {
                const spark = createAndAppend(structure, 'div', 'spark', {
                    left: `${random(40, 60)}%`,
                    '--x-end': `${random(-50, 50)}px`
                });
                setTimeout(() => spark.remove(), 2000);
            }
        }, 500);
    }
    
    // --- INITIAL RENDER ---
    activeFeature = 'environment';
    render();
});
