document.addEventListener('DOMContentLoaded', () => {
    // 1. Phone Screenshots Slider
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    const slideInterval = 3000;

    function nextSlide() {
        if (slides.length === 0) return;
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    if (slides.length > 0) {
        setInterval(nextSlide, slideInterval);
    }

    // 2. Interactive Share Card Drag & Drop Simulator
    const draggables = document.querySelectorAll('.draggable');
    const container = document.querySelector('.share-canvas-container');
    const canvasBg = document.querySelector('.canvas-bg');
    
    let activeElement = null;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    // Template Configurations matching the app
    const templates = {
        Minimal: {
            statsHtml: `
                <div class="stat-row">
                    <span class="stat-lbl">Distance</span>
                    <span class="stat-val">154.2 km</span>
                </div>
                <div class="stat-row">
                    <span class="stat-lbl">Time</span>
                    <span class="stat-val">03:45:12</span>
                </div>
                <div class="stat-row">
                    <span class="stat-lbl">Avg Speed</span>
                    <span class="stat-val">41.2 km/h</span>
                </div>
            `,
            statsPos: { top: 30, left: 15 },
            watermarkPos: { top: 500, left: 200 }
        },
        Grid: {
            statsHtml: `
                <div class="grid-header">
                    <div class="grid-title">WEEKEND ESCAPE</div>
                    <div class="grid-date">Jun 30, 2026</div>
                </div>
                <div class="stats-grid-2x2">
                    <div class="stat-col">
                        <span class="stat-lbl">Distance</span>
                        <span class="stat-val">154.2 km</span>
                    </div>
                    <div class="stat-col">
                        <span class="stat-lbl">Active Time</span>
                        <span class="stat-val">03:45:12</span>
                    </div>
                    <div class="stat-col">
                        <span class="stat-lbl">Avg Speed</span>
                        <span class="stat-val">41.2 km/h</span>
                    </div>
                    <div class="stat-col">
                        <span class="stat-lbl">Max Speed</span>
                        <span class="stat-val">98.5 km/h</span>
                    </div>
                </div>
            `,
            statsPos: { top: 320, left: 15 },
            watermarkPos: { top: 30, left: 200 }
        },
        Footer: {
            statsHtml: `
                <div class="stats-grid">
                    <div class="stat-col">
                        <span class="stat-lbl">Distance</span>
                        <span class="stat-val">154.2 km</span>
                    </div>
                    <div class="stat-col">
                        <span class="stat-lbl">Active Time</span>
                        <span class="stat-val">03:45:12</span>
                    </div>
                    <div class="stat-col">
                        <span class="stat-lbl">Avg Speed</span>
                        <span class="stat-val">41.2 km/h</span>
                    </div>
                </div>
            `,
            statsPos: { top: 480, left: 15 },
            watermarkPos: { top: 425, left: 110 }
        },
        Classic: {
            statsHtml: `
                <div class="stat-row center">
                    <span class="stat-lbl">Distance</span>
                    <span class="stat-val">154.2 km</span>
                </div>
                <div class="stat-row center">
                    <span class="stat-lbl">Max Speed</span>
                    <span class="stat-val">98.5 km/h</span>
                </div>
                <div class="stat-row center">
                    <span class="stat-lbl">Time</span>
                    <span class="stat-val">03:45:12</span>
                </div>
            `,
            statsPos: { top: 40, left: 15 },
            watermarkPos: { top: 505, left: 110 }
        }
    };

    function applyTemplate(name) {
        const t = templates[name];
        if (!t) return;

        const statsOverlay = document.querySelector('.stats-overlay');
        const watermarkOverlay = document.querySelector('.watermark-overlay');

        // Apply HTML content
        statsOverlay.innerHTML = t.statsHtml;

        // Position overlays scaled by container size
        const containerWidth = container.getBoundingClientRect().width;
        const scale = containerWidth / 320;

        statsOverlay.style.left = `${t.statsPos.left * scale}px`;
        statsOverlay.style.top = `${t.statsPos.top * scale}px`;
        statsOverlay.style.bottom = 'auto';

        watermarkOverlay.style.left = `${t.watermarkPos.left * scale}px`;
        watermarkOverlay.style.top = `${t.watermarkPos.top * scale}px`;
        watermarkOverlay.style.bottom = 'auto';
    }

    // Element selection and dragging logic
    draggables.forEach(draggable => {
        draggable.addEventListener('mousedown', startDrag);
        draggable.addEventListener('touchstart', startDrag, { passive: false });
    });

    container.addEventListener('mousedown', (e) => {
        if (e.target === container || e.target.classList.contains('canvas-bg') || e.target.classList.contains('canvas-interactive-overlay')) {
            deselectAll();
            document.querySelector('.canvas-interactive-overlay').classList.add('selected');
        }
    });

    function startDrag(e) {
        deselectAll();
        activeElement = this;
        activeElement.classList.add('selected');
        isDragging = true;

        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

        startX = clientX;
        startY = clientY;

        const rect = activeElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        initialLeft = rect.left - containerRect.left;
        initialTop = rect.top - containerRect.top;

        if (e.type === 'touchstart') {
            e.preventDefault();
        }
    }

    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });

    function drag(e) {
        if (!isDragging || !activeElement) return;

        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

        const dx = clientX - startX;
        const dy = clientY - startY;

        let newLeft = initialLeft + dx;
        let newTop = initialTop + dy;

        const containerRect = container.getBoundingClientRect();
        const elementRect = activeElement.getBoundingClientRect();

        const maxLeft = containerRect.width - elementRect.width;
        const maxTop = containerRect.height - elementRect.height;

        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        newTop = Math.max(0, Math.min(newTop, maxTop));

        activeElement.style.left = `${newLeft}px`;
        activeElement.style.top = `${newTop}px`;
        activeElement.style.bottom = 'auto';

        if (e.type === 'touchmove') {
            e.preventDefault();
        }
    }

    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);

    function endDrag() {
        isDragging = false;
    }

    function deselectAll() {
        draggables.forEach(el => el.classList.remove('selected'));
        document.querySelector('.canvas-interactive-overlay').classList.remove('selected');
    }

    // Template Button Switcher Listeners
    const templateBtns = document.querySelectorAll('.template-selector .control-btn');
    templateBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            templateBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            applyTemplate(this.dataset.template);
        });
    });

    // Background Switcher Listeners
    const bgBtns = document.querySelectorAll('.bg-selector .control-btn');
    bgBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            bgBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            canvasBg.src = this.dataset.bg;
        });
    });

    // Initial setup with scale calculation on window load
    window.addEventListener('load', () => {
        applyTemplate('Minimal');
    });

    window.addEventListener('resize', () => {
        const activeBtn = document.querySelector('.template-selector .control-btn.active');
        if (activeBtn) {
            applyTemplate(activeBtn.dataset.template);
        }
    });
});
