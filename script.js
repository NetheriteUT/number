let clickCount = 0; // Initialize total click count
let alchemyCount = 0; // Initialize alchemy counter

const clickButton = document.getElementById('clickButton');
const classButton = document.getElementById('classButton'); // Get the Class button
const buttonContainer = document.getElementById('buttonContainer'); // Get the button container
const counterContainer = document.getElementById('counterContainer');
const mainCounterElement = document.getElementById('mainCounter'); // Get reference to main counter
const alchemyCounterElement = document.getElementById('alchemyCounter'); // Get reference to alchemy counter

// Physics constants (can be tuned)
const GRAVITY = 0.8; // pixels per frame per frame
const INITIAL_VELOCITY_X_MIN = 10; // Minimum horizontal speed
const INITIAL_VELOCITY_X_MAX = 25; // Maximum horizontal speed
const INITIAL_VELOCITY_Y_MIN = -15; // Minimum vertical speed (negative is upwards)
const INITIAL_VELOCITY_Y_MAX = 5; // Maximum vertical speed (positive is downwards)
const INITIAL_SPIN_SPEED_MIN = 20; // Minimum degrees per frame
const INITIAL_SPIN_SPEED_MAX = 40; // Maximum degrees per frame

// Tapping speed constants and state
const CLICK_SPEED_WINDOW_MS = 1000; // Window size for calculating CPS (1 second)
const HIGH_SPEED_THRESHOLD_CPS = 7; // CPS needed to trigger high speed effects
const HIGH_SPEED_DURATION_MS = 1000; // How long to maintain > HIGH_SPEED_THRESHOLD_CPS to trigger button shake
const clickTimestamps = []; // Array to store click timestamps

let highSpeedStreakStartTime = 0; // Timestamp when high speed streak started
let isButtonShaking = false; // Flag to track if the button is currently shaking

// Multiplier and styling constants based on CPS levels
// Removed font size as it's now handled by shrinking animation
const MULTIPLIER_LEVELS = [
    { cps: 0, multiplier: 1, color: 'rgba(0, 0, 0, 0.8)' }, // Default
    { cps: 2, multiplier: 2, color: 'rgba(100, 0, 0, 0.8)' }, // > 2 cps
    { cps: 4, multiplier: 4, color: 'rgba(180, 0, 0, 0.8)' }, // > 4 cps
    { cps: 6, multiplier: 8, color: 'rgba(255, 0, 0, 0.9)' }, // > 6 cps
    { cps: 8, multiplier: 16, color: 'rgba(255, 50, 50, 1.0)' }, // > 8 cps
];

// Array to keep track of active counters for animation loop
const activeCounters = [];

// Web Audio API for sound effects
let audioContext = null;
let clickSoundBuffer = null;

// Classroom images for the new button background
const classroomImages = [
    'https://smithsystem.com/smithfiles/wp-content/uploads/sites/2/2022/06/2023-Centerfield-Junior-High-04-1.jpg',
    'https://www.teachhub.com/wp-content/uploads/2020/05/Classroom-Management-for-an-Effective-Learning-Environment-768x512.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Elementary_classroom_in_Alaska.jpg/1200px-Elementary_classroom_in_Alaska.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHPeAYjtuI6caRHv_PSZHlXvARrqAunyeSDw&s'
];

const CLASS_BUTTON_UNLOCK_THRESHOLD = 100; // Threshold to unlock the class button
const ALCHEMY_COUNTER_UNLOCK_THRESHOLD = 30; // Threshold to unlock the alchemy counter
const ALCHEMY_CRITICAL_THRESHOLD = 10; // Alchemy count needed for a critical hit
const ALCHEMY_CRITICAL_VALUE = 32; // The value displayed during a critical hit

// Load the click sound effect
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

// Play the loaded sound effect
function playClickSound() {
    if (clickSoundBuffer && audioContext) {
        const source = audioContext.createBufferSource();
        source.buffer = clickSoundBuffer;
        source.connect(audioContext.destination);
        source.start();
    }
}

// Load the click sound on page load
loadSound('click.mp3');

// Animation loop using requestAnimationFrame
function animateCounters() {
    const currentTime = performance.now();

    // Iterate backwards to safely remove elements
    for (let i = activeCounters.length - 1; i >= 0; i--) {
        const counter = activeCounters[i];

        // Update vertical velocity based on gravity
        counter.velY += GRAVITY;

        // Update position based on velocity
        counter.posX += counter.velX;
        counter.posY += counter.velY;

        // Update rotation
        counter.angle += counter.spinSpeed;

        // Apply new position and rotation
        // The translate(-50%, -50%) is crucial to center the element
        counter.element.style.left = `${counter.posX}px`;
        counter.element.style.top = `${counter.posY}px`;
        counter.element.style.transform = `translate(-50%, -50%) rotate(${counter.angle}deg)`;

        // Check if the element is off-screen (with a generous margin)
        const isOffScreen = counter.posY > window.innerHeight + 200 ||
                            counter.posX < -200 ||
                            counter.posX > window.innerWidth + 200;

        if (isOffScreen) {
            counterContainer.removeChild(counter.element);
            activeCounters.splice(i, 1); // Remove from the active list
        }
    }

    // Request the next frame if there are still active counters or if we expect more to be added
    // It's generally fine to keep requesting frames; the browser optimizes when nothing changes
    requestAnimationFrame(animateCounters);
}

// Flag to start the animation loop only once
let animationLoopStarted = false;

// Function to calculate current CPS
function calculateCPS() {
    const currentTime = Date.now();
    // Remove timestamps older than the window
    while (clickTimestamps.length > 0 && clickTimestamps[0] < currentTime - CLICK_SPEED_WINDOW_MS) {
        clickTimestamps.shift();
    }
    // CPS is the number of clicks in the window
    return clickTimestamps.length;
}

// Function to get multiplier and styling based on CPS
function getClickEffect(cps) {
    // Iterate through levels to find the highest matching CPS threshold
    for (let i = MULTIPLIER_LEVELS.length - 1; i >= 0; i--) {
        if (cps >= MULTIPLIER_LEVELS[i].cps) {
            return MULTIPLIER_LEVELS[i];
        }
    }
    // Should not happen if levels start at 0, but as a fallback
    return MULTIPLIER_LEVELS[0];
}

clickButton.addEventListener('click', () => {
    // Play the click sound
    playClickSound();

    const currentTime = Date.now();
    clickTimestamps.push(currentTime); // Record the click timestamp

    // --- Handle Alchemy Counter and Critical Hits ---
    let flyingNumberText;
    let flyingNumberValue;
    let isCriticalHit = false;

    // Show alchemy counter after threshold
    if (clickCount >= ALCHEMY_COUNTER_UNLOCK_THRESHOLD) {
        alchemyCounterElement.classList.remove('alchemy-counter-hidden');
        alchemyCount++; // Increment alchemy counter on every click
        alchemyCount = alchemyCount % (ALCHEMY_CRITICAL_THRESHOLD + 1); // Cap alchemy count at ALCHEMY_CRITICAL_THRESHOLD
        alchemyCounterElement.textContent = `Alchemy: ${alchemyCount}/${ALCHEMY_CRITICAL_THRESHOLD}`;

        if (alchemyCount === 0 && clickTimestamps.length > 0 && clickTimestamps[clickTimestamps.length - 1] === currentTime) {
            // This means the click *just* caused alchemyCount to wrap around from 10 to 0,
            // triggering a critical hit.
            isCriticalHit = true;
            flyingNumberText = `CRITICAL: ${ALCHEMY_CRITICAL_VALUE}`;
            flyingNumberValue = ALCHEMY_CRITICAL_VALUE; // Critical hits have a fixed flying value
            clickCount *= 2; // Double the total counter
        }
    } else {
         // Alchemy counter is not yet visible, don't increment it
         alchemyCounterElement.classList.add('alchemy-counter-hidden'); // Ensure hidden
         alchemyCount = 0; // Keep it at 0 until visible
         alchemyCounterElement.textContent = `Alchemy: ${alchemyCount}/${ALCHEMY_CRITICAL_THRESHOLD}`; // Update display just in case
    }

    if (!isCriticalHit) {
        // Not a critical hit, calculate value based on base, class, and CPS multiplier
        let baseClickValue = 1; // Starting value

        // Check if Class is active (button is visible based on main counter)
        if (clickCount >= CLASS_BUTTON_UNLOCK_THRESHOLD) {
             // Class feature is active, double the base value
             baseClickValue *= 2;
        }

        const currentCPS = calculateCPS(); // Calculate current CPS
        const effect = getClickEffect(currentCPS); // Get multiplier and styling

        // Apply CPS multiplier to the base value (which may or may not be doubled by Class)
        flyingNumberValue = baseClickValue * effect.multiplier;
        flyingNumberText = `+${flyingNumberValue}`;

        // Increment total click count by the calculated value
        clickCount += flyingNumberValue;
    }


    // --- Update Displays ---
    mainCounterElement.textContent = `Counter: ${clickCount}`; // Update main counter display

    // Check if the class button should be shown
    if (clickCount >= CLASS_BUTTON_UNLOCK_THRESHOLD) {
        classButton.classList.remove('class-button-hidden'); // Show the class button by removing hidden class
    } else {
         classButton.classList.add('class-button-hidden'); // Hide if count drops below threshold
    }


    // --- Create and Animate Flying Number ---
    const counterElement = document.createElement('div');
    counterElement.classList.add('counter');
    counterElement.textContent = flyingNumberText; // Use the determined text

    // Apply color based on CPS effect (or potentially a special color for critical hits if desired)
    // For critical hits, let's make it gold/yellow
     const currentCPS = calculateCPS(); // Recalculate CPS for effect color
     const effect = getClickEffect(currentCPS);
     counterElement.style.color = isCriticalHit ? 'rgba(255, 215, 0, 1.0)' : effect.color;


    // Get the button's position to determine the animation start point
    const buttonRect = clickButton.getBoundingClientRect();

    // Set the starting position to the top center of the button
    const startX = buttonRect.left + buttonRect.width / 2;
    const startY = buttonRect.top; // Start right at the top edge of the button

    // Store the counter's state
    const counterState = {
        element: counterElement,
        posX: startX,
        posY: startY,
        // Initial velocity: random horizontal direction, slight vertical randomness
        velX: (Math.random() - 0.5) * 2 * (INITIAL_VELOCITY_X_MAX - INITIAL_VELOCITY_X_MIN) + (Math.random() > 0.5 ? INITIAL_VELOCITY_X_MIN : -INITIAL_VELOCITY_X_MIN),
        velY: Math.random() * (INITIAL_VELOCITY_Y_MAX - INITIAL_VELOCITY_Y_MIN) + INITIAL_VELOCITY_Y_MIN,
        angle: 0, // Initial rotation
        spinSpeed: Math.random() * (INITIAL_SPIN_SPEED_MAX - INITIAL_SPIN_SPEED_MIN) + INITIAL_SPIN_SPEED_MIN // Constant spin speed
    };

     // Apply initial position to the element
    counterElement.style.left = `${counterState.posX}px`;
    counterElement.style.top = `${counterState.posY}px`;
    // Apply initial transform (only centering, rotation is 0)
     counterElement.style.transform = 'translate(-50%, -50%) rotate(0deg)';
    // Add the size animation class
    counterElement.classList.add('shrink');

    // Add the counter to the container
    counterContainer.appendChild(counterElement);

    // Add the counter state to the active list
    activeCounters.push(counterState);

    // Start the animation loop if it hasn't started yet
    if (!animationLoopStarted) {
        animationLoopStarted = true;
        requestAnimationFrame(animateCounters);
    }
});

// Add event listener for the new Class button
classButton.addEventListener('click', () => {
    // Select a random image URL
    const randomIndex = Math.floor(Math.random() * classroomImages.length);
    const randomImageUrl = classroomImages[randomIndex];

    // Get all buttons on the page
    const allButtons = document.querySelectorAll('button');

    // Apply the background image to all buttons
    allButtons.forEach(button => {
        button.style.backgroundImage = `url('${randomImageUrl}')`;
        button.style.backgroundSize = 'cover'; // Ensure the image covers the button
        button.style.backgroundPosition = 'center'; // Center the image
        button.style.color = 'transparent'; // Hide the text
        button.style.border = 'none'; // Optional: remove border for better image display
    });
});

// Interval to check tapping speed and trigger button shake
setInterval(() => {
    const currentTime = Date.now();
    const currentCPS = calculateCPS(); // Re-calculate CPS based on current time

    if (currentCPS >= HIGH_SPEED_THRESHOLD_CPS) {
        if (highSpeedStreakStartTime === 0) {
            // Start streak
            highSpeedStreakStartTime = currentTime;
        } else if (currentTime - highSpeedStreakStartTime >= HIGH_SPEED_DURATION_MS) {
            // Streak maintained, trigger shake
            if (!isButtonShaking) {
                clickButton.classList.add('shake');
                isButtonShaking = true;
            }
        }
    } else {
        // Speed dropped below threshold, reset streak timer and stop shake
        highSpeedStreakStartTime = 0; // Reset the streak timer
        if (isButtonShaking) {
            clickButton.classList.remove('shake');
            isButtonShaking = false;
        }
    }
}, 100); // Check every 100ms

// Initial state check on page load
document.addEventListener('DOMContentLoaded', () => {
    // Ensure class button is hidden initially on load if count is less than threshold
    if (clickCount < CLASS_BUTTON_UNLOCK_THRESHOLD) {
         classButton.classList.add('class-button-hidden');
    } else {
         classButton.classList.remove('class-button-hidden');
    }

    // Ensure alchemy counter is hidden initially on load if count is less than threshold
     if (clickCount < ALCHEMY_COUNTER_UNLOCK_THRESHOLD) {
         alchemyCounterElement.classList.add('alchemy-counter-hidden');
     } else {
         alchemyCounterElement.classList.remove('alchemy-counter-hidden');
     }
});
