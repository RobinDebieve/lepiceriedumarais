import { ApiService, defaultData } from './api.js';
import { addRecipe, updateRecipe, deleteRecipe } from './recipes.js';

const api = new ApiService();

// Configuration de sécurité
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'lemarais2024';
const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes en millisecondes

let currentEditIndex = -1;
let loginAttempts = parseInt(localStorage.getItem('loginAttempts')) || 0;
let lastAttemptTime = parseInt(localStorage.getItem('lastAttemptTime')) || 0;

// Promos par défaut
const defaultPromos = [
    {
        id: 1,
        title: "Pâtes Soubry Capellini",
        description: "2+1 Gratuit sur les paquets de Capellini extra fin 500 g — faites le plein de pâtes !",
        image: "images/promo1.jpg"
    },
    {
        id: 2,
        title: "Vodka Eristoff",
        description: "1 achetée = 1 offerte sur la vodka premium ou passion fruit — à consommer avec modération !",
        image: "images/promo2.jpg"
    },
    {
        id: 3,
        title: "Oasis Tropical Family Pack",
        description: "Le 2e pack à moitié prix sur les lots de 6×2 L Oasis Tropical — pour rafraîchir toute la famille !",
        image: "images/promo3.jpg"
    }
];

// Initialiser les promos si elles n'existent pas
if (!localStorage.getItem('promos')) {
    localStorage.setItem('promos', JSON.stringify(defaultPromos));
}

// Produit coup de coeur par défaut
const defaultFeaturedProduct = {
    title: "Glace Kinder Bueno",
    description: "Découvrez notre délicieuse glace Kinder Bueno, un mélange parfait de crème glacée onctueuse et de morceaux croquants de Kinder Bueno. Un véritable délice pour les amateurs de chocolat et de noisettes !",
    price: "3.50",
    image: "images/bueno.jpg"
};

// Initialiser le produit coup de coeur s'il n'existe pas
if (!localStorage.getItem('featuredProduct')) {
    localStorage.setItem('featuredProduct', JSON.stringify(defaultFeaturedProduct));
}

// Fonction pour échapper les caractères HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Fonction pour nettoyer les entrées utilisateur
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    // Supprime les balises script et les événements inline
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+="[^"]*"/g, '')
        .replace(/on\w+='[^']*'/g, '')
        .trim();
}

// Fonction pour valider une recette
function validateRecipe(recipe) {
    const requiredFields = ['name', 'prepTime', 'cookTime', 'servings', 'ingredients', 'instructions'];
    
    // Vérifie que tous les champs requis sont présents
    for (const field of requiredFields) {
        if (!recipe[field]) {
            throw new Error(`Le champ ${field} est requis`);
        }
    }
    
    // Vérifie que les temps sont des nombres
    if (isNaN(recipe.prepTime) || isNaN(recipe.cookTime) || isNaN(recipe.servings)) {
        throw new Error('Les temps de préparation, cuisson et le nombre de portions doivent être des nombres');
    }
    
    // Vérifie que les tableaux ne sont pas vides
    if (!recipe.ingredients.length || !recipe.instructions.length) {
        throw new Error('Les ingrédients et instructions ne peuvent pas être vides');
    }
    
    return true;
}

// Fonction pour hasher le mot de passe
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Fonction pour vérifier si l'utilisateur est bloqué
function isUserLocked() {
    if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        const timeElapsed = Date.now() - lastAttemptTime;
        if (timeElapsed < LOCKOUT_TIME) {
            const remainingTime = Math.ceil((LOCKOUT_TIME - timeElapsed) / 60000);
            return `Trop de tentatives. Réessayez dans ${remainingTime} minutes.`;
        } else {
            // Réinitialiser les tentatives après la période de blocage
            loginAttempts = 0;
            localStorage.setItem('loginAttempts', loginAttempts);
        }
    }
    return false;
}

// Fonction pour mettre à jour les tentatives de connexion
function updateLoginAttempts(success) {
    if (success) {
        // Réinitialiser les tentatives en cas de succès
        loginAttempts = 0;
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lastAttemptTime');
    } else {
        // Incrémenter les tentatives en cas d'échec
        loginAttempts++;
        lastAttemptTime = Date.now();
        localStorage.setItem('loginAttempts', loginAttempts);
        localStorage.setItem('lastAttemptTime', lastAttemptTime);
    }
}

// Fonction pour vérifier la session
function checkSession() {
    const sessionExpiry = localStorage.getItem('sessionExpiry');
    if (!sessionExpiry || Date.now() > parseInt(sessionExpiry)) {
        logout();
        return false;
    }
    // Renouveler la session
    setSession();
    return true;
}

// Fonction pour définir la session
function setSession() {
    const expiryTime = Date.now() + (30 * 60 * 1000); // 30 minutes
    localStorage.setItem('sessionExpiry', expiryTime);
    localStorage.setItem('isAuthenticated', 'true');
}

// Fonction de déconnexion
function logout() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('sessionExpiry');
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('adminInterface').style.display = 'none';
    location.reload();
}

// Gestion de l'authentification
document.getElementById('authForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Authentification réussie
        setSession();
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('adminInterface').style.display = 'block';
        loadRecipes();
        loadFeaturedProductForm();
        loadPromosList();
    } else {
        alert('Identifiants incorrects');
    }
});

// Ajouter le bouton de déconnexion
const adminInterface = document.getElementById('adminInterface');
const logoutButton = document.createElement('button');
logoutButton.className = 'admin-button logout-button';
logoutButton.innerHTML = '<i class="fas fa-sign-out-alt"></i> Déconnexion';
logoutButton.onclick = logout;

// Vérifier la session toutes les minutes
setInterval(() => {
    if (document.getElementById('adminInterface').style.display !== 'none') {
        if (!checkSession()) {
            alert('Votre session a expiré. Veuillez vous reconnecter.');
            location.reload();
        }
    }
}, 60000);

// Gestion du formulaire de recette
function showRecipeForm(isEdit = false) {
    const form = document.getElementById('recipeForm');
    const title = form.querySelector('h2');
    title.textContent = isEdit ? 'Modifier la recette' : 'Ajouter une recette';
    form.style.display = 'block';
    
    if (!isEdit) {
        document.getElementById('addRecipeForm').reset();
        document.getElementById('imagePreview').innerHTML = '';
        currentEditIndex = -1;
    }
}

function hideRecipeForm() {
    document.getElementById('recipeForm').style.display = 'none';
    document.getElementById('addRecipeForm').reset();
    document.getElementById('imagePreview').innerHTML = '';
    currentEditIndex = -1;
}

// Gestion de la soumission du formulaire de recette
document.getElementById('addRecipeForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        const formData = {
            name: sanitizeInput(document.getElementById('recipeName').value),
            prepTime: sanitizeInput(document.getElementById('prepTime').value),
            cookTime: sanitizeInput(document.getElementById('cookTime').value),
            servings: sanitizeInput(document.getElementById('servings').value),
            ingredients: sanitizeInput(document.getElementById('ingredients').value)
                .split('\n')
                .filter(line => line.trim() !== ''),
            instructions: sanitizeInput(document.getElementById('instructions').value)
                .split('\n')
                .filter(line => line.trim() !== '')
        };

        // Gestion de l'image
        const imageInput = document.getElementById('recipeImage');
        if (imageInput.files && imageInput.files[0]) {
            formData.image = await getBase64Image(imageInput.files[0]);
        } else {
            formData.image = 'images/default-recipe.jpg';
        }

        // Valider la recette
        validateRecipe(formData);

        // Ajouter ou mettre à jour la recette
        if (currentEditIndex === -1) {
            await addRecipe(formData);
        } else {
            await updateRecipe(currentEditIndex, formData);
        }

        // Recharger la liste des recettes
        await loadRecipes();
        hideRecipeForm();
    } catch (error) {
        alert('Erreur : ' + error.message);
    }
});

// Fonction pour charger les recettes
async function loadRecipes() {
    const data = await api.getData();
    const recipes = data?.recipes || [];
    const recipesList = document.querySelector('.recipes-list');
    recipesList.innerHTML = '';
    
    recipes.forEach((recipe, index) => {
        const recipeElement = document.createElement('div');
        recipeElement.className = 'recipe-item';
        
        const titleSpan = document.createElement('span');
        titleSpan.className = 'recipe-item-title';
        titleSpan.textContent = sanitizeInput(recipe.name);
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'recipe-actions';
        
        const editButton = document.createElement('button');
        editButton.className = 'action-button';
        editButton.innerHTML = '<i class="fas fa-edit"></i>';
        editButton.onclick = () => editRecipe(index);
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'action-button';
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.onclick = () => deleteRecipeItem(index);
        
        actionsDiv.appendChild(editButton);
        actionsDiv.appendChild(deleteButton);
        
        recipeElement.appendChild(titleSpan);
        recipeElement.appendChild(actionsDiv);
        recipesList.appendChild(recipeElement);
    });
}

// Fonction pour supprimer une recette
async function deleteRecipeItem(index) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
        const data = await api.getData();
        data.recipes.splice(index, 1);
        await api.updateData(data);
        await loadRecipes();
    }
}

// Fonction pour éditer une recette
async function editRecipe(index) {
    const data = await api.getData();
    const recipe = data.recipes[index];
    currentEditIndex = index;
    
    document.getElementById('recipeName').value = recipe.name;
    document.getElementById('prepTime').value = recipe.prepTime;
    document.getElementById('cookTime').value = recipe.cookTime;
    document.getElementById('servings').value = recipe.servings;
    document.getElementById('ingredients').value = recipe.ingredients.join('\n');
    document.getElementById('instructions').value = recipe.instructions.join('\n');
    
    const imagePreview = document.getElementById('imagePreview');
    imagePreview.innerHTML = `<img src="${recipe.image}" alt="${recipe.name}" style="max-width: 200px;">`;
    
    showRecipeForm(true);
}

// Fonction pour mettre à jour le produit coup de cœur
async function updateFeaturedProduct(product) {
    const data = await api.getData();
    data.featuredProduct = product;
    await api.updateData(data);
}

// Fonction pour obtenir le produit coup de cœur
async function getFeaturedProduct() {
    const data = await api.getData();
    return data?.featuredProduct;
}

// Fonction pour convertir une image en base64
function getBase64Image(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Fonction pour charger le formulaire du produit coup de cœur
async function loadFeaturedProductForm() {
    const product = await getFeaturedProduct();
    if (product) {
        document.getElementById('featuredTitle').value = product.title;
        document.getElementById('featuredDescription').value = product.description;
        document.getElementById('featuredPrice').value = product.price;
        document.getElementById('featuredImagePreview').innerHTML = 
            `<img src="${product.image}" alt="${product.title}" style="max-width: 200px;">`;
    }
}

// Gestion du formulaire du produit coup de cœur
document.getElementById('featuredProductForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        const product = {
            title: sanitizeInput(document.getElementById('featuredTitle').value),
            description: sanitizeInput(document.getElementById('featuredDescription').value),
            price: sanitizeInput(document.getElementById('featuredPrice').value),
            image: document.getElementById('featuredImage').files[0] 
                ? await getBase64Image(document.getElementById('featuredImage').files[0])
                : (await getFeaturedProduct()).image
        };
        
        await updateFeaturedProduct(product);
        alert('Produit coup de cœur mis à jour avec succès !');
    } catch (error) {
        alert('Erreur : ' + error.message);
    }
});

// Fonction pour obtenir les promos
async function getPromos() {
    const data = await api.getData();
    return data?.promos || [];
}

// Fonction pour mettre à jour les promos
async function updatePromos(promos) {
    const data = await api.getData();
    data.promos = promos;
    await api.updateData(data);
}

// Fonction pour ajouter une promo
async function addPromo(promo) {
    const promos = await getPromos();
    promos.push(promo);
    await updatePromos(promos);
}

// Fonction pour supprimer une promo
async function deletePromo(id) {
    const promos = await getPromos();
    const index = promos.findIndex(p => p.id === id);
    if (index !== -1) {
        promos.splice(index, 1);
        await updatePromos(promos);
    }
}

// Fonction pour éditer une promo
async function editPromo(id, updatedPromo) {
    const promos = await getPromos();
    const index = promos.findIndex(p => p.id === id);
    if (index !== -1) {
        promos[index] = { ...promos[index], ...updatedPromo };
        await updatePromos(promos);
    }
}

// Fonction pour charger la liste des promos
async function loadPromosList() {
    const promos = await getPromos();
    const promosList = document.getElementById('promosList');
    promosList.innerHTML = '';
    
    promos.forEach(promo => {
        const promoElement = document.createElement('div');
        promoElement.className = 'promo-item';
        promoElement.innerHTML = `
            <img src="${promo.image}" alt="${promo.title}" style="width: 100px; height: 100px; object-fit: cover;">
            <div class="promo-info">
                <h3>${escapeHtml(promo.title)}</h3>
                <p>${escapeHtml(promo.description)}</p>
            </div>
            <div class="promo-actions">
                <button onclick="editPromoForm(${promo.id})" class="edit-button">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deletePromoConfirm(${promo.id})" class="delete-button">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        promosList.appendChild(promoElement);
    });
}

// Fonction pour éditer une promo
async function editPromoForm(id) {
    const promos = await getPromos();
    const promo = promos.find(p => p.id === id);
    if (promo) {
        document.getElementById('promoTitle').value = promo.title;
        document.getElementById('promoDescription').value = promo.description;
        document.getElementById('promoImagePreview').innerHTML = 
            `<img src="${promo.image}" alt="${promo.title}" style="max-width: 200px;">`;
        document.getElementById('currentPromoId').value = id;
        document.getElementById('promoForm').style.display = 'block';
    }
}

// Fonction pour confirmer la suppression d'une promo
async function deletePromoConfirm(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) {
        await deletePromo(id);
        await loadPromosList();
    }
}

// Gestionnaire du formulaire de promo
document.getElementById('promoForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        const promoData = {
            title: sanitizeInput(document.getElementById('promoTitle').value),
            description: sanitizeInput(document.getElementById('promoDescription').value)
        };

        const promoId = document.getElementById('promoId').value;
        const imageFile = document.getElementById('promoImage').files[0];

        if (imageFile) {
            if (!imageFile.type.startsWith('image/')) {
                throw new Error('Le fichier doit être une image');
            }
            promoData.image = await getBase64Image(imageFile);
        } else if (promoId) {
            // Garder l'image existante en cas d'édition
            const existingPromo = (await getPromos()).find(p => p.id === parseInt(promoId));
            promoData.image = existingPromo.image;
        } else {
            throw new Error('Une image est requise pour une nouvelle promotion');
        }

        if (promoId) {
            await editPromo(parseInt(promoId), promoData);
        } else {
            promoData.id = Date.now(); // Utiliser timestamp comme ID unique
            await addPromo(promoData);
        }

        // Réinitialiser le formulaire
        this.reset();
        document.getElementById('promoId').value = '';
        document.getElementById('promoImagePreview').innerHTML = '';
        document.getElementById('promoForm').style.display = 'none';
        
        await loadPromosList();
        alert('Promotion mise à jour avec succès !');
        
    } catch (error) {
        alert('Erreur : ' + error.message);
    }
});

// Prévisualisation de l'image de promo
document.getElementById('promoImage').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.createElement('img');
            preview.src = e.target.result;
            preview.style.maxWidth = '200px';
            preview.style.marginTop = '10px';
            const imagePreview = document.getElementById('promoImagePreview');
            imagePreview.innerHTML = '';
            imagePreview.appendChild(preview);
        }
        reader.readAsDataURL(file);
    }
});

// Bouton pour afficher le formulaire d'ajout de promo
document.getElementById('addPromoButton').addEventListener('click', function() {
    document.getElementById('promoForm').reset();
    document.getElementById('promoId').value = '';
    document.getElementById('promoImagePreview').innerHTML = '';
    document.getElementById('promoForm').style.display = 'block';
});

// Vérifier si l'utilisateur est déjà authentifié
if (localStorage.getItem('isAuthenticated') === 'true') {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('adminInterface').style.display = 'block';
    loadRecipes();
    loadFeaturedProductForm();
    loadPromosList(); // Charger la liste des promos
} 