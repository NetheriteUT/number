import { activeCounters } from './script.js'; // Import activeCounters from script.js

// Physics constants (can be tuned) - Replicated here as they are used in this module
const GRAVITY = 0.8; // pixels per frame per frame
const INITIAL_VELOCITY_X_MIN = 10; // Minimum horizontal speed
const INITIAL_VELOCITY_X_MAX = 25; // Maximum horizontal speed
const INITIAL_VELOCITY_Y_MIN = -15; // Minimum vertical speed (negative is upwards)
const INITIAL_VELOCITY_Y_MAX = 5; // Maximum vertical speed (positive is downwards)
const INITIAL_SPIN_SPEED_MIN = 20; // Minimum degrees per frame
const INITIAL_SPIN_SPEED_MAX = 40; // Maximum degrees per frame


/**
 * Creates a flying number element and adds it to the active counters list.
 * @param {string} text The text content of the flying number (e.g., "+10", "CRITICAL +50").
 * @param {number} startX The initial X coordinate (center) for the number.
 * @param {number} startY The initial Y coordinate (center) for the number.
 * @param {string|null} color The CSS color string for the text, or null for default.
 * @param {boolean} isRainbow Whether the text should have a rainbow effect.
 * @param {HTMLElement} containerElement The DOM element to append the flying number to.
 * @param {Array} activeCountersArray The array to add the new counter object to for animation.
 */
export function createFlyingNumber(text, startX, startY, color = null, isRainbow = false, containerElement = document.getElementById('counterContainer'), activeCountersArray = activeCounters) {
    const counterElement = document.createElement('div');
    counterElement.classList.add('counter');

    // Set text content
    counterElement.textContent = text;

    // Apply color or rainbow effect
    if (isRainbow) {
        counterElement.classList.add('rainbow-text');
    } else if (color) {
        counterElement.style.color = color;
    }

    // Set initial position
    counterElement.style.left = `${startX}px`;
    counterElement.style.top = `${startY}px`;

    // Set initial transform for animation origin and slight scale up
    counterElement.style.transform = 'translate(-50%, -50%) scale(1.5)'; // Start larger and centered

    // Append to container
    containerElement.appendChild(counterElement);

    // Random initial velocity for physics effect
    const angle = Math.random() * Math.PI; // Angle for horizontal direction
    const velX = Math.cos(angle) * (INITIAL_VELOCITY_X_MIN + Math.random() * (INITIAL_VELOCITY_X_MAX - INITIAL_VELOCITY_X_MIN)) * (Math.random() < 0.5 ? 1 : -1); // Randomize left/right
    const velY = INITIAL_VELOCITY_Y_MIN + Math.random() * (INITIAL_VELOCITY_Y_MAX - INITIAL_VELOCITY_Y_MIN); // Initial upward or slightly downward push

    // Random spin speed
    const spinSpeed = INITIAL_SPIN_SPEED_MIN + Math.random() * (INITIAL_SPIN_SPEED_MAX - INITIAL_SPIN_SPEED_MIN);

    // Add animation class after a short delay to ensure initial style is applied
    requestAnimationFrame(() => {
        counterElement.classList.add('shrink');
    });


    // Add the counter object to the active list for animation
    activeCountersArray.push({
        element: counterElement,
        posX: startX,
        posY: startY,
        velX: velX,
        velY: velY,
        angle: 0, // Initial angle
        spinSpeed: spinSpeed,
        startTime: performance.now() // Record start time for animation duration check
    });
}
