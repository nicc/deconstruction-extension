// --- CONFIGURATION ---
const DECONSTRUCTION_BASE_RATE_MS = 200; // A faster rate is needed for the new, more efficient logic.
const ITEMS_PER_BURST = 9;              // A larger burst size to process elements more quickly.
const INITIAL_PAUSE_MS = 300;

/**
 * The unified list of deconstruction actions, now processed sequentially.
 * This is the "blueprint" for our state machine.
 */
const DECONSTRUCTION_PHASES = [
    { name: 'Scripts',          selector: 'script',           action: 'remove' },
    { name: 'Stylesheets',      action: 'removeStyles' }, // Special action for CSS rules
    { name: 'Structural',       selector: 'div, section, article, main, aside, header, footer, nav, iframe', action: 'unwrap' },
    { name: 'Lists & Tables',   selector: 'ul, ol, table, form, fieldset, li, tr, td, th, figure, figcaption', action: 'unwrap' },
    { name: 'Media',            selector: 'video, canvas, svg, picture', action: 'unwrap' },
    { name: 'Images',           selector: 'img',              action: 'replaceWithSrc' },
    { name: 'Text Semantics',   selector: 'h1, h2, h3, h4, h5, h6, p, blockquote, a, span, strong, em, b, i, label', action: 'unwrap' }
];

// --- MAIN LOGIC ---

(() => {
    if (window.deconstructionInProgress) return;
    window.deconstructionInProgress = true;
    console.log("de(con)struction initialized: State Machine mode engaged.");

    let allQueryableRoots = [];
    let currentPhaseIndex = 0; // Our state machine's "pointer"

    /**
     * Aggressively "disarms" the page by cloning the body to strip all JS event listeners.
     * This is a critical step for complex, reactive websites.
     */
    const disarmPage = () => {
        console.log("Disarming page: Cloning body to remove event listeners...");
        const oldBody = document.body;
        const newBody = oldBody.cloneNode(true);
        oldBody.parentNode.replaceChild(newBody, oldBody);
        
        // After cloning, we must re-discover all shadow roots.
        const rootSet = new Set([document]);
        findAllQueryableRoots(document.body, rootSet);
        allQueryableRoots = Array.from(rootSet);
        console.log(`Disarmed. Found ${allQueryableRoots.length} queryable roots.`);
    };

    const findAllQueryableRoots = (node, roots) => {
        if (node.shadowRoot) {
            roots.add(node.shadowRoot);
            findAllQueryableRoots(node.shadowRoot, roots);
        }
        for (const child of node.children) {
            findAllQueryableRoots(child, roots);
        }
    };
    
    const performDeconstructionBurst = () => {
        // Check if we are done with all phases.
        if (currentPhaseIndex >= DECONSTRUCTION_PHASES.length) {
            console.log("--- de(con)struction Complete ---");
            window.deconstructionInProgress = false;
            return;
        }

        const currentPhase = DECONSTRUCTION_PHASES[currentPhaseIndex];
        let elementsToProcess = [];
        let phaseComplete = false;

        // Handle the special case for removing CSS rules
        if (currentPhase.action === 'removeStyles') {
            const rulesRemoved = deconstructStyles(ITEMS_PER_BURST);
            if (!rulesRemoved) phaseComplete = true;
        } else {
            // Standard element processing for all other phases
            allQueryableRoots.forEach(root => {
                root.querySelectorAll(currentPhase.selector).forEach(el => elementsToProcess.push(el));
            });
            
            if (elementsToProcess.length > 0) {
                // Process the *first N* elements found, not random ones. This is deterministic.
                const burst = elementsToProcess.slice(0, ITEMS_PER_BURST);
                burst.forEach(element => {
                    if (!element || !element.parentNode) return;
                    
                    switch (currentPhase.action) {
                        case 'remove': element.remove(); break;
                        case 'unwrap': unwrapElement(element); break;
                        case 'replaceWithSrc': replaceImageWithSrc(element); break;
                    }
                });
            } else {
                phaseComplete = true;
            }
        }
        
        // If the current phase is complete, advance the state machine.
        if (phaseComplete) {
            console.log(`Phase '${currentPhase.name}' complete. Moving to next phase.`);
            currentPhaseIndex++;
        }

        // Schedule the next burst.
        const baseDelay = (DECONSTRUCTION_BASE_RATE_MS * 0.5) + (Math.random() * DECONSTRUCTION_BASE_RATE_MS);
        const randomDelay = ['Structural', 'Lists & Tables'].includes(currentPhase.name) ? baseDelay / 3 : baseDelay;
        setTimeout(performDeconstructionBurst, randomDelay);
    };
    
    // --- Action Implementations ---

    const deconstructStyles = (count) => {
        const allRules = [];
        for (const sheet of document.styleSheets) {
            try {
                if (sheet.cssRules) { // Check if rules are accessible
                    for (let i = 0; i < sheet.cssRules.length; i++) allRules.push({ sheet, index: i });
                }
            } catch (e) { /* Ignore cross-origin stylesheet errors */ }
        }
        if (allRules.length === 0) return false;
        // Always remove from the end to avoid re-indexing issues
        allRules.sort((a, b) => b.index - a.index);
        for (let i = 0; i < count && allRules.length > 0; i++) {
            const ruleRef = allRules.shift();
            try { ruleRef.sheet.deleteRule(ruleRef.index); } catch (e) {}
        }
        return true;
    };

    const unwrapElement = (el) => {
        const parent = el.parentNode;
        if (!parent) return;
        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        el.remove();
    };

    const replaceImageWithSrc = (img) => {
        const srcText = img.src || 'local/cached image';
        const textNode = document.createTextNode(`[Image: ${srcText}] `);
        img.parentNode.replaceChild(textNode, img);
    };

    // --- Start the Process ---
    disarmPage();
    setTimeout(performDeconstructionBurst, INITIAL_PAUSE_MS);

})();