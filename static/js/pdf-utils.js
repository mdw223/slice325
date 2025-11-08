// PDF Certificate Creator
function createCertificate(name, course, score, filename = 'certificate.pdf') {
    if (typeof jsPDF === 'undefined') {
        console.error('jsPDF not loaded');
        return;
    }

    // Normalize inputs
    name = String(name || 'Participant');
    course = String(course || 'Course');
    score = (typeof score === 'number' && !isNaN(score)) ? Math.round(score) : 0;

    // Create PDF
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // Color palette (use a red accent to match logo)
    const red = [200, 0, 0]; // warm red
    const border = [60, 60, 60];
    const bg = [255, 255, 255];

    // Logo image (from static/images)
    // Try multiple candidate paths so the image loads correctly on GitHub Pages
    // (site may be served from a subpath like /repo-name/). We'll attempt:
    //  - /images/SLICE325-Logo-1.png
    //  - images/SLICE325-Logo-1.png (relative)
    //  - <base href> + images/SLICE325-Logo-1.png
    //  - /<first-path-segment>/images/SLICE325-Logo-1.png (repo-prefixed)
    const logoFilename = 'images/SLICE325-Logo-1.png';
    const baseEl = document.querySelector('base');
    const baseHref = baseEl && baseEl.getAttribute('href') ? baseEl.getAttribute('href') : '';
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const repoBase = pathParts.length ? '/' + pathParts[0] : '';
    const candidates = [
        '/' + logoFilename,
        logoFilename,
        baseHref ? (baseHref.replace(/\/$/, '') + '/' + logoFilename) : null,
        repoBase ? (repoBase.replace(/\/$/, '') + '/' + logoFilename) : null
    ].filter(Boolean).map(p => p.replace(/\/\/+/g, '/'));

    const img = new Image();
    img.crossOrigin = 'anonymous';

    // Attempt each candidate until one loads successfully, otherwise render without logo
    let _tryIndex = 0;
    function attemptNextLogo() {
        if (_tryIndex >= candidates.length) {
            console.warn('Logo not found at any candidate path, rendering without logo');
            render(0);
            return;
        }
        const src = candidates[_tryIndex++];
        img.onload = function () {
            try {
                // place small logo at top-left for branding
                const maxW = 50;
                const pxToMm = 0.264583;
                const drawW = Math.min(maxW, img.width * pxToMm);
                const drawH = drawW * (img.height ? (img.height / img.width) : 0.3);
                doc.addImage(img, 'PNG', 18, 16, drawW, drawH);

                // subtle watermark: draw with low opacity by converting to canvas and reducing alpha
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.globalAlpha = 0.08;
                    ctx.drawImage(img, 0, 0);
                    const dataURL = canvas.toDataURL('image/png');
                    const wmW = 160;
                    const wmH = wmW * (img.height / img.width || 0.3);
                    const wmX = (297 - wmW) / 2;
                    const wmY = 80;
                    doc.addImage(dataURL, 'PNG', wmX, wmY, wmW, wmH);
                } catch (e) {
                    // ignore watermark if canvas fails
                    console.warn('Watermark generation failed', e);
                }

                render(drawH + 6);
            } catch (err) {
                console.error('Logo drawing error', err);
                render(0);
            }
        };
        img.onerror = function () {
            console.warn('Logo not found at', src, ' — trying next candidate');
            // try the next candidate
            attemptNextLogo();
        };
        // Start loading this candidate
        img.src = src;
    }

    // Kick off the attempts
    attemptNextLogo();
    function render(logoH = 0) {
        // Title
        const topY = 30 + logoH;
        doc.setFont('times', 'normal');
        doc.setFontSize(28);
        doc.setTextColor(...border);
        doc.setFontSize(28);
        doc.text('Certificate of Completion', 148.5, topY, { align: 'center' });

        // Subtitle line (bolder)
        doc.setLineWidth(1.0);
        doc.setDrawColor(...red);
        doc.line(72, topY + 6, 224, topY + 6);

        // Body
        let y = topY + 26;
        doc.setFontSize(16);
        doc.setTextColor(70, 70, 70);
        doc.text('This certifies that', 148.5, y, { align: 'center' });

        // Fancy name in larger, cursive-like style (use Times Italic as fallback)
        y += 20;
        doc.setFont('times', 'italic');
        doc.setFontSize(48);
        // Stronger shadow for depth
        doc.setTextColor(140, 0, 0);
        doc.text(name, 148.8, y + 0.8, { align: 'center' });
        doc.setTextColor(...red);
        doc.text(name, 148.5, y, { align: 'center' });

        // Course info
        y += 28;
        doc.setFont('times', 'normal');
        doc.setFontSize(16);
        doc.setTextColor(80, 80, 80);
        doc.text('has successfully completed the course', 148.5, y, { align: 'center' });

        y += 18;
        doc.setFontSize(22);
        doc.setFont('times', 'bold');
        doc.setTextColor(...border);
        doc.text(course, 148.5, y, { align: 'center' });

        // Score badge (more prominent)
        y += 28;
        const badgeW = 96;
        const badgeH = 26;
        const bx = 148.5 - badgeW / 2;
        doc.setDrawColor(...red);
        doc.setFillColor(...red);
        // filled rounded rect
        try {
            doc.roundedRect(bx, y - 14, badgeW, badgeH, 4, 4, 'F');
        } catch (e) {
            // Fallback to normal rect if roundedRect not available
            doc.rect(bx, y - 14, badgeW, badgeH, 'F');
        }
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.setFont('times', 'bold');
        doc.text('Score: ' + String(score) + '%', 148.5, y + 2, { align: 'center' });

        // Date bottom-left (bolder)
        const now = new Date();
        const dateStr = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
        doc.setFontSize(12);
        doc.setFont('times', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text(dateStr, 30, 188);

        // Save
        doc.save(filename);
    }

    img.onload = function () {
        try {
            // place small logo at top-left for branding
            const maxW = 50;
            const pxToMm = 0.264583;
            const drawW = Math.min(maxW, img.width * pxToMm);
            const drawH = drawW * (img.height ? (img.height / img.width) : 0.3);
            doc.addImage(img, 'PNG', 18, 16, drawW, drawH);

            // subtle watermark: draw with low opacity by converting to canvas and reducing alpha
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.globalAlpha = 0.08;
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL('image/png');
                const wmW = 160;
                const wmH = wmW * (img.height / img.width || 0.3);
                const wmX = (297 - wmW) / 2;
                const wmY = 80;
                doc.addImage(dataURL, 'PNG', wmX, wmY, wmW, wmH);
            } catch (e) {
                // ignore watermark if canvas fails
                console.warn('Watermark generation failed', e);
            }

            render(drawH + 6);
        } catch (err) {
            console.error('Logo drawing error', err);
            render(0);
        }
    };

    img.onerror = function () {
        console.warn('Logo not found, rendering without logo');
        render(0);
    };
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
        // Support both the legacy shortcode wrapper class and the newer certificate-generator
        var nodes = document.querySelectorAll('.pdf-button-shortcode, .certificate-generator');
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