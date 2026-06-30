document.addEventListener('DOMContentLoaded', () => {
    // 1. Phone Screenshots Slider & Interactive Progress Tabs Link
    const phoneSlides = document.querySelectorAll('.slide');
    const tabs = document.querySelectorAll('.slider-tab');
    const tabSlides = document.querySelectorAll('.slider-card-slide');
    let currentSlide = 0;
    const slideInterval = 3000;
    let autoRotateTimer = null;
    let isUserInteracting = false;

    // Mapping slide index to tab index
    const slideToTabMap = {
        1: 0, // Navigation -> Tab 0
        7: 1, // Media -> Tab 1
        6: 2, // Alerts -> Tab 2
        5: 3  // Logger -> Tab 3
    };

    function goToSlide(index) {
        if (phoneSlides.length === 0) return;
        phoneSlides[currentSlide].classList.remove('active');
        currentSlide = index;
        phoneSlides[currentSlide].classList.add('active');

        // Sync tab if this slide index matches one of the tabs
        const tabIndex = slideToTabMap[index];
        if (tabIndex !== undefined) {
            activateTab(tabIndex);
        }
    }

    function nextSlide() {
        if (isUserInteracting) return;
        const nextIndex = (currentSlide + 1) % phoneSlides.length;
        goToSlide(nextIndex);
    }

    function activateTab(tabIndex) {
        tabs.forEach((tab, idx) => {
            tab.classList.remove('active');
            const fill = tab.querySelector('.tab-progress-fill');
            if (fill) fill.style.width = idx === tabIndex ? '100%' : '0%';
            
            if (idx === tabIndex) {
                tab.classList.add('active');
            }
        });

        tabSlides.forEach((slide, idx) => {
            slide.classList.remove('active');
            if (idx === tabIndex) {
                slide.classList.add('active');
            }
        });
    }

    if (phoneSlides.length > 0) {
        // Initialize state
        goToSlide(0);
        autoRotateTimer = setInterval(nextSlide, slideInterval);
    }

    // Add click listeners to tabs to jump to their specific slide
    tabs.forEach((tab, idx) => {
        tab.addEventListener('click', () => {
            isUserInteracting = true;
            const targetSlide = parseInt(tab.dataset.slide);
            goToSlide(targetSlide);
            activateTab(idx);

            // Resume auto-rotation after 6s of inactivity
            clearTimeout(window.resumeTimer);
            window.resumeTimer = setTimeout(() => {
                isUserInteracting = false;
            }, 6000);
        });

        // Hover to preview tab
        tab.addEventListener('mouseenter', () => {
            isUserInteracting = true;
            const targetSlide = parseInt(tab.dataset.slide);
            goToSlide(targetSlide);
            activateTab(idx);
        });

        tab.addEventListener('mouseleave', () => {
            clearTimeout(window.resumeTimer);
            window.resumeTimer = setTimeout(() => {
                isUserInteracting = false;
            }, 3000);
        });
    });

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

    // 3. Download Notification Toast
    function showToast(message) {
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.style.position = 'fixed';
            toastContainer.style.bottom = '24px';
            toastContainer.style.left = '50%';
            toastContainer.style.transform = 'translateX(-50%)';
            toastContainer.style.zIndex = '9999';
            toastContainer.style.display = 'flex';
            toastContainer.style.flexDirection = 'column';
            toastContainer.style.gap = '8px';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.style.background = 'rgba(20, 21, 26, 0.95)';
        toast.style.backdropFilter = 'blur(10px)';
        toast.style.border = '1px solid #E9B949';
        toast.style.color = '#FFFFFF';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '30px';
        toast.style.fontSize = '14px';
        toast.style.fontWeight = '600';
        toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5), 0 0 15px rgba(233, 185, 73, 0.2)';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.gap = '10px';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

        // Simple bounce animation style injected inline
        const styleId = 'toast-spin-style';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
                @keyframes bounce-down {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(3px); }
                }
                .toast-bounce-icon {
                    animation: bounce-down 1s infinite ease-in-out;
                }
            `;
            document.head.appendChild(style);
        }

        toast.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E9B949" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="toast-bounce-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        // Trigger animation
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 50);

        // Hide and remove
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 4000);
    }

    const downloadLinks = document.querySelectorAll('a[download]');
    downloadLinks.forEach(link => {
        link.addEventListener('click', () => {
            showToast("Starting download... Check your notification bar.");
        });
    });

    // 4. Step Walkthrough Showcase Slider Logic
    const stepSlides = document.querySelectorAll('.step-slide');
    const prevBtn = document.querySelector('.btn-prev');
    const nextBtn = document.querySelector('.btn-next');
    const progressBarFill = document.querySelector('.progress-bar-fill');
    const dots = document.querySelectorAll('.step-dots .dot');
    let activeStepIndex = 0; // 0-indexed (0 to 5)

    function updateStepShowcase() {
        if (stepSlides.length === 0) return;

        // Update slides active state
        stepSlides.forEach((slide, idx) => {
            slide.classList.remove('active');
            if (idx === activeStepIndex) {
                slide.classList.add('active');
            }
        });

        // Update progress bar
        const progressPercentage = ((activeStepIndex + 1) / stepSlides.length) * 100;
        if (progressBarFill) {
            progressBarFill.style.width = `${progressPercentage}%`;
        }

        // Update dots active state
        dots.forEach((dot, idx) => {
            dot.classList.remove('active');
            if (idx === activeStepIndex) {
                dot.classList.add('active');
            }
        });

        // Update back button state
        if (prevBtn) {
            if (activeStepIndex === 0) {
                prevBtn.setAttribute('disabled', 'true');
            } else {
                prevBtn.removeAttribute('disabled');
            }
        }

        // Update next button label
        if (nextBtn) {
            if (activeStepIndex === stepSlides.length - 1) {
                nextBtn.innerHTML = `
                    Finish
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                `;
            } else {
                nextBtn.innerHTML = `
                    Next
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                `;
            }
        }
    }

    if (nextBtn && prevBtn) {
        nextBtn.addEventListener('click', () => {
            if (activeStepIndex < stepSlides.length - 1) {
                activeStepIndex++;
                updateStepShowcase();
            } else {
                showToast("Zenith guide complete! Ride safe.");
            }
        });

        prevBtn.addEventListener('click', () => {
            if (activeStepIndex > 0) {
                activeStepIndex--;
                updateStepShowcase();
            }
        });

        dots.forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                activeStepIndex = idx;
                updateStepShowcase();
            });
        });
    }
});
