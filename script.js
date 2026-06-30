document.addEventListener('DOMContentLoaded', () => {
    // 1. Phone Screenshots Slider
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    const slideInterval = 3000; // 3 seconds

    function nextSlide() {
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
    
    let activeElement = null;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    // Element selection
    draggables.forEach(draggable => {
        draggable.addEventListener('mousedown', startDrag);
        draggable.addEventListener('touchstart', startDrag, { passive: false });
    });

    // Deselect if clicking container background
    container.addEventListener('mousedown', (e) => {
        if (e.target === container || e.target.classList.contains('canvas-bg') || e.target.classList.contains('canvas-interactive-overlay')) {
            deselectAll();
            // Default select background photo (outline canvas)
            const photoEl = document.querySelector('.canvas-interactive-overlay');
            photoEl.classList.add('selected');
        }
    });

    function startDrag(e) {
        deselectAll();
        activeElement = this;
        activeElement.classList.add('selected');
        isDragging = true;

        // Get coordinates (mouse vs touch)
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

        startX = clientX;
        startY = clientY;

        // Get computed style offsets
        const rect = activeElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        initialLeft = rect.left - containerRect.left;
        initialTop = rect.top - containerRect.top;

        if (e.type === 'touchstart') {
            e.preventDefault(); // prevent scrolling while dragging on touch
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

        // Boundary constraints relative to container
        const containerRect = container.getBoundingClientRect();
        const elementRect = activeElement.getBoundingClientRect();

        const maxLeft = containerRect.width - elementRect.width;
        const maxTop = containerRect.height - elementRect.height;

        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        newTop = Math.max(0, Math.min(newTop, maxTop));

        activeElement.style.left = `${newLeft}px`;
        activeElement.style.top = `${newTop}px`;
        
        // Remove bottom constraint default styling on watermark so absolute top works
        if(activeElement.classList.contains('watermark-overlay')) {
            activeElement.style.bottom = 'auto';
        }

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
});
