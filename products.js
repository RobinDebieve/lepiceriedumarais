document.addEventListener('DOMContentLoaded', () => {
    // Menu burger
    const burgerMenu = document.querySelector('.burger-menu');
    const navLinks = document.querySelector('.nav-links');

    burgerMenu.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        const spans = this.querySelectorAll('span');
        spans.forEach(span => span.classList.toggle('active'));
    });

    document.addEventListener('click', function(event) {
        if (!burgerMenu.contains(event.target) && !navLinks.contains(event.target)) {
            navLinks.classList.remove('active');
            const spans = burgerMenu.querySelectorAll('span');
            spans.forEach(span => span.classList.remove('active'));
        }
    });

    // Initialiser le produit coup de coeur s'il n'existe pas
    if (!localStorage.getItem('featuredProduct')) {
        const defaultFeaturedProduct = {
            title: "Glace Kinder Bueno",
            description: "Découvrez notre délicieuse glace Kinder Bueno, un mélange parfait de crème glacée onctueuse et de morceaux croquants de Kinder Bueno. Un véritable délice pour les amateurs de chocolat et de noisettes !",
            price: "3.50",
            image: "images/bueno.jpg"
        };
        localStorage.setItem('featuredProduct', JSON.stringify(defaultFeaturedProduct));
    }

    // Charger le produit coup de coeur
    loadFeaturedProduct();
    
    // Gestion des boutons toggle pour les catégories
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Récupérer la liste de produits associée à ce bouton
            const card = this.closest('.category-card');
            const list = card.querySelector('.product-list');
            const isExpanded = this.getAttribute('aria-expanded') === 'true';

            // Fermer toutes les listes d'abord
            document.querySelectorAll('.category-card').forEach(otherCard => {
                if (otherCard !== card) {
                    const otherBtn = otherCard.querySelector('.toggle-btn');
                    const otherList = otherCard.querySelector('.product-list');
                    otherBtn.setAttribute('aria-expanded', 'false');
                    otherList.setAttribute('hidden', '');
                }
            });

            // Basculer l'état de la liste actuelle
            this.setAttribute('aria-expanded', !isExpanded);
            if (isExpanded) {
                list.setAttribute('hidden', '');
            } else {
                list.removeAttribute('hidden');
            }
        });
    });
});

// Fonction pour charger le produit coup de coeur
function loadFeaturedProduct() {
    const featuredProduct = JSON.parse(localStorage.getItem('featuredProduct'));
    
    // Mettre à jour le contenu dans le HTML
    const featuredSection = document.querySelector('.featured-product');
    if (featuredSection && featuredProduct) {
        const title = featuredSection.querySelector('h3');
        const description = featuredSection.querySelector('p');
        const price = featuredSection.querySelector('.price');
        const image = featuredSection.querySelector('img');

        if (title) title.textContent = featuredProduct.title;
        if (description) description.textContent = featuredProduct.description;
        if (price) price.textContent = featuredProduct.price + ' €';
        if (image) {
            image.src = featuredProduct.image;
            image.alt = featuredProduct.title;
        }
    }
} 