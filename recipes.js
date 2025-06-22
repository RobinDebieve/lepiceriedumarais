import { ApiService, defaultData } from './api.js';

const api = new ApiService();

// Fonction pour obtenir toutes les recettes
async function getAllRecipes() {
    return await api.getAllRecipes();
}

document.addEventListener('DOMContentLoaded', async () => {
    // Menu burger
    const burgerMenu = document.querySelector('.burger-menu');
    const navLinks = document.querySelector('.nav-links');

    if (burgerMenu && navLinks) {
        burgerMenu.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            
            // Animation des barres du menu burger
            const spans = this.querySelectorAll('span');
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

    // Initialisation des recettes si on est sur la page des recettes
    if (document.getElementById('recipesContainer')) {
        await displayRecipes();
    }
});

// Fonction pour afficher les recettes
async function displayRecipes() {
    const recipesContainer = document.getElementById('recipesContainer');
    if (!recipesContainer) return;
    
    const recipes = await getAllRecipes();
    recipesContainer.innerHTML = '';
    
    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        
        recipeCard.innerHTML = `
            <div class="recipe-image">
                <img src="${recipe.imageUrl || 'images/recette1.jpg'}" alt="${recipe.name}">
            </div>
            <div class="recipe-content">
                <h2>${recipe.name}</h2>
                <div class="recipe-info">
                    <div class="info-item">
                        <i class="fas fa-clock"></i>
                        <span>Préparation: ${recipe.prepTime} min</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-temperature-high"></i>
                        <span>Cuisson: ${recipe.cookTime} min</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-users"></i>
                        <span>${recipe.servings} personnes</span>
                    </div>
                </div>
                <button class="toggle-btn" onclick="toggleDetails(this)" aria-expanded="false">
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="recipe-details" hidden>
                    <div class="ingredients-section">
                        <h3>Ingrédients</h3>
                        <ul>
                            ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="instructions-section">
                        <h3>Instructions</h3>
                        <ol>
                            ${recipe.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
                        </ol>
                    </div>
                </div>
            </div>
        `;
        
        recipesContainer.appendChild(recipeCard);
    });
}

// Exporter les fonctions pour l'interface d'administration
export {
    getAllRecipes,
    displayRecipes
}; 