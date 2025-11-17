// Carousel with 3-slide view and proper navigation
document.addEventListener('DOMContentLoaded', function() {
    // Select elements
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    const track = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.carousel-slide');
    
    if (!prevBtn || !nextBtn || !track || !slides.length) {
        console.error('Required carousel elements not found!');
        return;
    }
    
    let currentIndex = 0;
    const totalSlides = slides.length;
    let slidesToShow = getSlidesToShow();
    
    // Initialize the carousel
    function init() {
        updateCarousel();
        
        // Add event listeners
        prevBtn.addEventListener('click', goToPrevSlide);
        nextBtn.addEventListener('click', goToNextSlide);
        
        // Handle window resize
        window.addEventListener('resize', handleResize);
    }
    
    // Get number of slides to show based on screen size
    function getSlidesToShow() {
        if (window.innerWidth >= 1024) return 3; // Desktop: show 3 slides
        if (window.innerWidth >= 640) return 2;  // Tablet: show 2 slides
        return 1; // Mobile: show 1 slide
    }
    
    // Handle window resize
    function handleResize() {
        const newSlidesToShow = getSlidesToShow();
        if (newSlidesToShow !== slidesToShow) {
            slidesToShow = newSlidesToShow;
            // Adjust currentIndex to prevent going past the last slide
            currentIndex = Math.min(currentIndex, totalSlides - slidesToShow);
            updateCarousel();
        }
    }
    
    // Navigation functions
    function goToPrevSlide(e) {
        if (e) e.preventDefault();
        // Calculate the previous index that shows complete slides
        let newIndex = currentIndex - slidesToShow;
        // Ensure we don't go before the first slide
        currentIndex = Math.max(0, newIndex);
        updateCarousel();
    }
    
    function goToNextSlide(e) {
        if (e) e.preventDefault();
        // Calculate the maximum index that shows the last slide completely
        const maxIndex = Math.max(0, totalSlides - slidesToShow);
        // Calculate the next index that shows complete slides
        let newIndex = currentIndex + slidesToShow;
        // If the new index would show partial slides, adjust to show complete slides
        if (newIndex + slidesToShow > totalSlides) {
            newIndex = maxIndex;
        }
        currentIndex = Math.min(maxIndex, newIndex);
        updateCarousel();
    }
    
    // Update carousel display
    function updateCarousel() {
        // Calculate the maximum index that shows the last slide
        const maxIndex = Math.max(0, totalSlides - slidesToShow);
        currentIndex = Math.min(currentIndex, maxIndex);
        
        // Update track position
        const slideWidth = 100 / slidesToShow;
        track.style.transform = `translateX(-${currentIndex * slideWidth}%)`;
        
        // Update button states
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= maxIndex;
        
        // Update active state for slides
        slides.forEach((slide, index) => {
            const isActive = index >= currentIndex && index < currentIndex + slidesToShow;
            slide.classList.toggle('active', isActive);
        });
    }
    
    // Start the carousel
    init();
});
