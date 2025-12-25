(function () {
    // Create FPS Counter Element
    console.log("DEBUG SCRIPT EXECUTING. Body length:", document.body.innerHTML.length);
    const panel = document.getElementById('debug-panel');
    if (!panel) return;

    // Toggle Visibility with Shift + D
    document.addEventListener('keydown', (e) => {
        if (e.shiftKey && (e.key === 'D' || e.key === 'd')) {
            panel.classList.toggle('is-visible');
        }
    });

    const fpsItem = document.createElement('div');
    fpsItem.className = 'debug-panel__item';
    fpsItem.innerHTML = '<span>FPS:</span><span id="debug-fps">--</span>';
    panel.appendChild(fpsItem);

    const fpsValue = document.getElementById("debug-fps");
    console.log("DEBUG SCRIPT LOADED - Starting FPS Monitoring");

    // Performance Observer for Long Tasks
    try {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                console.warn(`Long Task detected: ${entry.duration}ms`, entry);
            }
        });
        observer.observe({ entryTypes: ["longtask"] });
        console.log("Long Task Observer attached");
    } catch (e) {
        console.warn("Long Task API not supported:", e);
    }

    // FPS Logic
    let frameCount = 0;
    let lastTime = performance.now();
    let lastFpsTime = lastTime;

    function updateFps() {
        const now = performance.now();
        frameCount++;

        if (now - lastFpsTime >= 1000) {
            const fps = Math.round((frameCount * 1000) / (now - lastFpsTime));
            if (fpsValue) {
                fpsValue.textContent = fps;

                // Color coding for visual alert
                if (fps < 30) fpsValue.style.color = '#ff3333';
                else if (fps < 55) fpsValue.style.color = '#ffff33';
                else fpsValue.style.color = '#00ffab';
            }

            frameCount = 0;
            lastFpsTime = now;
        }

        requestAnimationFrame(updateFps);
    }

    requestAnimationFrame(updateFps);

    console.log("FPS Instrumentation loaded");
})();
