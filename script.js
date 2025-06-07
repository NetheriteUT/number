import { createFlyingNumber } from './flyingNumbers.js'; // Import createFlyingNumber from the new file

let clickCount = 0; // Initialize total click count
let alchemyCount = 0; // Initialize alchemy counter
let selectedClass = null; // Initialize selected class state
let unlockedClasses = []; // Array to store unlocked classes
let skillPoints = 0; // Initialize skill points
let lastSkillThreshold = 0; // Track the last multiple of 100 crossed for skill points

// Physics branch state - Physics boost is now always active if Physics path is selected
// physicsCount and physicsActiveEndTime are no longer needed for Physics branch,
// but physicsCount might be needed for other science branches if they get similar mechanics later.
// Let's keep physicsCount but remove physicsActiveEndTime.
let physicsCount = 0; // Counter for Physics bar (kept for potential future use, not for current Physics path)
let physicsActiveEndTime = 0; // DEPRECATED for Physics path, kept for safety in loadState

// Biology branch state
let biologyLastParticleTime = 0; // Timestamp when the last Biology particle was generated

// Chemistry Haste state (Level 3 Chem nodes)
let chemHasteActiveEndTime = 0; // Timestamp when Chem Haste boost ends (0 if not active)
const CHEM_HASTE_DURATION_MS = 1000; // Duration of the Haste effect (1 second)
const CHEM_HASTE_INTERVAL_MS = 5000; // How often Haste triggers (every 5 seconds)
let lastChemHasteTriggerTime = 0; // Timestamp of the last Chem Haste trigger

// Passive income state (Vocab, Economics)
let lastPassiveIncomeTime = 0; // Timestamp of the last passive income tick


const clickButton = document.getElementById('clickButton');
const skillTreeButton = document.getElementById('skillTreeButton'); // Get reference to skill tree button
const counterContainer = document.getElementById('counterContainer');
const mainCounterElement = document.getElementById('mainCounter'); // Get reference to main counter
const alchemyCounterElement = document.getElementById('alchemyCounter'); // Get reference to alchemy counter
const classDisplayElement = document.getElementById('classDisplay'); // Get reference to class display
const skillCounterElement = document.getElementById('skillCounter'); // Get reference to skill counter
const physicsBarElement = document.getElementById('physicsBarContainer'); // Get reference to physics bar - will hide this if Physics path selected

// Physics constants (can be tuned) - Replicated here as they are used in flyingNumbers.js, should ideally be defined there only
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
const HIGH_SPEED_DURATION_MS_BASE = 1000; // How long to maintain > HIGH_SPEED_THRESHOLD_CPS to trigger button shake (Base SS)

const clickTimestamps = []; // Array to store click timestamps

let highSpeedStreakStartTime = 0; // Timestamp when high speed streak started
let isButtonShaking = false; // Flag to track if the button is currently shaking

// Multiplier and styling constants based on CPS levels
const MULTIPLIER_LEVELS = [
    { cps: 0, multiplier: 1, color: 'rgba(0, 0, 0, 0.8)' }, // Default
    { cps: 2, multiplier: 2, color: 'rgba(100, 0, 0, 0.8)' }, // > 2 cps
    { cps: 4, multiplier: 4, color: 'rgba(180, 0, 0, 0.8)' }, // > 4 cps
    { cps: 6, multiplier: 8, color: 'rgba(255, 0, 0, 0.9)' }, // > 6 cps
    { cps: 8, multiplier: 16, color: 'rgba(255, 50, 50, 1.0)' }, // > 8 cps
];

// Feature Unlock Thresholds
const CLASS_UNLOCK_THRESHOLD = 100; // Threshold to get a random class
const ALCHEMY_COUNTER_UNLOCK_THRESHOLD = 30; // Threshold to unlock the alchemy counter
const SKILL_TREE_UNLOCK_THRESHOLD = 1000; // Threshold to unlock the skill tree button
const SKILL_POINT_EARN_THRESHOLD = 100; // Earn 1 skill point every X clickCount
const PASSIVE_INCOME_INTERVAL_MS = 1000; // Tick every 1 second for passive income


// Class Effect Constants
const BASE_CLASSES = ["Math", "Science", "ELA", "Social Studies"]; // Available random classes
// Define the entire skill tree structure with levels and parents (Synced with skilltree.js)
const SKILL_TREE_NODES = {
    // Level 1 (Base Classes)
    "Math": { level: 1, parent: null, symbol: "π" }, // Pi
    "Science": { level: 1, parent: null, symbol: "🧪" }, // Test tube
    "ELA": { level: 1, parent: null, symbol: "✍️" }, // Writing hand
    "Social Studies": { level: 1, parent: null, symbol: "🏛️" }, // Classical building

    // Level 2 (Branches) - Cost 3
    "Algebra": { level: 2, parent: "Math", symbol: "χ", cost: 3 }, // Chi (variable)
    "Geometry": { level: 2, parent: "Math", symbol: "Δ", cost: 3 }, // Delta (change/triangle)
    "Pre Calc": { level: 2, parent: "Math", symbol: "∫", cost: 3 }, // Integral (calculus)

    "Chem": { level: 2, parent: "Science", symbol: "⚗️", cost: 3 }, // Alembic
    "Biology": { level: 2, parent: "Science", symbol: "🧬", cost: 3 }, // DNA
    "Physics": { level: 2, parent: "Science", symbol: "⚛️", cost: 3 }, // Atom symbol

    "Literature": { level: 2, parent: "ELA", symbol: "📚", cost: 3 }, // Books
    "Writing": { level: 2, parent: "ELA", symbol: "📝", cost: 3 }, // Memo
    "Vocab": { level: 2, parent: "ELA", symbol: "📖", cost: 3 }, // Open book

    "History": { level: 2, parent: "Social Studies", symbol: "📜", cost: 3 }, // Scroll
    "Economics": { level: 2, parent: "Social Studies", symbol: "📈", cost: 3 }, // Chart increasing
    "Geography": { level: 2, parent: "Social Studies", symbol: "🗺️", cost: 3 }, // World map

    // Level 3 (Sub-branches) - Cost 5
    "Algebra 1": { level: 3, parent: "Algebra", symbol: "χ¹", cost: 5 },
    "Algebra 2": { level: 3, parent: "Algebra", symbol: "χ²", cost: 5 },
    "Linear Algebra": { level: 3, parent: "Algebra", symbol: "∝", cost: 5 }, // Proportional to
    "Euclidian": { level: 3, parent: "Geometry", symbol: "📏", cost: 5 }, // Ruler
    "Topology": { level: 3, parent: "Geometry", symbol: "🍩", cost: 5 }, // Donut (genus 1)
    "Analytics": { level: 3, parent: "Geometry", symbol: "📊", cost: 5 }, // Bar chart
    "Calculus": { level: 3, parent: "Pre Calc", symbol: "∞", cost: 5 }, // Infinity
    "Differential Equations": { level: 3, parent: "Pre Calc", symbol: "∂", cost: 5 }, // Partial derivative
    "Discrete Math": { level: 3, parent: "Pre Calc", symbol: "∑", cost: 5 }, // Summation

    "Organic Chem": { level: 3, parent: "Chem", symbol: "🌿", cost: 5 }, // Herb
    "Inorganic Chem": { level: 3, parent: "Chem", symbol: "💎", cost: 5 }, // Gem stone
    "Physical Chem": { level: 3, parent: "Chem", symbol: "🔥", cost: 5 }, // Fire
    "Genetics": { level: 3, parent: "Biology", symbol: "🔬", cost: 5 }, // Microscope
    "Ecology": { level: 3, parent: "Biology", symbol: "🌳", cost: 5 }, // Deciduous tree
    "Anatomy": { level: 3, parent: "Biology", symbol: "🦴", cost: 5 }, // Bone
    "Mechanics": { level: 3, parent: "Physics", symbol: "⚙️", cost: 5 }, // Gear
    "Thermodynamics": { level: 3, parent: "Physics", symbol: "♨️", cost: 5 }, // Hot springs
    "Electromagnetism": { level: 3, parent: "Physics", symbol: "⚡", cost: 5 }, // High voltage

    "Poetry": { level: 3, parent: "Literature", symbol: "🖋️", cost: 5 }, // Fountain pen
    "Prose": { level: 3, parent: "Literature", symbol: "📄", cost: 5 }, // Page
    "Drama": { level: 3, parent: "Literature", symbol: "🎭", cost: 5 }, // Performing arts
    "Essay": { level: 3, parent: "Writing", symbol: "📄", cost: 5 }, // Page (re-used)
    "Research Paper": { level: 3, parent: "Writing", symbol: "🔬", cost: 5 }, // Microscope (re-used)
    "Creative Writing": { level: 3, parent: "Writing", symbol: "💡", cost: 5 }, // Light bulb
    "Etymology": { level: 3, parent: "Vocab", symbol: "🗣️", cost: 5 }, // Speaking head
    "Semantics": { level: 3, parent: "Vocab", symbol: "💬", cost: 5 }, // Speech balloon
    "Syntax": { level: 3, parent: "Vocab", symbol: "📜", cost: 5 }, // Scroll (re-used)

    "World History": { level: 3, parent: "History", symbol: "🗺️", cost: 5 }, // World map (re-used)
    "US History": { level: 3, parent: "History", symbol: "🦅", cost: 5 }, // Eagle
    "Ancient History": { level: 3, parent: "History", symbol: "🗿", cost: 5 }, // Moai
    "Microeconomics": { level: 3, parent: "Economics", symbol: "💰", cost: 5 }, // Money bag
    "Macroeconomics": { level: 3, parent: "Economics", symbol: "🏦", cost: 5 }, // Bank
    "Behavioral Economics": { level: 3, parent: "Economics", symbol: "🧠", cost: 5 }, // Brain
    "Physical Geo": { level: 3, parent: "Geography", symbol: "⛰️", cost: 5 }, // Mountain
    "Human Geo": { level: 3, parent: "Geography", symbol: "🏘️", cost: 5 }, // Houses
    "Cartography": { level: 3, parent: "Geography", symbol: "📍", cost: 5 } // Round pushpin
};

// Helper functions to check class types and parents using SKILL_TREE_NODES
const getNodeInfo = (className) => SKILL_TREE_NODES[className];
const isClassUnlocked = (className) => unlockedClasses.includes(className);
const getBaseClass = (className) => {
    let node = getNodeInfo(className);
    while (node && node.level > 1) {
        className = node.parent;
        node = getNodeInfo(className);
    }
    return className;
};
const getParentBranch = (className) => {
    const node = getNodeInfo(className);
    return node ? node.parent : null;
};
const getLevel = (className) => {
    const node = getNodeInfo(className);
    return node ? node.level : 0;
};
const isPhysicsPathSelected = (selectedClass) => {
    const selectedNodeInfo = getNodeInfo(selectedClass);
     if (!selectedNodeInfo) return false;
     if (selectedNodeInfo.level === 1 && selectedClass === 'Science') return true; // Base Science might implicitly include all branches
    const baseClass = getBaseClass(selectedClass);
    if (baseClass !== 'Science') return false;
    const parentBranch = getParentBranch(selectedClass);
     return selectedClass === 'Physics' || parentBranch === 'Physics';
};
const isBiologyPathSelected = (selectedClass) => {
     const selectedNodeInfo = getNodeInfo(selectedClass);
      if (!selectedNodeInfo) return false;
     if (selectedNodeInfo.level === 1 && selectedClass === 'Science') return true; // Base Science might implicitly include all branches
    const baseClass = getBaseClass(selectedClass);
    if (baseClass !== 'Science') return false;
    const parentBranch = getParentBranch(selectedClass);
    return selectedClass === 'Biology' || parentBranch === 'Biology';
};
const isChemistryPathSelected = (selectedClass) => {
    const selectedNodeInfo = getNodeInfo(selectedClass);
     if (!selectedNodeInfo) return false;
     if (selectedNodeInfo.level === 1 && selectedClass === 'Science') return true; // Base Science might implicitly include all branches
    const baseClass = getBaseClass(selectedClass);
    if (baseClass !== 'Science') return false;
    const parentBranch = getParentBranch(selectedClass);
    return selectedClass === 'Chem' || parentBranch === 'Chem';
};
const isChemistryBranchSelected = (selectedClass) => selectedClass === 'Chem'; // Specific check for Level 2 Chem
const isChemistrySubBranchSelected = (selectedClass) => {
     const selectedNodeInfo = getNodeInfo(selectedClass);
     return selectedNodeInfo ? selectedNodeInfo.level === 3 && selectedNodeInfo.parent === 'Chem' : false;
};
const isELAPathSelected = (selectedClass) => {
     const selectedNodeInfo = getNodeInfo(selectedClass);
     if (!selectedNodeInfo) return false;
     return getBaseClass(selectedClass) === 'ELA';
};
const isSocialStudiesPathSelected = (selectedClass) => {
     const selectedNodeInfo = getNodeInfo(selectedClass);
     if (!selectedNodeInfo) return false;
     return getBaseClass(selectedClass) === 'Social Studies';
};


// Base Alchemy Threshold is now dynamic based on selected class
const DEFAULT_ALCHEMY_THRESHOLD = 10; // Default when no Science/Chem path selected
const SCIENCE_ALCHEMY_THRESHOLD_BASE = 5; // Threshold when Science path is selected
const CHEM_BRANCH_ALCHEMY_THRESHOLD = 3; // Threshold when Chem branch (L2) is selected
const ALCHEMY_CRITICAL_VALUE_BASE = 32; // The base value displayed during a critical hit

const ELA_BASE_TRIGGER_CHANCE = 0.2; // 20% base chance per click for ELA bonus (if ELA path selected)
const ELA_BASE_LETTER_COUNT = 1; // Base letters generated (if ELA path selected)
const ELA_LETTER_VALUE = 32; // Value per ELA letter/bonus increment

const SOCIAL_STUDIES_SHAKE_BONUS_CAP = 512; // Max bonus added by SS shake effect

const BIOLOGY_PARTICLE_VALUE_BASE = 32; // Base value for Biology particles
const BIOLOGY_PARTICLE_INTERVAL_MS = 1000; // How often Biology particles spawn (1 second)

// Physics boost duration - now conceptually infinite if Physics path is selected
// PHYSICS_BOOST_DURATION_MS_BASE = 10000; // DEPRECATED for Physics path

const PASSIVE_INCOME_PER_NODE = 1; // Passive income value per unlocked Vocab/Economics sub-branch


// Array to keep track of active counters for animation loop
export const activeCounters = []; // Exported for use in flyingNumbers.js

// Web Audio API for sound effects
let audioContext = null;
let clickSoundBuffer = null;

// --- Local Storage ---
function saveState() {
    try {
        localStorage.setItem('clickCount', clickCount);
        localStorage.setItem('alchemyCount', alchemyCount);
        localStorage.setItem('selectedClass', selectedClass);
        localStorage.setItem('unlockedClasses', JSON.stringify(unlockedClasses)); // Save unlocked classes array
        localStorage.setItem('skillPoints', skillPoints); // Save skill points
        localStorage.setItem('lastSkillThreshold', lastSkillThreshold); // Save skill point threshold tracker
        // localStorage.setItem('physicsCount', physicsCount); // physicsCount might not need saving if Physics path removes the bar
        // localStorage.setItem('physicsActiveEndTime', physicsActiveEndTime); // DEPRECATED
        localStorage.setItem('biologyLastParticleTime', biologyLastParticleTime); // Save biology timer
         localStorage.setItem('chemHasteActiveEndTime', chemHasteActiveEndTime); // Save chem haste timer
         localStorage.setItem('lastChemHasteTriggerTime', lastChemHasteTriggerTime); // Save chem haste trigger time
        localStorage.setItem('lastPassiveIncomeTime', lastPassiveIncomeTime); // Save passive income timer
    } catch (e) {
        console.error("Error saving to localStorage:", e);
    }
}

function loadState() {
    try {
        clickCount = parseInt(localStorage.getItem('clickCount') || '0', 10);
        alchemyCount = parseInt(localStorage.getItem('alchemyCount') || '0', 10);
        selectedClass = localStorage.getItem('selectedClass'); // Can be null if not set
        unlockedClasses = JSON.parse(localStorage.getItem('unlockedClasses') || '[]'); // Load as array
        skillPoints = parseInt(localStorage.getItem('skillPoints') || '0', 10); // Load skill points
        lastSkillThreshold = parseInt(localStorage.getItem('lastSkillThreshold') || '0', 10); // Load skill point threshold tracker
        physicsCount = parseInt(localStorage.getItem('physicsCount') || '0', 10); // Load physics counter (if saved)
        // physicsActiveEndTime = parseInt(localStorage.getItem('physicsActiveEndTime') || '0', 10); // DEPRECATED, but load for old saves
        biologyLastParticleTime = parseInt(localStorage.getItem('biologyLastParticleTime') || '0', 10); // Load biology timer
         chemHasteActiveEndTime = parseInt(localStorage.getItem('chemHasteActiveEndTime') || '0', 10); // Load chem haste timer
         lastChemHasteTriggerTime = parseInt(localStorage.getItem('lastChemHasteTriggerTime') || '0', 10); // Load chem haste trigger time
        lastPassiveIncomeTime = parseInt(localStorage.getItem('lastPassiveIncomeTime') || '0', 10); // Load passive income timer

        // Ensure the randomly assigned base class is in unlockedClasses if it exists and is a base class
         const selectedNodeInfo = getNodeInfo(selectedClass);
         if (selectedNodeInfo && selectedNodeInfo.level === 1 && !unlockedClasses.includes(selectedClass)) {
              unlockedClasses.push(selectedClass);
         }


        // Ensure timers are valid if they were in the past
        const currentTime = Date.now();
         // if (physicsActiveEndTime > 0 && physicsActiveEndTime < currentTime) { physicsActiveEndTime = 0; physicsCount = 0; } // DEPRECATED

        if (chemHasteActiveEndTime > 0 && chemHasteActiveEndTime < currentTime) { chemHasteActiveEndTime = 0; }
         // If last trigger time is in the distant past, reset it to now to prevent massive income/triggers
         if (lastChemHasteTriggerTime === 0 || isNaN(lastChemHasteTriggerTime) || lastChemHasteTriggerTime < currentTime - CHEM_HASTE_INTERVAL_MS * 2) { // Reset if too old
              lastChemHasteTriggerTime = currentTime;
         }
         if (biologyLastParticleTime === 0 || isNaN(biologyLastParticleTime) || biologyLastParticleTime < currentTime - BIOLOGY_PARTICLE_INTERVAL_MS * 2) { // Reset if too old
              biologyLastParticleTime = currentTime;
         }
        if (lastPassiveIncomeTime === 0 || isNaN(lastPassiveIncomeTime) || lastPassiveIncomeTime < currentTime - PASSIVE_INCOME_INTERVAL_MS * 2) { // Reset if too old
            lastPassiveIncomeTime = currentTime;
        }


    } catch (e) {
        console.error("Error loading from localStorage:", e);
        // Reset state if loading fails to prevent errors
        clickCount = 0;
        alchemyCount = 0;
        selectedClass = null;
        unlockedClasses = [];
        skillPoints = 0;
        lastSkillThreshold = 0;
        physicsCount = 0; // Keep physicsCount, reset value
        // physicsActiveEndTime = 0; // DEPRECATED
        biologyLastParticleTime = Date.now();
        chemHasteActiveEndTime = 0;
        lastChemHasteTriggerTime = Date.now();
        lastPassiveIncomeTime = Date.now(); // Initialize for new game
    }

    // Update displays immediately after loading
    mainCounterElement.textContent = `Counter: ${Math.round(clickCount)}`;
    updateFeatureVisibility(); // Update visibility based on loaded state
    updateSkillCounterDisplay(); // Update skill counter display
    updatePhysicsBarDisplay(); // Update physics bar display (will hide if Physics path selected)
}
// --- End Local Storage ---


// Load the click sound effect
async function loadSound(url) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
         // Attempt to resume if it's in a suspended state (common in some browsers)
        if (audioContext.state === 'suspended') {
            const resume = async () => {
                await audioContext.resume();
                document.removeEventListener('click', resume); // Only need to try once
                document.removeEventListener('keydown', resume);
            };
            // Try resuming on the first user gesture
            document.addEventListener('click', resume);
            document.addEventListener('keydown', resume);
        }
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
        // Check and potentially resume context before playing
        if (audioContext.state === 'suspended') {
             audioContext.resume().catch(e => console.warn("AudioContext resume failed:", e));
        }
         // Check state again after attempting resume
         if (audioContext.state === 'running') {
            const source = audioContext.createBufferSource();
            source.buffer = clickSoundBuffer;
            source.connect(audioContext.destination);
            source.start();
         } else {
             console.warn("AudioContext is not running, cannot play sound.");
         }
    } else {
        // If sound not loaded, try loading it on this gesture
         loadSound('click.mp3');
    }
}

// Load the click sound on page load (or when user gesture occurs)
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
        counter.element.style.left = `${counter.posX}px`;
        counter.element.style.top = `${counter.posY}px`;
        counter.element.style.transform = `translate(-50%, -50%) rotate(${counter.angle}deg)`;

        // Check if the element is off-screen (with a generous margin)
        const isOffScreen = counter.posY > window.innerHeight + 200 ||
                            counter.posX < -200 ||
                            counter.posX > window.innerWidth + 200;

        // Remove element if animation is complete (e.g., based on a timer or off-screen)
        // For the shrinking animation, we might want to remove after the animation duration
        // Or just rely on being off-screen. Let's stick to off-screen for now as gravity handles it.
        // If using the shrink class, we could add a remove event listener 'animationend'
         const animationDurationMs = 1000; // Match the CSS animation duration
         if (currentTime - counter.startTime > animationDurationMs || isOffScreen) {
             // Ensure element still exists before trying to remove
             if (counter.element && counterContainer.contains(counter.element)) {
                 counterContainer.removeChild(counter.element);
             }
             activeCounters.splice(i, 1); // Remove from the active list
         }
    }

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
    for (let i = MULTIPLIER_LEVELS.length - 1; i >= 0; i--) {
        if (cps >= MULTIPLIER_LEVELS[i].cps) {
            return MULTIPLIER_LEVELS[i];
        }
    }
    return MULTIPLIER_LEVELS[0];
}

// Function to get a random uppercase letter
function randomLetter() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return letters.charAt(Math.floor(Math.random() * letters.length));
}

// Function to update the visibility state of alchemy counter, class display text, skill counter, and physics bar
function updateFeatureVisibility() {
    // Alchemy Counter Visibility
    const shouldShowAlchemy = clickCount >= ALCHEMY_COUNTER_UNLOCK_THRESHOLD;
    if (shouldShowAlchemy) {
         alchemyCounterElement.classList.remove('alchemy-counter-hidden');
    } else {
         alchemyCounterElement.classList.add('alchemy-counter-hidden');
    }

    // Class Display Text Visibility and Content
    if (selectedClass !== null) {
         classDisplayElement.textContent = `Class: ${selectedClass}`;
         classDisplayElement.classList.remove('class-display-hidden');
    } else {
         classDisplayElement.classList.add('class-display-hidden');
         classDisplayElement.textContent = ''; // Clear text when hidden
    }

     // Skill Counter Visibility
     const shouldShowSkillCounter = clickCount >= SKILL_TREE_UNLOCK_THRESHOLD || skillPoints > 0;
     if (shouldShowSkillCounter) {
         skillCounterElement.classList.remove('skill-counter-hidden');
     } else {
         skillCounterElement.classList.add('skill-counter-hidden');
     }

     // Physics Bar Visibility - Now hidden if Physics path is selected
     const isPhysicsSelected = isPhysicsPathSelected(selectedClass);
     // The bar is still shown if any other Science path is selected, or potentially for other uses later
     // For now, only show if a Science path is selected AND Alchemy is unlocked, and NOT Physics.
      const isSciencePathSelected = isChemistryPathSelected(selectedClass) || isBiologyPathSelected(selectedClass); // Don't include Physics here

      if (isSciencePathSelected && clickCount >= ALCHEMY_COUNTER_UNLOCK_THRESHOLD && !isPhysicsSelected) {
           // Show the bar and repurpose its text
            physicsBarElement.classList.remove('physics-bar-hidden');
            // The bar is currently based on physicsCount. Let's assume physicsCount is incremented for any Science activity.
            // PHYSICS_BAR_THRESHOLD constant doesn't exist. Let's use DEFAULT_ALCHEMY_THRESHOLD for now as a placeholder max.
            const PHYSICS_BAR_THRESHOLD = DEFAULT_ALCHEMY_THRESHOLD; // Placeholder max for generic Science bar
            physicsBarElement.textContent = `Science Activity: ${physicsCount}/${PHYSICS_BAR_THRESHOLD}`;
      } else {
          // Hide if no relevant Science path selected, Alchemy not unlocked, or Physics path *is* selected
          physicsBarElement.classList.add('physics-bar-hidden');
      }


    // Skill Tree Button Visibility
    if (clickCount >= SKILL_TREE_UNLOCK_THRESHOLD) {
        skillTreeButton.classList.remove('skill-tree-hidden');
    } else {
        skillTreeButton.classList.add('skill-tree-hidden');
    }
}

// Function to update the skill counter display
function updateSkillCounterDisplay() {
     skillCounterElement.textContent = `Skill Points: ${skillPoints}`;
}

// Function to update the physics bar display
function updatePhysicsBarDisplay() {
    // This display is now only relevant if a Science path *other than* Physics is selected
    // and the alchemy counter is unlocked.
    const isSciencePathButNotPhysicsSelected = isChemistryPathSelected(selectedClass) || isBiologyPathSelected(selectedClass);

    if (isSciencePathButNotPhysicsSelected && clickCount >= ALCHEMY_COUNTER_UNLOCK_THRESHOLD) {
         // Repurpose the bar text if not Physics
         // PHYSICS_BAR_THRESHOLD is undefined. Let's use DEFAULT_ALCHEMY_THRESHOLD as a placeholder max for the generic Science bar.
          const PHYSICS_BAR_THRESHOLD = DEFAULT_ALCHEMY_THRESHOLD; // Placeholder max
          physicsBarElement.textContent = `Science Activity: ${physicsCount}/${PHYSICS_BAR_THRESHOLD}`; // Use physicsCount as a generic Science counter
          physicsBarElement.classList.remove('physics-bar-hidden'); // Ensure it's visible if conditions met

     } else {
         // Hide if no Science path selected, Alchemy not unlocked, or Physics is selected
         physicsBarElement.classList.add('physics-bar-hidden');
     }
}


// Function to handle earning skill points
function checkEarnSkillPoint() {
    const currentThreshold = Math.floor(clickCount / SKILL_POINT_EARN_THRESHOLD) * SKILL_POINT_EARN_THRESHOLD;
    if (currentThreshold > lastSkillThreshold) {
        const pointsEarned = (currentThreshold - lastSkillThreshold) / SKILL_POINT_EARN_THRESHOLD;
        skillPoints += pointsEarned;
        lastSkillThreshold = currentThreshold;
        updateSkillCounterDisplay();
        console.log(`Earned ${pointsEarned} Skill Point(s)! Total: ${skillPoints}`); // Log for testing
        saveState(); // Save immediately after earning points
    }
}

// Function to create and animate a flying number
// Moved the logic from the click handler into a reusable function
function createAndAnimateFlyingNumber(value, text, color = null, isRainbow = false) {
     // Get the button's position to determine the animation start point
    const buttonRect = clickButton.getBoundingClientRect();

    // Set the starting position to the top center of the button
    const startX = buttonRect.left + buttonRect.width / 2;
    const startY = buttonRect.top; // Start right at the top edge of the button

    // Use the imported createFlyingNumber function
    createFlyingNumber(text, startX, startY, color, isRainbow, counterContainer, activeCounters);
}

// Function to calculate active buffs from unlocked nodes
function getActiveBuffs() {
    const buffs = {
        mathMultiplierBonus: 0, // Adds to base click multiplier (e.g., +0.1 or +1.5 or +4)
        scienceAlchemyThresholdReduction: 0, // Reduces alchemy threshold (e.g., -1 or to 3) - Handled in click logic, not here
        alchemyCriticalValueBonus: 0, // Adds to critical hit value (e.g., +16)
        elaTriggerChanceBonus: 0, // Adds to ELA trigger chance (e.g., +0.05)
        elaBonusLetterCount: 0, // Adds extra letters/value for ELA (e.g., +1) - Base ELA adds 1 letter
        socialStudiesShakeBonus: 0, // Adds to SS shake bonus (e.g., +36)
        socialStudiesShakeDurationReduction: 0, // Reduces shake duration threshold (e.g., -100)
        biologyParticleValueBonus: 0, // Adds to Biology particle value (e.g., +8)
        // Physics boost duration bonus is conceptually infinite if selected, not calculated here.
        // Passive income is handled in the interval based on unlocked nodes directly.
    };

    // Buffs calculated from *all unlocked nodes* but *applied conditionally* based on *selected class path*

    unlockedClasses.forEach(nodeName => {
        const nodeInfo = getNodeInfo(nodeName);
        if (!nodeInfo) return; // Should not happen

        const baseClass = getBaseClass(nodeName);
        const parentBranch = getParentBranch(nodeName);
        const level = getLevel(nodeName);


        // Math Buffs (Multiplier Bonus)
        if (baseClass === 'Math') {
             if (level === 1) { buffs.mathMultiplierBonus += 1; } // Base Math +1x (additive to base 1)
             else if (level === 2) { buffs.mathMultiplierBonus += 1.5; } // Math branches +1.5x (additive)
             else if (level === 3) { buffs.mathMultiplierBonus += 4; } // Math sub-branches +4x (additive)
        }

        // Science Buffs (Alchemy Threshold, Critical Value, Biology Value, Physics Duration)
        // Alchemy Threshold Reduction: Base Science (reduces by 5 from default 10 -> 5 if path selected). Handled in click logic.
        // Chem Branch (L2) sets threshold to 3 if selected. Handled in click logic.

        // Alchemy Critical Value Bonus: Pre Calc (Level 3 Math) & Chem branch/sub-branches (Level 2/3 Science).
        if (baseClass === 'Science' && (nodeName === 'Chem' || parentBranch === 'Chem')) { buffs.alchemyCriticalValueBonus += 16; } // Chem Branch (L2) and its Sub-branches (L3) add +16 crit value each
         // Also include Pre Calc (L3 Math) for critical value bonus
         if (baseClass === 'Math' && parentBranch === 'Pre Calc' && level === 3) { buffs.alchemyCriticalValueBonus += 16; }


        // Biology Particle Value Bonus: Biology sub-branches (L3)
        if (baseClass === 'Science' && parentBranch === 'Biology' && level === 3) { buffs.biologyParticleValueBonus += 8; } // Biology Sub-branches (L3) add +8 particle value

        // Physics Boost: Always active if Physics path selected. No specific numerical buff needed here for duration.


        // ELA Buffs (Trigger Chance, Bonus Letters/Value)
        if (baseClass === 'ELA') {
            // Base ELA adds 20% chance (handled in click logic if path selected) and 1 letter (handled in click logic if path selected)
             if (parentBranch === 'Writing' && level === 3) { buffs.elaTriggerChanceBonus += 0.05; } // Writing Sub-branches +5% chance (additive)
             if (parentBranch === 'Literature' && level === 3) { buffs.elaBonusLetterCount += 1; } // Literature Sub-branches +1 extra letter (additive)
        }

        // Social Studies Buffs (Shake Bonus, Shake Duration Reduction)
        if (baseClass === 'Social Studies') {
             if (level === 1) { buffs.socialStudiesShakeBonus += 72; } // Base SS +72 shake bonus (additive)
             // Reinterpreting SS branches bonus: Let's have L2 branches add a smaller amount than L1.
             // The original prompt said "Social Study branches give a higher cap of 128 per each click when spamming".
             // This sounds like it *sets* the cap higher, not adds to the bonus itself.
             // The last prompt said "Social Studies branches branches now have a cap of 512".
             // This implies 512 is the cap if any SS branch (L2 or L3) is unlocked and SS path is selected.
             // Let's adjust the logic: Shake bonus is *capped* based on unlocked SS nodes, rather than added up.
             // Alternatively, let's stick to the additive model for now but apply the cap.
             // Using additive model:
             if (level === 2 && (nodeName === 'History' || nodeName === 'Economics' || nodeName === 'Geography')) { buffs.socialStudiesShakeBonus += 128; } // SS Branches +128 shake bonus (additive, from original interpretation)
             if (parentBranch === 'Geography' && level === 3) { buffs.socialStudiesShakeBonus += 36; } // Geography Sub-branches +36 shake bonus (additive)

             if (parentBranch === 'History' && level === 3) { buffs.socialStudiesShakeDurationReduction += 100; } // History Sub-branches -100ms duration needed (additive reduction)
        }
    });

    // --- Apply buffs conditionally based on the currently selected class path ---
    const selectedBaseClass = getBaseClass(selectedClass);

    // Math multiplier bonus is always active if any Math node contributing to the bonus is unlocked
    // The total Math multiplier is 1 (base) + cumulative bonuses from unlocked Math nodes.
    // activeBuffs.mathMultiplierBonus already holds this cumulative bonus. Add the base 1.
    const totalMathMultiplier = 1 + buffs.mathMultiplierBonus;
    buffs.mathMultiplierBonus = totalMathMultiplier; // Overwrite with the actual total multiplier

    // Science Alchemy threshold reduction is active IF Science path is selected (base or any branch/sub)
    // AND the feature is unlocked by clickCount. This logic is handled in the click handler.
    // buffs.scienceAlchemyThresholdReduction is not needed here.

    // Alchemy Critical Value Bonus: Only active if Science path is selected *or* Pre Calc L3 (Math) is selected.
    // It's cumulative from unlocked nodes.
     const preCalcCritBonus = unlockedClasses.filter(node => getBaseClass(node) === 'Math' && getParentBranch(node) === 'Pre Calc' && getLevel(node) === 3).length * 16;
     const scienceCritBonus = unlockedClasses.filter(node => getBaseClass(node) === 'Science' && (node === 'Chem' || getParentBranch(node) === 'Chem')).length * 16;
     buffs.alchemyCriticalValueBonus = 0; // Reset from cumulative unlocked value
     if (selectedBaseClass === 'Science') {
          buffs.alchemyCriticalValueBonus += scienceCritBonus; // Add Science (Chem) bonus if Science path selected
     }
     if (selectedBaseClass === 'Math') {
          buffs.alchemyCriticalValueBonus += preCalcCritBonus; // Add Math (PreCalc) bonus if Math path selected
     }
     // Note: If user switches between Science (Chem) and Math (PreCalc), only the relevant bonus is active.

    // Biology Particle Value Bonus: Only active if Biology path is selected.
    // It's cumulative from unlocked L3 Biology nodes.
    const biologyCumulativeBonus = unlockedClasses.filter(node => getBaseClass(node) === 'Science' && getParentBranch(node) === 'Biology' && getLevel(node) === 3).length * 8;
    buffs.biologyParticleValueBonus = isBiologyPathSelected(selectedClass) ? biologyCumulativeBonus : 0;


    // ELA trigger chance and letters are only active IF ELA path is selected
    const elaCumulativeChanceBonus = unlockedClasses.filter(node => getBaseClass(node) === 'ELA' && getParentBranch(node) === 'Writing' && getLevel(node) === 3).length * 0.05;
    const elaCumulativeLetterBonus = unlockedClasses.filter(node => getBaseClass(node) === 'ELA' && getParentBranch(node) === 'Literature' && getLevel(node) === 3).length * 1;

    buffs.elaTriggerChanceBonus = isELAPathSelected(selectedClass) ? ELA_BASE_TRIGGER_CHANCE + elaCumulativeChanceBonus : 0;
    buffs.elaBonusLetterCount = isELAPathSelected(selectedClass) ? ELA_BASE_LETTER_COUNT + elaCumulativeLetterBonus : 0;


    // Social Studies shake bonus and duration reduction are only active IF SS path is selected
    const ssCumulativeShakeBonus = unlockedClasses.filter(node => {
         const nodeInfo = getNodeInfo(node);
         const base = getBaseClass(node);
         const parent = getParentBranch(node);
         const level = getLevel(node);
         return base === 'Social Studies' && (level === 1 || (level === 2 && (node === 'History' || node === 'Economics' || node === 'Geography')) || (level === 3 && parent === 'Geography'));
    }).reduce((sum, nodeName) => {
         const nodeInfo = getNodeInfo(nodeName);
         const level = getLevel(nodeName);
         if (level === 1) return sum + 72; // Base SS adds 72
         if (level === 2 && (nodeName === 'History' || nodeName === 'Economics' || nodeName === 'Geography')) return sum + 128; // SS Branches add 128 each (if unlocked)
         if (level === 3 && getParentBranch(nodeName) === 'Geography') return sum + 36; // Geography L3 adds 36 each (if unlocked)
         return sum;
    }, 0);

    const ssCumulativeDurationReduction = unlockedClasses.filter(node => getBaseClass(node) === 'Social Studies' && getParentBranch(node) === 'History' && getLevel(node) === 3).length * 100;

    buffs.socialStudiesShakeBonus = isSocialStudiesPathSelected(selectedClass) ? ssCumulativeShakeBonus : 0;
    buffs.socialStudiesShakeDurationReduction = isSocialStudiesPathSelected(selectedClass) ? ssCumulativeDurationReduction : 0;


    // Cap the Social Studies shake bonus if SS path is selected
    if (isSocialStudiesPathSelected(selectedClass) && buffs.socialStudiesShakeBonus > SOCIAL_STUDIES_SHAKE_BONUS_CAP) {
         buffs.socialStudiesShakeBonus = SOCIAL_STUDIES_SHAKE_BONUS_CAP;
     } else if (!isSocialStudiesPathSelected(selectedClass)) {
          buffs.socialStudiesShakeBonus = 0; // Ensure bonus is 0 if SS path not selected
     }


    // Passive income is active regardless of selected class, based purely on unlocked nodes
    // This is calculated directly in the interval, not passed via this buff object.


    return buffs;
}


clickButton.addEventListener('click', () => {
    // Play the click sound
    playClickSound();

    const currentTime = Date.now();
    clickTimestamps.push(currentTime); // Record the click timestamp

    const activeBuffs = getActiveBuffs(); // Get currently active buffs based on unlocked/selected classes
    const selectedNodeInfo = getNodeInfo(selectedClass); // Get info for the currently selected class
    const selectedBaseClass = getBaseClass(selectedClass);
    const selectedParentBranch = getParentBranch(selectedClass);


    // --- Check for Class Unlock (Random Assignment) ---
    if (clickCount < CLASS_UNLOCK_THRESHOLD && (clickCount + 1) >= CLASS_UNLOCK_THRESHOLD && selectedClass === null) {
        // Unlock class for the first time and assign a random one
        const randomIndex = Math.floor(Math.random() * BASE_CLASSES.length);
        selectedClass = BASE_CLASSES[randomIndex];
        unlockedClasses.push(selectedClass); // Add the initial class to unlocked
        console.log("Class Unlocked!", selectedClass); // Log for testing
        // The display update happens below in updateFeatureVisibility
    }

    // --- Variables for Flying Number ---
    let flyingNumberTextParts = []; // Array to build the flying number text
    let flyingNumberText = ''; // Initialize flyingNumberText at the start
    let flyingNumberValue = 0; // The actual value to add to clickCount
    let isCriticalHit = false;
    let flyingNumberColor = null; // Override color if needed
    let baseClickValue = 1; // Starting value before class multipliers
    let bonusValue = 0; // Bonus added by certain classes (like Alchemy Critical, ELA, SS)
    let extraText = ''; // Text for extra effects (like ELA letter)
    let isRainbow = false; // For Biology particles - handled in interval now


    // --- Handle Alchemy Counter and Critical Hits ---
    let potentialAlchemyCount = alchemyCount + 1;
    let currentAlchemyThreshold = DEFAULT_ALCHEMY_THRESHOLD; // Start with default

    const isSciencePath = selectedBaseClass === 'Science';
    const isChemBranch = selectedClass === 'Chem'; // L2 Chem
    const isChemSubBranch = isChemistrySubBranchSelected(selectedClass); // Any L3 Chem

    if (clickCount >= ALCHEMY_COUNTER_UNLOCK_THRESHOLD) {
         if (isSciencePath) {
             currentAlchemyThreshold = SCIENCE_ALCHEMY_THRESHOLD_BASE; // Base Science reduces threshold
             // If Chem Branch (L2) is selected, override threshold to 3
             if (isChemBranch) {
                  currentAlchemyThreshold = CHEM_BRANCH_ALCHEMY_THRESHOLD;
             }
              // No threshold logic needed for L3 Chem, critical is always active (handled below)
         }

         // Check if the *next* click will cause a critical hit based on threshold,
         // UNLESS an L3 Chem node is selected, in which case crit is always true.
         if (isChemSubBranch) {
             isCriticalHit = true; // Always critical if L3 Chem is selected
         } else if (potentialAlchemyCount > currentAlchemyThreshold) {
              isCriticalHit = true; // Critical hit based on threshold
         }

        // If critical hit is triggered (either by threshold or L3 Chem selection)
        if (isCriticalHit) {
           // Critical hit adds bonus value equal to BASE ALCHEMY VALUE + cumulative Alchemy Critical Bonus buff
           bonusValue += ALCHEMY_CRITICAL_VALUE_BASE + activeBuffs.alchemyCriticalValueBonus;
           extraText += 'CRITICAL '; // Add critical text prefix
           flyingNumberColor = 'rgba(255, 215, 0, 1.0)'; // Gold for Critical
           alchemyCount = 0; // Reset alchemy count to 0 after critical
        } else {
           alchemyCount = potentialAlchemyCount; // Increment alchemy count normally
        }

         alchemyCounterElement.textContent = `Alchemy: ${alchemyCount}/${currentAlchemyThreshold}`;

    } else {
         // Alchemy counter is not yet visible
         alchemyCount = 0; // Keep it at 0 until visible threshold is met
         alchemyCounterElement.textContent = `Alchemy: ${alchemyCount}/${currentAlchemyThreshold}`; // Update display just in case, though hidden
    }


    // --- Handle Physics Effect ---
    // If Physics path is selected, Physics boost is always active.
    const physicsBoostActive = isPhysicsPathSelected(selectedClass);
    // If a *different* Science path is selected (Chem/Bio), maybe increment a generic Science bar?
    // The physicsCount is used for this generic bar. It increments on any click if a Science path is selected, but not Physics.
     const isSciencePathButNotPhysicsSelected = isChemistryPathSelected(selectedClass) || isBiologyPathSelected(selectedClass);
     if (isSciencePathButNotPhysicsSelected && clickCount >= ALCHEMY_COUNTER_UNLOCK_THRESHOLD) {
         // This is where we'd increment a generic science counter
         physicsCount++;
         // Need a threshold for this bar. Using DEFAULT_ALCHEMY_THRESHOLD as a placeholder.
          const PHYSICS_BAR_THRESHOLD = DEFAULT_ALCHEMY_THRESHOLD; // Placeholder max
         if (physicsCount > PHYSICS_BAR_THRESHOLD) physicsCount = PHYSICS_BAR_THRESHOLD; // Cap it
         updatePhysicsBarDisplay(); // Update display
     } else {
          physicsCount = 0; // Reset if not on a Science path or Alchemy not unlocked
     }


    // --- Handle Chemistry Haste (Level 3 Chem nodes) ---
    // Check if Haste is currently active (triggered by interval for L3 Chem)
    const chemHasteActive = chemHasteActiveEndTime > currentTime;


    // --- Calculate Click Value (excluding biology passive) ---

    // Calculate base multiplier from CPS
    const currentCPS = calculateCPS(); // Calculate current CPS for multiplier
    const effect = getClickEffect(currentCPS); // Get multiplier based on CPS

    // Calculate total multiplier: CPS Multiplier * Math Multiplier (activeBuffs.mathMultiplierBonus is already 1 + unlocked bonuses if Math path is selected)
    const totalMultiplier = effect.multiplier * activeBuffs.mathMultiplierBonus;


    // Value from base click * total multiplier
    const multiplierValue = baseClickValue * totalMultiplier;


    // --- Handle ELA Bonus ---
    // ELA trigger chance includes base chance + writing sub-branch bonus
    // activeBuffs.elaTriggerChanceBonus is 0 unless ELA path is selected and Writing nodes unlocked.
     const elaTriggerChance = activeBuffs.elaTriggerChanceBonus;
    // activeBuffs.elaBonusLetterCount includes Base ELA (1 if path selected) + Literature (up to 3 if path selected)
     const elaLetterCount = activeBuffs.elaBonusLetterCount;

     if (isELAPathSelected(selectedClass) && elaLetterCount > 0 && Math.random() < elaTriggerChance) {
         // ELA triggered!
         // Each letter/bonus adds ELA_LETTER_VALUE. totalELABonusValue is now calculated from activeBuffs.elaBonusLetterCount.
         const totalELABonusValue = elaLetterCount * ELA_LETTER_VALUE;
         bonusValue += totalELABonusValue; // Add ELA bonus value to the total bonus

         // Add ELA letters text (just letters, no +value)
         for (let i = 0; i < elaLetterCount; i++) {
             extraText += randomLetter();
         }
         if (extraText) extraText += ' '; // Add space if letters were added

         // Only set color if it wasn't already set by a critical hit
         if (!flyingNumberColor) {
             flyingNumberColor = 'rgba(0, 150, 0, 1.0)'; // Green for ELA trigger
         }
     }

    // --- Handle Social Studies Bonus ---
    // Social Studies adds a bonus if the button is shaking (high speed) and SS path is active
    // activeBuffs.socialStudiesShakeBonus is 0 unless SS path selected and relevant nodes unlocked.
    // It's also capped in getActiveBuffs.
    if (isButtonShaking && isSocialStudiesPathSelected(selectedClass) && activeBuffs.socialStudiesShakeBonus > 0) {
        const ssBonus = activeBuffs.socialStudiesShakeBonus;
        bonusValue += ssBonus; // Add SS bonus
        // Don't override color if ELA or Critical also triggered this click
        if (!flyingNumberColor && !extraText.includes('CRITICAL')) { // Check if Critical didn't already set color
            flyingNumberColor = 'rgba(255, 140, 0, 1.0)'; // Orange for Social Studies bonus
        }
         // Add text for SS bonus
        if (ssBonus > 0) {
            // Add the SS bonus value to the extra text part, not the base multiplier part
            extraText += `+${Math.round(ssBonus)} (Shake) `;
        }
    }


    // Total flying value is multiplier value + bonus value (critical, ELA, SS)
    flyingNumberValue = multiplierValue + bonusValue; // No need to round until display


    // Build the flying number text parts
    // Always show the multiplier value part (this is the value from base click * total multiplier)
    flyingNumberTextParts.push('+' + Math.round(multiplierValue)); // Round multiplier part for display

     // Combine extra text and value parts
     // Prepend extraText if it exists, then join value parts
    flyingNumberText = (extraText ? extraText : '') + flyingNumberTextParts.join(' '); // Join parts with space


    // Apply CPS color if no special class color was set by Critical or ELA
    if (!flyingNumberColor) {
         flyingNumberColor = effect.color;
    }

    // Add the calculated value from the primary click
    clickCount += flyingNumberValue;


    // --- Create and Animate Flying Number(s) ---
    // Create the first flying number based on the calculated value/text
    createAndAnimateFlyingNumber(flyingNumberValue, flyingNumberText, flyingNumberColor, isRainbow);

    // If Physics path is selected OR Chem Haste is active, create a second flying number
    // This second number represents the "extra click" effect from the boost/haste
    if (physicsBoostActive || chemHasteActive) {
         // The value added by the boost/haste is essentially the base click value * multiplier.
         // Let's create a second flying number showing this value part again.
         const boostedValue = multiplierValue; // The value added by the second "click"
         const boostText = physicsBoostActive ? '(Physics)' : '(Haste)';
         // Use the same color or a slightly different one? Let's use the same color for consistency unless it was a critical hit (which often applies gold).
         // Let's use the base CPS color for the second number, unless the first was Critical/ELA/SS and we want to match.
         // Sticking to the same color for the second number seems reasonable.
         createAndAnimateFlyingNumber(boostedValue, `+${Math.round(boostedValue)} ${boostText}`, flyingNumberColor, false); // Create a duplicate visual number for boost/haste
         clickCount += boostedValue; // Add the value from the second "click"
    }


    // --- Update Displays and Feature Visibility ---
    mainCounterElement.textContent = `Counter: ${Math.round(clickCount)}`; // Update main counter display (round for display)

    // Check and earn skill points based on the new clickCount
    checkEarnSkillPoint();

    // Update visibility of alchemy counter, class display, skill counter, physics bar, and skill tree button
    updateFeatureVisibility();

    // Save state after updating counts and potentially selecting a class
    saveState();

});

// Add event listener for the Skill Tree button
skillTreeButton.addEventListener('click', () => {
    window.location.href = 'skilltree.html'; // Navigate to the skill tree page
});


// Interval to check tapping speed and trigger button shake
setInterval(() => {
    const currentTime = Date.now();
    const currentCPS = calculateCPS(); // Re-calculate CPS based on current time
    const activeBuffs = getActiveBuffs(); // Get active buffs

    // Calculate effective High Speed Duration needed, based on History buff
    const effectiveHighSpeedDuration = Math.max(300, HIGH_SPEED_DURATION_MS_BASE - activeBuffs.socialStudiesShakeDurationReduction); // Minimum 300ms

    // Only apply shake logic if Social Studies path is selected
    if (isSocialStudiesPathSelected(selectedClass)) {
         if (currentCPS >= HIGH_SPEED_THRESHOLD_CPS) {
             if (highSpeedStreakStartTime === 0) {
                 // Start streak
                 highSpeedStreakStartTime = currentTime;
             } else if (currentTime - highSpeedStreakStartTime >= effectiveHighSpeedDuration) {
                 // Streak maintained for the required duration, trigger shake
                 if (!isButtonShaking) {
                     clickButton.classList.add('shake');
                     isButtonShaking = true;
                     // No need to save state just for shaking
                 }
             }
         } else {
             // Speed dropped below threshold, reset streak timer and stop shake
             highSpeedStreakStartTime = 0; // Reset the streak timer
             if (isButtonShaking) {
                 clickButton.classList.remove('shake');
                 isButtonShaking = false;
                  // No need to save state just for shaking
             }
         }
    } else {
        // If SS path is not selected, ensure streak is reset and button is not shaking
        highSpeedStreakStartTime = 0;
        if (isButtonShaking) {
             clickButton.classList.remove('shake');
             isButtonShaking = false;
        }
    }


    // Check and trigger Chemistry Haste (Level 3 Chem nodes)
     const isChemSubBranchSelected = isChemistrySubBranchSelected(selectedClass);
     if (isChemSubBranchSelected) {
         // Check if enough time has passed since the last trigger *and* Haste is not already active
          if (currentTime - lastChemHasteTriggerTime >= CHEM_HASTE_INTERVAL_MS && chemHasteActiveEndTime <= currentTime) {
              chemHasteActiveEndTime = currentTime + CHEM_HASTE_DURATION_MS; // Activate Haste
              lastChemHasteTriggerTime = currentTime; // Record trigger time
               console.log("Chem Haste Activated!"); // Log for testing
              saveState(); // Save state when Haste activates
          }
          // Haste effect (double click) is handled in the click handler based on chemHasteActiveEndTime
     } else {
         // If not on a L3 Chem path, ensure haste is not active
          chemHasteActiveEndTime = 0;
          lastChemHasteTriggerTime = currentTime; // Reset trigger timer if not on path
     }

    // Check if Chemistry Haste has ended
     if (chemHasteActiveEndTime > 0 && currentTime >= chemHasteActiveEndTime) {
          chemHasteActiveEndTime = 0; // End Haste
          console.log("Chem Haste Ended."); // Log for testing
          saveState(); // Save state after Haste ends
     }


     // Physics boost no longer uses an interval timer as it's always active if selected
     // The physics bar update happens in the click handler and updateFeatureVisibility
     // The physicsCount increment for the generic bar also happens in the click handler.
     // We still need to update the *display* for the generic science bar here in case physicsCount changes due to other factors (not currently planned but good for robust code).
     updatePhysicsBarDisplay();


}, 100); // Check every 100ms for CPS, Shake, Haste


// Interval for passive income (Vocab, Economics) and Biology particles
setInterval(() => {
    const currentTime = Date.now();

    // --- Passive Income ---
    // Passive income is based on *unlocked* L3 Vocab/Economics nodes, regardless of selected class.
    const passiveIncomeFromVocab = unlockedClasses.filter(node => {
         const nodeInfo = getNodeInfo(node);
         // Check if it's a Level 3 Vocab node AND its base class (ELA) is also unlocked
         return nodeInfo && nodeInfo.level === 3 && nodeInfo.parent === 'Vocab' && isClassUnlocked('ELA');
    }).length * PASSIVE_INCOME_PER_NODE;

    const passiveIncomeFromEconomics = unlockedClasses.filter(node => {
         const nodeInfo = getNodeInfo(node);
          // Check if it's a Level 3 Economics node AND its base class (Social Studies) is also unlocked
         return nodeInfo && nodeInfo.level === 3 && nodeInfo.parent === 'Economics' && isClassUnlocked('Social Studies');
    }).length * PASSIVE_INCOME_PER_NODE;

     const totalPassiveIncomePerSecond = passiveIncomeFromVocab + passiveIncomeFromEconomics;


    if (totalPassiveIncomePerSecond > 0) {
        const elapsed = currentTime - lastPassiveIncomeTime;
        // Calculate income earned since last check based on elapsed time
        const incomeThisTick = totalPassiveIncomePerSecond * (elapsed / 1000); // Income per tick based on time

        if (incomeThisTick > 0.01) { // Only add if meaningful amount
             clickCount += incomeThisTick; // Add passive income to total count
             mainCounterElement.textContent = `Counter: ${Math.round(clickCount)}`; // Update main counter display (round for display)

             // Create and animate flying number for passive income
             // Need a different origin point for passive income
              const centerX = window.innerWidth / 2;
              const centerY = window.innerHeight / 2;
              // Place passive numbers slightly off center button
             // Use the imported createFlyingNumber directly
             createFlyingNumber(`+${Math.round(incomeThisTick)} (Passive)`, centerX + Math.random() * 50 - 25, centerY + 50 + Math.random() * 20 - 10, 'rgba(138, 43, 226, 0.8)', false, counterContainer, activeCounters); // Purple for passive, slightly random position

             checkEarnSkillPoint(); // Check for skill points after adding passive value
             // No need to updateFeatureVisibility here, it's handled by click/load/other intervals

             saveState(); // Save state after passive income
        }
    }
     lastPassiveIncomeTime = currentTime; // Update last passive income time


    // --- Biology Particles ---
    // Biology particles are active if Biology path is selected.
    // Value is based on Base + unlocked L3 Biology nodes (handled by getActiveBuffs).
    const isBiologyPath = isBiologyPathSelected(selectedClass);
    const activeBuffs = getActiveBuffs(); // Need buffs for biology particle value

    if (isBiologyPath && (currentTime - biologyLastParticleTime >= BIOLOGY_PARTICLE_INTERVAL_MS)) {
        biologyLastParticleTime = currentTime; // Update last particle time

        // Calculate Biology particle value based on new base + sub-branch bonus
        // activeBuffs.biologyParticleValueBonus is 0 unless Biology path is selected and L3 Biology nodes unlocked.
        // This seems slightly contradictory. Let's refine the logic:
        // Biology particle value is BASE + SUM of unlocked L3 Bio nodes * 8. This happens REGARDLESS of selected class.
        // The particles SPAWN only if Biology path is selected.
        // Let's calculate the potential bonus value based on UNLOCKED nodes here:
         const biologyCumulativeBonus = unlockedClasses.filter(node => getBaseClass(node) === 'Science' && getParentBranch(node) === 'Biology' && getLevel(node) === 3).length * 8;
         const biologyParticleValue = BIOLOGY_PARTICLE_VALUE_BASE + biologyCumulativeBonus;


        if (isBiologyPath) { // Only spawn particles if Biology path is selected
            clickCount += biologyParticleValue; // Add value to total count
            mainCounterElement.textContent = `Counter: ${Math.round(clickCount)}`; // Update main counter display (round for display)

             // Create and animate the Biology particle flying number
             // Particles don't originate from the button, they appear randomly near the center.
             const centerX = window.innerWidth / 2;
             const centerY = window.innerHeight / 2;
             // Position the particle slightly off center
             createFlyingNumber(`+${biologyParticleValue} (DNA)`, centerX + Math.random() * 100 - 50, centerY + Math.random() * 100 - 50, null, true, counterContainer, activeCounters); // Use rainbow color, slightly random position


            checkEarnSkillPoint(); // Check for skill points after adding Biology value
            // No need to updateFeatureVisibility here

            saveState(); // Save state after Biology particle
        }
    }

}, 1000); // Check every 1 second for passive income and Biology particles


// Initial state check on page load
document.addEventListener('DOMContentLoaded', () => {
    loadState(); // Load state from localStorage
    animateCounters(); // Start animation loop immediately on load
});
