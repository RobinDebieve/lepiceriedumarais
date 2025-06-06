import { ApiService, defaultData } from './api.js';

const api = new ApiService();

// Recettes par défaut
const defaultRecipes = [
    {
        name: "Tarte aux pommes rustique",
        prepTime: "30",
        cookTime: "45",
        servings: "6",
        image: "images/recette1.jpg",
        ingredients: [
            "6 pommes Golden",
            "1 pâte brisée",
            "50g de sucre",
            "1 sachet de sucre vanillé",
            "30g de beurre",
            "Cannelle (facultatif)"
        ],
        instructions: [
            "Préchauffez le four à 180°C",
            "Épluchez et coupez les pommes en fines tranches",
            "Étalez la pâte et disposez les pommes en rosace",
            "Saupoudrez de sucre et parsemez de beurre",
            "Enfournez pour 45 minutes"
        ]
    },
    {
        name: "Soupe de légumes de saison",
        prepTime: "20",
        cookTime: "35",
        servings: "4",
        image: "images/recette2.jpg",
        ingredients: [
            "3 carottes",
            "2 pommes de terre",
            "2 poireaux",
            "1 oignon",
            "2 branches de céleri",
            "Sel et poivre"
        ],
        instructions: [
            "Épluchez et coupez tous les légumes",
            "Faites revenir l'oignon dans une cocotte",
            "Ajoutez les légumes et couvrez d'eau",
            "Laissez mijoter 35 minutes",
            "Mixez et assaisonnez"
        ]
    }
];

// Fonction pour obtenir toutes les recettes
async function getAllRecipes() {
    const data = await api.getData();
    return data?.recipes || defaultData.recipes;
}

// Fonction pour sauvegarder toutes les recettes
async function saveAllRecipes(recipes) {
    const data = await api.getData();
    data.recipes = recipes;
    await api.updateData(data);
}

// Fonction pour ajouter une recette
async function addRecipe(recipe) {
    const recipes = await getAllRecipes();
    recipes.push(recipe);
    await saveAllRecipes(recipes);
}

// Fonction pour mettre à jour une recette
async function updateRecipe(index, recipe) {
    const recipes = await getAllRecipes();
    recipes[index] = recipe;
    await saveAllRecipes(recipes);
}

// Fonction pour supprimer une recette
async function deleteRecipe(index) {
    const recipes = await getAllRecipes();
    recipes.splice(index, 1);
    await saveAllRecipes(recipes);
}

document.addEventListener('DOMContentLoaded', async () => {
    // Menu burger
    const burgerMenu = document.querySelector('.burger-menu');
    const navLinks = document.querySelector('.nav-links');

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
                <img src="${recipe.image}" alt="${recipe.name}">
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