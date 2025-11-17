// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));
}

// Profile Carousel Functionality
let currentProfile = 0;
const profiles = document.querySelectorAll('.profile-card');
const dots = document.querySelectorAll('.dot');

function showProfile(index) {
    if (profiles.length === 0) return;
    
    // Hide all profiles
    profiles.forEach(profile => {
        profile.style.display = 'none';
    });
    
    // Remove active class from all dots
    dots.forEach(dot => {
        dot.classList.remove('active');
    });
    
    // Show current profile and activate corresponding dot
    if (profiles[index]) {
        profiles[index].style.display = 'block';
    }
    if (dots[index]) {
        dots[index].classList.add('active');
    }
}

function nextProfile() {
    currentProfile = (currentProfile + 1) % profiles.length;
    showProfile(currentProfile);
}

function previousProfile() {
    currentProfile = (currentProfile - 1 + profiles.length) % profiles.length;
    showProfile(currentProfile);
}

// Initialize carousel
if (profiles.length > 0) {
    // Show only first profile initially
    profiles.forEach((profile, index) => {
        if (index === 0) {
            profile.style.display = 'block';
        } else {
            profile.style.display = 'none';
        }
    });
    
    // Add click events to dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentProfile = index;
            showProfile(currentProfile);
        });
    });
    
    // Auto-rotate profiles every 5 seconds
    setInterval(nextProfile, 5000);
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.feature-card, .vision-card, .profile-card');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(10, 10, 10, 0.98)';
        } else {
            navbar.style.background = 'rgba(10, 10, 10, 0.95)';
        }
    }
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
    document.body.style.transition = 'opacity 0.5s ease';
});

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    document.body.style.opacity = '0';
    
    // Add hover effects to buttons
    const buttons = document.querySelectorAll('.cta-button, .carousel-btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.05)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add parallax effect to hero background
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = hero.querySelector('.hero-background');
            if (parallax) {
                parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
            }
        });
    }
});

// Form validation (if forms are added later)
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Utility function for smooth animations
function animateElement(element, animation, duration = 1000) {
    element.style.animation = `${animation} ${duration}ms ease-in-out`;
    
    setTimeout(() => {
        element.style.animation = '';
    }, duration);
}

// Add click ripple effect to buttons
function addRippleEffect(button) {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
}

// Apply ripple effect to all buttons
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('button, .cta-button');
    buttons.forEach(addRippleEffect);
});

// Console welcome message
console.log('%c🦋 Welcome to BettrMe.AI! 🦋', 'color: #4f46e5; font-size: 20px; font-weight: bold;');
console.log('%cBuilt with ❤️ for better communication', 'color: #666; font-size: 14px;');
