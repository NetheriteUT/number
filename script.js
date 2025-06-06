let clickCount = 0; 
let alchemyCount = 0; 

const clickButton = document.getElementById('clickButton');
const classButton = document.getElementById('classButton'); 
const buttonContainer = document.getElementById('buttonContainer'); 
const counterContainer = document.getElementById('counterContainer');
const mainCounterElement = document.getElementById('mainCounter'); 
const alchemyCounterElement = document.getElementById('alchemyCounter'); 


const GRAVITY = 0.8; 
const INITIAL_VELOCITY_X_MIN = 10; 
const INITIAL_VELOCITY_X_MAX = 25; 
const INITIAL_VELOCITY_Y_MIN = -15; 
const INITIAL_VELOCITY_Y_MAX = 5; 
const INITIAL_SPIN_SPEED_MIN = 20; 
const INITIAL_SPIN_SPEED_MAX = 40; 


const CLICK_SPEED_WINDOW_MS = 1000; 
const HIGH_SPEED_THRESHOLD_CPS = 7; 
const HIGH_SPEED_DURATION_MS = 1000; 
const clickTimestamps = []; 

let highSpeedStreakStartTime = 0; 
let isButtonShaking = false; 



const MULTIPLIER_LEVELS = [
    { cps: 0, multiplier: 1, color: 'rgba(0, 0, 0, 0.8)' }, 
    { cps: 2, multiplier: 2, color: 'rgba(100, 0, 0, 0.8)' }, 
    { cps: 4, multiplier: 4, color: 'rgba(180, 0, 0, 0.8)' }, 
    { cps: 6, multiplier: 8, color: 'rgba(255, 0, 0, 0.9)' }, 
    { cps: 8, multiplier: 16, color: 'rgba(255, 50, 50, 1.0)' }, 
];


const activeCounters = [];


let audioContext = null;
let clickSoundBuffer = null;


const classroomImages = [
    'https:
    'https:
    'https:
    'https:
];

const CLASS_BUTTON_UNLOCK_THRESHOLD = 100; 
const ALCHEMY_COUNTER_UNLOCK_THRESHOLD = 30; 
const ALCHEMY_CRITICAL_THRESHOLD = 10; 
const ALCHEMY_CRITICAL_VALUE = 32; 


async function loadSound(url) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        clickSoundBuffer = await audioContext.decodeAudioData(arrayBuffer);
    } catch (e) {
        console.error("Error loading sound:", e);
    }
}


function playClickSound() {
    if (clickSoundBuffer && audioContext) {
        const source = audioContext.createBufferSource();
        source.buffer = clickSoundBuffer;
        source.connect(audioContext.destination);
        source.start();
    }
}


loadSound('click.mp3');


function animateCounters() {
    const currentTime = performance.now();

    
    for (let i = activeCounters.length - 1; i >= 0; i--) {
        const counter = activeCounters[i];

        
        counter.velY += GRAVITY;

        
        counter.posX += counter.velX;
        counter.posY += counter.velY;

        
        counter.angle += counter.spinSpeed;

        
        
        counter.element.style.left = `${counter.posX}px`;
        counter.element.style.top = `${counter.posY}px`;
        counter.element.style.transform = `translate(-50%, -50%) rotate(${counter.angle}deg)`;

        
        const isOffScreen = counter.posY > window.innerHeight + 200 ||
                            counter.posX < -200 ||
                            counter.posX > window.innerWidth + 200;

        if (isOffScreen) {
            counterContainer.removeChild(counter.element);
            activeCounters.splice(i, 1); 
        }
    }

    
    
    requestAnimationFrame(animateCounters);
}


let animationLoopStarted = false;


function calculateCPS() {
    const currentTime = Date.now();
    
    while (clickTimestamps.length > 0 && clickTimestamps[0] < currentTime - CLICK_SPEED_WINDOW_MS) {
        clickTimestamps.shift();
    }
    
    return clickTimestamps.length;
}


function getClickEffect(cps) {
    
    for (let i = MULTIPLIER_LEVELS.length - 1; i >= 0; i--) {
        if (cps >= MULTIPLIER_LEVELS[i].cps) {
            return MULTIPLIER_LEVELS[i];
        }
    }
    
    return MULTIPLIER_LEVELS[0];
}

clickButton.addEventListener('click', () => {
    
    playClickSound();

    const currentTime = Date.now();
    clickTimestamps.push(currentTime); 

    
    let flyingNumberText;
    let flyingNumberValue;
    let isCriticalHit = false;

    
    if (clickCount >= ALCHEMY_COUNTER_UNLOCK_THRESHOLD) {
        alchemyCounterElement.classList.remove('alchemy-counter-hidden');
        alchemyCount++; 
        alchemyCount = alchemyCount % (ALCHEMY_CRITICAL_THRESHOLD + 1); 
        alchemyCounterElement.textContent = `Alchemy: ${alchemyCount}/${ALCHEMY_CRITICAL_THRESHOLD}`;

        if (alchemyCount === 0 && clickTimestamps.length > 0 && clickTimestamps[clickTimestamps.length - 1] === currentTime) {
            
            
            isCriticalHit = true;
            flyingNumberText = `CRITICAL: ${ALCHEMY_CRITICAL_VALUE}`;
            flyingNumberValue = ALCHEMY_CRITICAL_VALUE; 
            clickCount *= 2; 
        }
    } else {
         
         alchemyCounterElement.classList.add('alchemy-counter-hidden'); 
         alchemyCount = 0; 
         alchemyCounterElement.textContent = `Alchemy: ${alchemyCount}/${ALCHEMY_CRITICAL_THRESHOLD}`; 
    }

    if (!isCriticalHit) {
        
        let baseClickValue = 1; 

        
        if (clickCount >= CLASS_BUTTON_UNLOCK_THRESHOLD) {
             
             baseClickValue *= 2;
        }

        const currentCPS = calculateCPS(); 
        const effect = getClickEffect(currentCPS); 

        
        flyingNumberValue = baseClickValue * effect.multiplier;
        flyingNumberText = `+${flyingNumberValue}`;

        
        clickCount += flyingNumberValue;
    }


    
    mainCounterElement.textContent = `Counter: ${clickCount}`; 

    
    if (clickCount >= CLASS_BUTTON_UNLOCK_THRESHOLD) {
        classButton.classList.remove('class-button-hidden'); 
    } else {
         classButton.classList.add('class-button-hidden'); 
    }


    
    const counterElement = document.createElement('div');
    counterElement.classList.add('counter');
    counterElement.textContent = flyingNumberText; 

    
    
     const currentCPS = calculateCPS(); 
     const effect = getClickEffect(currentCPS);
     counterElement.style.color = isCriticalHit ? 'rgba(255, 215, 0, 1.0)' : effect.color;


    
    const buttonRect = clickButton.getBoundingClientRect();

    
    const startX = buttonRect.left + buttonRect.width / 2;
    const startY = buttonRect.top; 

    
    const counterState = {
        element: counterElement,
        posX: startX,
        posY: startY,
        
        velX: (Math.random() - 0.5) * 2 * (INITIAL_VELOCITY_X_MAX - INITIAL_VELOCITY_X_MIN) + (Math.random() > 0.5 ? INITIAL_VELOCITY_X_MIN : -INITIAL_VELOCITY_X_MIN),
        velY: Math.random() * (INITIAL_VELOCITY_Y_MAX - INITIAL_VELOCITY_Y_MIN) + INITIAL_VELOCITY_Y_MIN,
        angle: 0, 
        spinSpeed: Math.random() * (INITIAL_SPIN_SPEED_MAX - INITIAL_SPIN_SPEED_MIN) + INITIAL_SPIN_SPEED_MIN 
    };

     
    counterElement.style.left = `${counterState.posX}px`;
    counterElement.style.top = `${counterState.posY}px`;
    
     counterElement.style.transform = 'translate(-50%, -50%) rotate(0deg)';
    
    counterElement.classList.add('shrink');

    
    counterContainer.appendChild(counterElement);

    
    activeCounters.push(counterState);

    
    if (!animationLoopStarted) {
        animationLoopStarted = true;
        requestAnimationFrame(animateCounters);
    }
});


classButton.addEventListener('click', () => {
    
    const randomIndex = Math.floor(Math.random() * classroomImages.length);
    const randomImageUrl = classroomImages[randomIndex];

    
    const allButtons = document.querySelectorAll('button');

    
    allButtons.forEach(button => {
        button.style.backgroundImage = `url('${randomImageUrl}')`;
        button.style.backgroundSize = 'cover'; 
        button.style.backgroundPosition = 'center'; 
        button.style.color = 'transparent'; 
        button.style.border = 'none'; 
    });
});


setInterval(() => {
    const currentTime = Date.now();
    const currentCPS = calculateCPS(); 

    if (currentCPS >= HIGH_SPEED_THRESHOLD_CPS) {
        if (highSpeedStreakStartTime === 0) {
            
            highSpeedStreakStartTime = currentTime;
        } else if (currentTime - highSpeedStreakStartTime >= HIGH_SPEED_DURATION_MS) {
            
            if (!isButtonShaking) {
                clickButton.classList.add('shake');
                isButtonShaking = true;
            }
        }
    } else {
        
        highSpeedStreakStartTime = 0; 
        if (isButtonShaking) {
            clickButton.classList.remove('shake');
            isButtonShaking = false;
        }
    }
}, 100); 


document.addEventListener('DOMContentLoaded', () => {
    
    if (clickCount < CLASS_BUTTON_UNLOCK_THRESHOLD) {
         classButton.classList.add('class-button-hidden');
    } else {
         classButton.classList.remove('class-button-hidden');
    }

    
     if (clickCount < ALCHEMY_COUNTER_UNLOCK_THRESHOLD) {
         alchemyCounterElement.classList.add('alchemy-counter-hidden');
     } else {
         alchemyCounterElement.classList.remove('alchemy-counter-hidden');
     }
});
