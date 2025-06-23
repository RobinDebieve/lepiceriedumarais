import { ApiService } from './api.js';

const api = new ApiService();

// Fonctions pour la modal des images (accessibles globalement)
function openModal(imgSrc) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    modal.style.display = "block";
    modalImg.src = imgSrc;
}

function closeModal() {
    const modal = document.getElementById('imageModal');
    modal.style.display = "none";
}

window.openModal = openModal;
window.closeModal = closeModal;

document.addEventListener('DOMContentLoaded', async () => {
    // Configuration des événements de la modal
    document.getElementById('imageModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });

    // Ajouter les écouteurs de clic sur toutes les images de la galerie
    document.querySelectorAll('.gallery-grid img').forEach(img => {
        img.addEventListener('click', function() {
            openModal(this.src);
        });
    });

    // Charger les promos depuis l'API
    await loadPromos();

    // Initialiser le carousel
    initializeCarousel();

    // Menu burger
    const burgerMenu = document.querySelector('.burger-menu');
    const navLinks = document.querySelector('.nav-links');
    if (burgerMenu && navLinks) {
        burgerMenu.addEventListener('click', function(event) {
            navLinks.classList.toggle('active');
            // Animation des barres du menu burger
            const spans = event.currentTarget.querySelectorAll('span');
            spans.forEach(span => span.classList.toggle('active'));
        });
        // Fermer le menu si on clique en dehors
        document.addEventListener('click', function(event) {
            if (!burgerMenu.contains(event.target) && !navLinks.contains(event.target)) {
                navLinks.classList.remove('active');
                const spans = burgerMenu.querySelectorAll('span');
                spans.forEach(span => span.classList.remove('active'));
            }
        });
    }
});

// Fonction pour charger les promos
async function loadPromos() {
    const promos = await api.getAllPromos();
    const carouselContainer = document.querySelector('.carousel-container');
    
    if (!carouselContainer) return;
    
    // Vider le carousel
    carouselContainer.innerHTML = '';
    
    // Ajouter chaque promo
    promos.forEach(promo => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.innerHTML = `
            <img src="${promo.imageUrl}" alt="${promo.title}">
            <h3>${promo.title}</h3>
            <p>${promo.description}</p>
        `;
        carouselContainer.appendChild(slide);
    });
    
    // Ajouter les clones pour le défilement infini
    if (promos.length > 0) {
        const firstClone = carouselContainer.firstElementChild.cloneNode(true);
        firstClone.classList.add('clone');
        carouselContainer.appendChild(firstClone);

        const lastClone = carouselContainer.lastElementChild.previousElementSibling.cloneNode(true);
        lastClone.classList.add('clone');
        carouselContainer.insertBefore(lastClone, carouselContainer.firstElementChild);
    }
    // Réinitialiser le carrousel après ajout des slides
    initializeCarousel();
}

// Fonction pour initialiser le carousel
function initializeCarousel() {
    const carousel = document.querySelector('.carousel-container');
    if (!carousel) return;

    let slides = Array.from(carousel.children);
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    
    let currentSlide = 1; // On commence sur le premier VRAI slide
    let isTransitioning = false;

    function updateCarousel(transition = true) {
        carousel.style.transition = transition ? 'transform 0.5s ease-in-out' : 'none';
        carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    // Initialize carousel
    updateCarousel(false);

    // Event listeners for buttons
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (isTransitioning) return;
            isTransitioning = true;
            currentSlide++;
            updateCarousel(true);
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (isTransitioning) return;
            isTransitioning = true;
            currentSlide--;
            updateCarousel(true);
        });
    }

    // Handle infinite scroll
    carousel.addEventListener('transitionend', () => {
        isTransitioning = false;
        slides = Array.from(carousel.children); // Mettre à jour la liste des slides
        
        // Si on est sur le clone de fin, on revient au premier vrai slide
        if (currentSlide >= slides.length - 1) {
            currentSlide = 1;
            updateCarousel(false);
        }
        // Si on est sur le clone de début, on va au dernier vrai slide
        if (currentSlide <= 0) {
            currentSlide = slides.length - 2;
            updateCarousel(false);
        }
    });

    // Auto-advance carousel every 5 seconds
    let autoAdvance = setInterval(() => {
        if (!isTransitioning) {
            currentSlide++;
            updateCarousel(true);
        }
    }, 5000);

    // Pause auto-advance on hover
    carousel.parentElement.addEventListener('mouseenter', () => {
        clearInterval(autoAdvance);
    });

    // Resume auto-advance when mouse leaves
    carousel.parentElement.addEventListener('mouseleave', () => {
        autoAdvance = setInterval(() => {
            if (!isTransitioning) {
                currentSlide++;
                updateCarousel(true);
            }
        }, 5000);
    });

    // Touch events for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        clearInterval(autoAdvance);
    });

    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        autoAdvance = setInterval(() => {
            if (!isTransitioning) {
                currentSlide++;
                updateCarousel(true);
            }
        }, 5000);
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left
                currentSlide++;
            } else {
                // Swipe right
                currentSlide--;
            }
            updateCarousel(true);
        }
    }
}