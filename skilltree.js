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

const getNodeInfo = (className) => SKILL_TREE_NODES[className];
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
const isBaseClass = (className) => { const node = getNodeInfo(className); return node ? node.level === 1 : false; };
const isBranchClass = (className) => { const node = getNodeInfo(className); return node ? node.level === 2 : false; };
const isSubBranchClass = (className) => { const node = getNodeInfo(className); return node ? node.level === 3 : false; };
const BASE_CLASSES = ["Math", "Science", "ELA", "Social Studies"];


const getSymbolForClass = (className) => {
     const nodeInfo = getNodeInfo(className);
     return nodeInfo && nodeInfo.symbol ? nodeInfo.symbol : '?';
};

let selectedClass = null;
let unlockedClasses = [];
let skillPoints = 0; // Need to load and save skill points

const skillTreeContainer = document.getElementById('skillTreeContainer');
const backButton = document.getElementById('backButton');
const skillPointsDisplay = document.getElementById('skillPointsDisplay'); // Get the new display element
const skillTreeWrapper = document.getElementById('skillTreeWrapper'); // Get the wrapper element


// Drag functionality state (using translate now)
let isDragging = false;
let startMouseX;
let startMouseY;
let startTranslateX;
let startTranslateY;


// Load state from localStorage
function loadState() {
    try {
        selectedClass = localStorage.getItem('selectedClass');
        unlockedClasses = JSON.parse(localStorage.getItem('unlockedClasses') || '[]');
        skillPoints = parseInt(localStorage.getItem('skillPoints') || '0', 10); // Load skill points

         // --- Ensure Base Classes Are Always Unlocked ---
         // Add any base class that is NOT already in unlockedClasses.
         BASE_CLASSES.forEach(baseClass => {
             if (!unlockedClasses.includes(baseClass)) {
                 unlockedClasses.push(baseClass);
             }
         });
         // If no class is selected and base classes are now unlocked, default to selecting the first one or keep null
         if (selectedClass === null && unlockedClasses.length > 0) {
              // Keep selectedClass as null if nothing was previously selected, user must choose
         }
          // If a class was previously selected but is no longer in unlocked (shouldn't happen with base classes always unlocked now), reset selection
          if (selectedClass !== null && !unlockedClasses.includes(selectedClass)) {
               selectedClass = null;
          }
         // --- End Ensure Base Classes Always Unlocked ---


    } catch (e) {
        console.error("Error loading skill tree state from localStorage:", e);
        selectedClass = null;
        unlockedClasses = [];
         // Ensure base classes are unlocked even after a load error
         BASE_CLASSES.forEach(baseClass => {
             if (!unlockedClasses.includes(baseClass)) {
                 unlockedClasses.push(baseClass);
             }
         });
        skillPoints = 0;
    }
}

// Save state to localStorage
function saveState() {
    try {
        localStorage.setItem('selectedClass', selectedClass);
        localStorage.setItem('unlockedClasses', JSON.stringify(unlockedClasses));
        localStorage.setItem('skillPoints', skillPoints); // Save skill points
    } catch (e) {
        console.error("Error saving skill tree state to localStorage:", e);
    }
}

// Function to get current transform values
function getTranslateXY(element) {
    const style = window.getComputedStyle(element);
    const matrix = style.transform;

    // No transform applied
    if (matrix === 'none') {
        return { x: 0, y: 0 };
    }

    // Matrix format: matrix(scaleX, skewY, skewX, scaleY, translateX, translateY)
    const matrixValues = matrix.match(/matrix.*\((.+)\)/)[1].split(', ');
    const x = parseFloat(matrixValues[4]);
    const y = parseFloat(matrixValues[5]);

    return { x, y };
}


// Render the skill tree
function renderTree() {
    skillTreeContainer.innerHTML = ''; // Clear previous rendering
    skillPointsDisplay.textContent = `Skill Points: ${skillPoints}`; // Update skill points display

    // Create Level 1 (Base Classes)
    const level1Div = document.createElement('div');
    level1Div.classList.add('tree-level', 'level-1');

    // Filter nodes to get only Level 1 nodes
    const level1Nodes = Object.keys(SKILL_TREE_NODES).filter(key => SKILL_TREE_NODES[key].level === 1);

    level1Nodes.forEach(className => {
        const nodeInfo = getNodeInfo(className);
        const node = document.createElement('div');
        node.classList.add('node', 'base-class');
        node.title = className; // Use title for hover text

        // Add symbol element
        const symbolSpan = document.createElement('span');
        symbolSpan.classList.add('node-symbol');
        symbolSpan.textContent = getSymbolForClass(className);
        node.appendChild(symbolSpan);

        node.dataset.class = className; // Store class name in data attribute
        node.dataset.level = nodeInfo.level;

        const isUnlocked = unlockedClasses.includes(className);

        if (isUnlocked) {
            node.classList.add('unlocked'); // Base classes are now always unlocked from load
        } else {
             // This case should technically not happen anymore for base classes
            node.classList.add('locked');
        }

        // Check if this is the currently selected class
        if (selectedClass === className) {
            node.classList.add('selected');
        }

        // Add click listener
        node.addEventListener('click', handleNodeClick);

        level1Div.appendChild(node);
    });
    skillTreeContainer.appendChild(level1Div);

    // Create container for Level 2 & 3 nodes
    const level2_3Container = document.createElement('div');
    level2_3Container.classList.add('tree-level', 'level-2-3-container'); // Use a combined container

    // Create a group for each base class's branches and sub-branches
    level1Nodes.forEach(baseClass => {
        const groupDiv = document.createElement('div');
        groupDiv.classList.add('node-group');
        groupDiv.dataset.baseClass = baseClass;

        // Base class is always unlocked now, so its branches are potentially unlockable
        const baseClassUnlocked = true; // Assuming base class is always unlocked

        // Filter nodes to get Level 2 nodes whose parent is this baseClass
        const branchNodes = Object.keys(SKILL_TREE_NODES).filter(key => SKILL_TREE_NODES[key].level === 2 && SKILL_TREE_NODES[key].parent === baseClass);

        branchNodes.forEach(branchName => {
             const branchNodeInfo = getNodeInfo(branchName);
             const subBranchClasses = Object.keys(SKILL_TREE_NODES).filter(key => SKILL_TREE_NODES[key].level === 3 && SKILL_TREE_NODES[key].parent === branchName); // Get Level 3 nodes for this branch

             // Create a container for the branch and its sub-branches
             const branchContainer = document.createElement('div');
             branchContainer.classList.add('branch-container');

             // --- Level 2 Node (Branch) ---
             const branchNode = document.createElement('div');
             branchNode.classList.add('node', 'branch-class');
             branchNode.title = branchName; // Use title for hover text

              // Add symbol element
             const branchSymbolSpan = document.createElement('span');
             branchSymbolSpan.classList.add('node-symbol');
             branchSymbolSpan.textContent = getSymbolForClass(branchName);
             branchNode.appendChild(branchSymbolSpan);

             branchNode.dataset.class = branchName; // Store class name
             branchNode.dataset.level = branchNodeInfo.level;
             branchNode.dataset.cost = branchNodeInfo.cost; // Store cost

             const isBranchUnlocked = unlockedClasses.includes(branchName);

             if (isBranchUnlocked) {
                branchNode.classList.add('unlocked');
             } else if (baseClassUnlocked) { // Prerequisite: parent base class must be unlocked (which is always true now)
                 branchNode.classList.add('unlockable'); // Visually indicate it can be unlocked
                 // Add cost display
                 const costSpan = document.createElement('span');
                 costSpan.classList.add('cost');
                 costSpan.textContent = branchNodeInfo.cost;
                 branchNode.appendChild(costSpan);
             } else {
                 // This case should technically not happen anymore for Level 2 nodes
                 branchNode.classList.add('locked'); // Visually indicate locked
             }

             // Check if this is the currently selected class
             if (selectedClass === branchName) {
                 branchNode.classList.add('selected');
             }

             // Add click listener
             branchNode.addEventListener('click', handleNodeClick);
             branchContainer.appendChild(branchNode); // Add branch node to its container

             // --- Add vertical line below branch node if unlocked ---
             // Handled by CSS pseudo-elements based on node class
             // if (!branchNode.classList.contains('locked')) { ... }

             // --- Level 3 Nodes (Sub-Branches) ---
             if (subBranchClasses && subBranchClasses.length > 0) {
                 const subTreeContainer = document.createElement('div');
                 subTreeContainer.classList.add('subtree-container');

                  // Add horizontal line above subtree nodes if parent branch is unlocked
                 // Handled by CSS pseudo-elements based on branch node class
                 // if (!branchNode.classList.contains('locked')) { ... }

                 subBranchClasses.forEach(subBranchName => {
                     const subBranchNodeInfo = getNodeInfo(subBranchName);
                     const subBranchNode = document.createElement('div');
                     subBranchNode.classList.add('node', 'sub-branch-class');
                     subBranchNode.title = subBranchName; // Use title for hover text

                      // Add symbol element
                     const subBranchSymbolSpan = document.createElement('span');
                     subBranchSymbolSpan.classList.add('node-symbol');
                     subBranchSymbolSpan.textContent = getSymbolForClass(subBranchName);
                     subBranchNode.appendChild(subBranchSymbolSpan);

                     subBranchNode.dataset.class = subBranchName; // Store class name
                     subBranchNode.dataset.level = subBranchNodeInfo.level;
                     subBranchNode.dataset.cost = subBranchNodeInfo.cost; // Store cost

                     const isSubBranchUnlocked = unlockedClasses.includes(subBranchName);
                     const isBranchUnlocked = unlockedClasses.includes(branchName); // Prerequisite: parent branch must be unlocked

                     if (isSubBranchUnlocked) {
                         subBranchNode.classList.add('unlocked');
                     } else if (isBranchUnlocked) { // Prerequisite: parent branch must be unlocked
                         subBranchNode.classList.add('unlockable'); // Visually indicate it can be unlocked
                         // Add cost display
                         const costSpan = document.createElement('span');
                         costSpan.classList.add('cost');
                         costSpan.textContent = subBranchNodeInfo.cost;
                         subBranchNode.appendChild(costSpan);
                     } else {
                         subBranchNode.classList.add('locked'); // Visually indicate locked
                     }

                      // Check if this is the currently selected class
                     if (selectedClass === subBranchName) {
                         subBranchNode.classList.add('selected');
                     }

                     // Add click listener
                     subBranchNode.addEventListener('click', handleNodeClick);
                     subTreeContainer.appendChild(subBranchNode); // Add sub-branch node to its container
                 });
                 branchContainer.appendChild(subTreeContainer); // Add the sub-tree container to the branch container
             }

             groupDiv.appendChild(branchContainer); // Add the branch container to the group
        });
        level2_3Container.appendChild(groupDiv); // Add the group to the combined container
    });
    skillTreeContainer.appendChild(level2_3Container);

    // CSS pseudo-elements should now draw the lines automatically based on the structure and classes
    // Initial centering of the container
    centerSkillTree();
}

// Handle click on a skill tree node
function handleNodeClick(event) {
    // Check if the user was dragging (rely on the flag set by mousemove/touchmove)
     if (isDragging) {
         // This click was likely part of a drag gesture. Ignore it.
         // The event listener with capture phase should handle preventing default
         // but adding a check here ensures no action is taken.
         // console.log("Click ignored: Dragging detected."); // Reduce console noise
         return;
     }


    const clickedNode = event.target.closest('.node'); // Ensure we get the node even if clicking the cost span or symbol
    if (!clickedNode) return;

    // Don't handle clicks on locked nodes
    if (clickedNode.classList.contains('locked')) {
         // console.log(`Node "${clickedNode.dataset.class}" is locked.`); // Reduce console noise
         return;
    }

    const clickedClass = clickedNode.dataset.class;
    const nodeInfo = getNodeInfo(clickedClass);
    if (!nodeInfo) return; // Should not happen

    const level = nodeInfo.level;
    const cost = nodeInfo.cost || 0; // Get cost, default to 0 for base classes

    const isUnlocked = unlockedClasses.includes(clickedClass);

    if (!isUnlocked) {
        // Attempting to unlock a node
        let prerequisiteMet = false;
        let logMessage = `Cannot unlock ${clickedClass}.`;

        if (level === 1) {
            // Base classes are always unlocked from load now, so this branch should not be reachable for L1 nodes.
            // Add a failsafe message.
            logMessage = `Base class "${clickedClass}" is already unlocked from the beginning. Click to select it.`;
            console.log(logMessage);
             // Treat this as trying to select an already unlocked base class
             selectedClass = clickedClass;
             saveState(); // Save the selection
             renderTree(); // Re-render to show selection
             return;
        } else {
            // Level 2 or Level 3 node - check parent prerequisite
            const parentClass = nodeInfo.parent;
            if (unlockedClasses.includes(parentClass)) {
                 prerequisiteMet = true;
            } else {
                 logMessage += ` Prerequisite "${parentClass}" is not unlocked.`;
            }
        }

        if (!prerequisiteMet) {
             console.log(logMessage);
             // Maybe display a message to the user?
             return; // Stop here if prerequisite is not met
        }

        if (cost > 0 && skillPoints < cost) {
             logMessage += ` Not enough skill points (Need ${cost}, Have ${skillPoints}).`;
             console.log(logMessage);
             // Maybe display a message to the user?
             return; // Stop here if not enough points
        }

        // If we reach here, prerequisite is met and cost is met
        unlockedClasses.push(clickedClass);
        skillPoints -= cost; // Subtract cost
        console.log(`Unlocked: ${clickedClass}. Spent ${cost} Skill Points. Remaining Skill Points: ${skillPoints}`);

        // Automatically select the newly unlocked node
        selectedClass = clickedClass;
        console.log(`Selected: ${selectedClass}`); // For testing

    } else {
         // Class is already unlocked, allow selecting it
        selectedClass = clickedClass;
        console.log(`Selected: ${selectedClass}`); // For testing
    }


    saveState();    // Save the updated state
    renderTree();   // Re-render the tree to show unlocked/selected state
}


// Event listener for the back button
backButton.addEventListener('click', () => {
    window.location.href = 'index.html'; // Navigate back to the main game page
});


// --- Drag Functionality (using translate) ---
skillTreeWrapper.addEventListener('mousedown', (e) => {
    // Only start dragging if not clicking on a node or button
    if (!e.target.closest('.node') && e.target.id !== 'backButton') {
        isDragging = true;
        skillTreeWrapper.classList.add('dragging');
        startMouseX = e.clientX; // Use clientX/Y for screen coordinates
        startMouseY = e.clientY;

        const currentTranslate = getTranslateXY(skillTreeContainer);
        startTranslateX = currentTranslate.x;
        startTranslateY = currentTranslate.y;

        // Add listeners to document to handle mouseup outside the wrapper
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        e.preventDefault(); // Prevent default drag behavior (like selecting text)
    }
});

skillTreeWrapper.addEventListener('touchstart', (e) => {
     // Only start dragging if not clicking on a node or button
     if (!e.target.closest('.node') && e.target.id !== 'backButton') {
         isDragging = true;
         skillTreeWrapper.classList.add('dragging');
         const touch = e.touches[0];
         startMouseX = touch.clientX;
         startMouseY = touch.clientY;

         const currentTranslate = getTranslateXY(skillTreeContainer);
         startTranslateX = currentTranslate.x;
         startTranslateY = currentTranslate.y;

         // Add listeners to document for touchmove and touchend
         document.addEventListener('touchmove', onTouchMove, { passive: false }); // passive: false needed for preventDefault
         document.addEventListener('touchend', onTouchEnd);
         e.preventDefault(); // Prevent default touch behavior (like scrolling)
     }
});


function onMouseMove(e) {
    if (!isDragging) return;
    e.preventDefault(); // Prevent text selection etc.
    const currentMouseX = e.clientX;
    const currentMouseY = e.clientY;

    // Calculate how much the mouse has moved
    const deltaX = currentMouseX - startMouseX;
    const deltaY = currentMouseY - startMouseY;

    // Calculate new translate values
    const newTranslateX = startTranslateX + deltaX;
    const newTranslateY = startTranslateY + deltaY;

    // Apply new transform
    skillTreeContainer.style.transform = `translate(${newTranslateX}px, ${newTranslateY}px)`;
}

function onTouchMove(e) {
    if (!isDragging) return;
     e.preventDefault(); // Prevent default scrolling
    const touch = e.touches[0];
    const currentMouseX = touch.clientX;
    const currentMouseY = touch.clientY;

     const deltaX = currentMouseX - startMouseX;
     const deltaY = currentMouseY - startMouseY;

     const newTranslateX = startTranslateX + deltaX;
     const newTranslateY = startTranslateY + deltaY;

    skillTreeContainer.style.transform = `translate(${newTranslateX}px, ${newTranslateY}px)`;
}

function onMouseUp() {
    if (!isDragging) return;
    // Delay setting isDragging to false slightly to distinguish click from drag
     setTimeout(() => { isDragging = false; }, 50);
    skillTreeWrapper.classList.remove('dragging');
    // Remove listeners from document
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}

function onTouchEnd() {
     if (!isDragging) return;
     // Delay setting isDragging to false slightly
     setTimeout(() => { isDragging = false; }, 50);
     skillTreeWrapper.classList.remove('dragging');
     document.removeEventListener('touchmove', onTouchMove);
     document.removeEventListener('touchend', onTouchEnd);
}

// Function to center the skill tree container
function centerSkillTree() {
    // Wait for the container to have its content and determine its size
     requestAnimationFrame(() => {
        const wrapperRect = skillTreeWrapper.getBoundingClientRect();
        const containerRect = skillTreeContainer.getBoundingClientRect();

        // Calculate center position
        const centerX = (wrapperRect.width / 2) - (containerRect.width / 2);
        const centerY = (wrapperRect.height / 2) - (containerRect.height / 2);

        // Apply initial transform to center it
        skillTreeContainer.style.transform = `translate(${centerX}px, ${centerY}px)`;
     });
}


// Add a check on click to see if a drag just occurred
document.addEventListener('click', (e) => {
    // If the `isDragging` flag is true when click/touchend fires, it means the user likely intended a drag, not a click.
     if (isDragging) {
         // Prevent the click event if a drag was in progress (even a tiny one)
         e.preventDefault();
         e.stopImmediatePropagation(); // Stop propagation immediately to prevent other click listeners
         // The isDragging flag is already reset by the mouseup/touchend handler with a delay
         return; // Stop processing this click
    }
}, true); // Use capture phase to intercept clicks before node handlers


// Initial load and render when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    renderTree(); // Render the tree first
    // Centering is called within renderTree after content is added
});
