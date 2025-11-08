// PDF Certificate Creator
function createCertificate(name, course, score, filename = 'certificate.pdf') {
    if (typeof jsPDF === 'undefined') {
        console.error('jsPDF not loaded');
        return;
    }
    // Create PDF in landscape orientation
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });
    
    // Set background color
    doc.setFillColor(247, 247, 247);
    doc.rect(0, 0, 297, 210, 'F');
    
    // Add decorative border
    doc.setDrawColor(44, 62, 80);
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);
    doc.setLineWidth(0.5);
    doc.rect(12, 12, 273, 186);
    
    // Add header text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(40);
    doc.setTextColor(44, 62, 80);
    doc.text('Certificate of Completion', 148.5, 40, { align: 'center' });
    
    // Add decoration line
    doc.setLineWidth(1);
    doc.line(74, 45, 223, 45);
    
    // Add main text
    doc.setFontSize(20);
    doc.setFont('helvetica', 'normal');
    doc.text('This is to certify that', 148.5, 70, { align: 'center' });
    
    // Add name
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 204);
    doc.text(String(name), 148.5, 90, { align: 'center' });
    
    // Add course details
    doc.setFontSize(20);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(44, 62, 80);
    doc.text('has successfully completed the course', 148.5, 110, { align: 'center' });
    
    // Add course name
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(String(course), 148.5, 130, { align: 'center' });
    
    // Add score
    doc.setFontSize(20);
    doc.setFont('helvetica', 'normal');
    doc.text('with a score of', 148.5, 150, { align: 'center' });
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 204);
    doc.text(String(score) + '%', 148.5, 170, { align: 'center' });
    
    // Add date with specific format
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(44, 62, 80);
    const now = new Date();
    const date = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`; // MM/DD/YYYY format
    console.log('[Certificate] Generated on:', date);
    doc.text(date, 148.5, 185, { align: 'center' });
    
    // Save the PDF
    doc.save(filename);
}

// Expose functions for inline onclick handlers
window.createCertificate = createCertificate;

// --- Shortcode initializer: wire input/button behavior for .pdf-button-shortcode ---
(function () {
    function parseScore(scoreStr) {
        if (typeof scoreStr === 'number') return scoreStr;
        if (!scoreStr) return 0;
        
        // Convert to string and clean up
        var s = String(scoreStr).trim();
        console.log('[Score Parser] Input:', s);

        // Try percentage format first (92%)
        var m = s.match(/(\d+(?:\.\d+)?)\s*%/);
        if (m) {
            var score = Number(m[1]);
            console.log('[Score Parser] Percentage match:', score + '%');
            return score;
        }
        
        // Try fraction format (02/02, 2/10, etc)
        var f = s.match(/(\d+)\s*\/\s*(\d+)/);
        if (f) {
            // Parse as integers to handle leading zeros (02/02 → 2/2)
            var numerator = parseInt(f[1], 10);
            var denominator = parseInt(f[2], 10);
            var score = denominator ? (numerator / denominator * 100) : 0;
            console.log('[Score Parser] Fraction match:', numerator + '/' + denominator, '=', score + '%');
            return score;
        }
        
        // Try plain number
        var n = Number(s);
        if (!isNaN(n)) {
            console.log('[Score Parser] Number match:', n);
            return n;
        }

        console.log('[Score Parser] No match found, returning 0');
        return 0;
    }

    function enableButton(el, score) {
        var btn = el.querySelector('.pdf-generate');
        var status = el.querySelector('.pdf-status');
        if (!btn) return;
        btn.disabled = false;
        btn.setAttribute('aria-disabled', 'false');
        btn.style.opacity = '';
        if (status) { 
            status.textContent = `You passed with ${Math.round(score)}%`; 
            status.style.color = '#28a745'; 
        }
        console.log('[PDF Button] Enabled with score:', score);
    }

    function disableButton(el, score) {
        var btn = el.querySelector('.pdf-generate');
        var status = el.querySelector('.pdf-status');
        if (!btn) return;
        btn.disabled = true;
        btn.setAttribute('aria-disabled', 'true');
        btn.style.opacity = '0.5';
        if (status) { 
            status.textContent = `You need 80% to pass. Current score: ${Math.round(score)}%`; 
            status.style.color = '#666'; 
        }
        console.log('[PDF Button] Disabled with score:', score);
    }

    function setupShortcode(el) {
        if (!el || el.dataset._pdfInit) return;
        el.dataset._pdfInit = '1';
        var btn = el.querySelector('.pdf-generate');
        var input = el.querySelector('.pdf-name');
        var course = el.dataset.course || 'Course';
        var score = 0; // Always start at 0%
        var PASS = 80;
        
        console.log('[Setup] Starting with initial score of 0%');

        // initial enable/disable based on provided score
        console.log('[PDF Init] Initial score:', score, 'Pass threshold:', PASS);
        if (score >= PASS) enableButton(el, score); else disableButton(el, score);

        // click handler
        if (btn) {
            btn.addEventListener('click', function () {
                if (btn.disabled) return;
                var name = (input && input.value && input.value.trim()) ? input.value.trim() : (btn.getAttribute('data-name') || 'Participant');
                var certificateScore = score; // use initial score unless quiz updates it
                if (typeof window.createCertificate === 'function') {
                    window.createCertificate(name, course, certificateScore, (name.replace(/\s+/g,'_') || 'certificate') + '.pdf');
                } else {
                    console.error('createCertificate not available');
                    alert('PDF generator not ready');
                }
            });
        }

        // Listen for quiz:scored events to enable button dynamically (detail: {score:NN})
        document.addEventListener('quiz:scored', function (ev) {
            var v = ev && ev.detail && ev.detail.score ? Number(ev.detail.score) : null;
            console.log('[Quiz Score Event] Received score:', v);
            if (v !== null && !isNaN(v)) {
                score = v; // Update the score for certificate generation
                if (v >= PASS) {
                    console.log('[Quiz Score Event] Score meets passing threshold');
                    enableButton(el, v);
                } else {
                    console.log('[Quiz Score Event] Score below passing threshold');
                    disableButton(el, v);
                }
            }
        });
    }

    function initAll() {
        var nodes = document.querySelectorAll('.pdf-button-shortcode');
        nodes.forEach(setupShortcode);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll); else initAll();
    window.addEventListener('load', function () { setTimeout(initAll, 200); });

    // expose for dynamic pages
    window.initPdfShortcodes = initAll;

})();

// Quiz results detection (v6 - Event Based)
(function() {
    let lastReportedScore = null;
    let debounceTimer = null;
    
    // Debug mode - set to false in production
    const DEBUG = true;
    function log(...args) {
        if (DEBUG) console.log('[Quiz Detector]', ...args);
    }

    // Debounce helper function
    function debounce(func, wait) {
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(debounceTimer);
                func(...args);
            };
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(later, wait);
        };
    }

    function extractScoreFromText(text) {
        if (!text) return null;
        
        // Trim whitespace which might interfere with regex
        const cleanText = text.trim();

        // 1. Try fraction "X / Y" (e.g., "Score: 1 / 2" or just "1/2")
        const fractionMatch = cleanText.match(/(\d+)\s*\/\s*(\d+)/);
        if (fractionMatch) {
            const correct = parseInt(fractionMatch[1], 10);
            const total = parseInt(fractionMatch[2], 10);
            const score = total > 0 ? Math.round((correct / total) * 100) : 0;
            console.log('[Quiz Detector] Found fraction match:', fractionMatch[0], 'Calculated:', score + '%');
            return score;
        }
        
        return null;
    }

    function findAndDetectScore() {
        console.log('[Quiz Detector] Running score check...');
        let score = null;

        // --- Strategy 1: Look for Quizdown's "results" heading ---
        // Find a heading (h1-h6) with the exact text. Quizdown often uses <h3>.
        const resultsHeading = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
                                     .find(el => el.textContent.trim().toLowerCase() === 'your quiz results');

        if (resultsHeading && resultsHeading.nextElementSibling) {
            const scoreTextElement = resultsHeading.nextElementSibling;
            const scoreText = scoreTextElement.textContent;
            console.log('[Quiz Detector] Strategy 1: Found "Your quiz results" heading. Checking next element for score:', scoreText);
            score = extractScoreFromText(scoreText);
        } else {
             console.log('[Quiz Detector] Strategy 1: "Your quiz results" heading not found. Trying Strategy 2.');
        }

        // --- Strategy 2: Brute-force search the whole body text ---
        // Fallback if the heading isn't found or structure is different
        if (score === null) {
            const bodyText = document.body.innerText;
            // Look for the last occurrence of a score, as results are usually at the end
            const lastFractionMatch = bodyText.match(/.*(\d+\s*\/\s*\d+)/s); // 's' flag for dotall
            
            if (lastFractionMatch) {
                console.log('[Quiz Detector] Strategy 2: Found last fraction in body:', lastFractionMatch[1]);
                score = extractScoreFromText(lastFractionMatch[1]);
            }
        }

        // --- Final Step: Dispatch the event if we found a NEW score ---
        if (score !== null && score !== lastReportedScore) {
            lastReportedScore = score; // Prevent re-firing for the same score
            console.log('[Quiz Detector] SUCCESS: Found new score:', score + '%');
            
            // Dispatch the global event that the certificate button listener is waiting for
            document.dispatchEvent(new CustomEvent('quiz:scored', {
                detail: { score: score }
            }));
            
        } else if (score === null) {
            console.log('[Quiz Detector] No score found on this check.');
        }
    }

    // Debounce function to avoid thrashing on rapid DOM changes
    function debouncedCheck() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(findAndDetectScore, 300); // 300ms delay
    }

    function findQuizScore() {
        log('Checking for quiz score...');
        
        // Find all quizdown containers
        const quizElements = document.querySelectorAll('.quizdown');
        if (!quizElements.length) {
            log('No quizdown elements found');
            return null;
        }
        
        for (const quizElement of quizElements) {
            // Access the shadow root
            const shadowRoot = quizElement.shadowRoot;
            if (!shadowRoot) {
                log('No shadow root found');
                continue;
            }

            // Look for the quiz results section
            const results = shadowRoot.querySelector('h3');
            if (!results || results.textContent.trim() !== 'Your quiz results') {
                log('Results heading not found');
                continue;
            }

            // Find the score element (it's in an h1 tag after the results heading)
            const scoreElement = results.nextElementSibling?.querySelector('h1');
            if (!scoreElement) {
                log('Score element not found');
                continue;
            }

            const scoreText = scoreElement.textContent.trim();
            log('Found score text:', scoreText);

            // Extract numbers from format like "01/02"
            const match = scoreText.match(/(\d+)\s*\/\s*(\d+)/);
            if (!match) {
                log('Score format not recognized:', scoreText);
                continue;
            }

            const [_, correct, total] = match;
            const score = Math.round((parseInt(correct, 10) / parseInt(total, 10)) * 100);
            log('Calculated score:', score + '%');
            return score;
        }

        return null;
    }

    // Check for score changes and emit events
    function checkAndEmitScore() {
        const score = findQuizScore();
        
        // Only emit if we found a score and it's different from the last one
        if (score !== null && score !== lastReportedScore) {
            log('Score changed from', lastReportedScore, 'to', score);
            lastReportedScore = score;
            
            // Emit the quiz:scored event
            document.dispatchEvent(new CustomEvent('quiz:scored', {
                detail: { score: score }
            }));
        }
    }

    // Set up event listeners for a quiz container
    function setupQuizListeners(quizElement) {
        log('Setting up listeners for quiz element');
        
        // Wait for shadow root to be available
        function waitForShadowRoot() {
            const shadowRoot = quizElement.shadowRoot;
            if (!shadowRoot) {
                log('Shadow root not ready, retrying in 100ms...');
                setTimeout(waitForShadowRoot, 100);
                return;
            }
            
            log('Shadow root found, setting up listeners');

            // Create a debounced version of checkAndEmitScore
            const debouncedCheck = debounce(() => {
                log('Running score check...');
                checkAndEmitScore();
            }, 250);

            // Listen for clicks on the entire shadow root
            shadowRoot.addEventListener('click', (event) => {
                log('Click detected in quiz');
                // Always check on any click in the quiz
                debouncedCheck();
            }, true);

            // Listen for keyboard events
            shadowRoot.addEventListener('keyup', (event) => {
                log('Keyup detected in quiz');
                debouncedCheck();
            }, true);

            // Set up mutation observer for the quiz content
            const observer = new MutationObserver((mutations) => {
                log('DOM mutation detected in quiz');
                for (const mutation of mutations) {
                    // Check if this mutation is relevant
                    const hasRelevantChanges = 
                        mutation.type === 'characterData' || // Text content changed
                        mutation.addedNodes.length > 0 || // Nodes added
                        mutation.removedNodes.length > 0 || // Nodes removed
                        (mutation.target.classList && // Class changes on relevant elements
                         mutation.target.classList.contains('container'));
                    
                    if (hasRelevantChanges) {
                        log('Relevant change detected:', mutation.type);
                        debouncedCheck();
                        break;
                    }
                }
            });

            // Start observing the entire shadow root
            observer.observe(shadowRoot, {
                childList: true,
                subtree: true,
                characterData: true,
                attributes: true
            });

            // Do an initial check
            debouncedCheck();
        }

        // Start waiting for shadow root
        waitForShadowRoot();
    }

    // Initialize quiz detection
    function initQuizDetection() {
        log('Initializing quiz detection system');
        
        // Function to handle quiz element setup
        function setupQuiz(element) {
            log('Found quiz element, setting up:', element);
            if (!element.dataset._quizMonitorInit) {
                element.dataset._quizMonitorInit = 'true';
                setupQuizListeners(element);
            }
        }
        
        // Set up listeners for existing quizzes
        document.querySelectorAll('.quizdown').forEach(setupQuiz);
        
        // Watch for new quizzes being added
        const pageObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                // Check added nodes
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check the node itself
                        if (node.classList?.contains('quizdown')) {
                            log('New quiz element added to DOM');
                            setupQuiz(node);
                        }
                        // Check children of the added node
                        node.querySelectorAll?.('.quizdown')?.forEach(quiz => {
                            log('Found quiz in added content');
                            setupQuiz(quiz);
                        });
                    }
                });
            });
        });

        // Observe the entire document for new quizzes
        pageObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true, // Also watch for class changes
            attributeFilter: ['class'] // Only watch class attribute
        });
        
        log('Quiz detection system initialized');
    }

    // Initialize when the page is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initQuizDetection);
    } else {
        initQuizDetection();
    }

    // Handle dynamic page changes
    document.addEventListener('turbolinks:load', initQuizDetection);
    document.addEventListener('page:load', initQuizDetection);

    // Expose functions for debugging
    window.quizDetector = {
        check: checkAndEmitScore,
        getScore: findQuizScore
    };

})();