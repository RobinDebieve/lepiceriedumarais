class ApiService {
    constructor() {
        // Configuration par défaut
        this.API_KEY = '$2a$10$1EDNyeDh8g9NUlSg9MVIa./bjlnUpYkjLCSKpHLAhVJyRjI6J127C';
        this.BIN_ID = '6842aeda8561e97a50204111';
        this.API_URL = `https://api.jsonbin.io/v3/b/${this.BIN_ID}`;

        // Si une configuration externe existe, l'utiliser
        if (window.APP_CONFIG && window.APP_CONFIG.JSONBIN_API_KEY) {
            this.API_KEY = window.APP_CONFIG.JSONBIN_API_KEY;
        }
    }

    // Fonction pour compresser une image
    async compressImage(base64String, maxWidth = 600, quality = 0.6) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = base64String;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Calculer les nouvelles dimensions en gardant le ratio
                if (width > maxWidth) {
                    height = (maxWidth * height) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convertir en JPEG avec une qualité réduite
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                
                // Vérifier la taille de l'image compressée
                const base64Length = compressedBase64.length - 'data:image/jpeg;base64,'.length;
                const sizeInBytes = Math.ceil((base64Length * 3) / 4);
                const sizeInKB = sizeInBytes / 1024;
                
                console.log(`Image compressée : ${sizeInKB.toFixed(2)} KB`);
                
                // Si l'image est toujours trop grande, réduire encore la qualité
                if (sizeInKB > 100) {
                    console.log('Image encore trop grande, nouvelle compression avec qualité réduite');
                    return this.compressImage(base64String, maxWidth, quality - 0.1);
                }
                
                resolve(compressedBase64);
            };
            img.onerror = reject;
        });
    }

    async getData() {
        try {
            console.log('Fetching data from JSONBin.io...');
            const response = await fetch(this.API_URL, {
                method: 'GET',
                headers: {
                    'X-Access-Key': this.API_KEY,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Data received:', data);
            return data.record;
        } catch (error) {
            console.error('Error fetching data:', error);
            return defaultData;
        }
    }

    async updateData(data) {
        try {
            // Compresser les images avant l'envoi
            if (data.promos) {
                for (let promo of data.promos) {
                    if (promo.image && promo.image.startsWith('data:image')) {
                        promo.image = await this.compressImage(promo.image);
                    }
                }
            }
            
            if (data.recipes) {
                for (let recipe of data.recipes) {
                    if (recipe.image && recipe.image.startsWith('data:image')) {
                        recipe.image = await this.compressImage(recipe.image);
                    }
                }
            }
            
            if (data.featuredProduct && data.featuredProduct.image && data.featuredProduct.image.startsWith('data:image')) {
                data.featuredProduct.image = await this.compressImage(data.featuredProduct.image);
            }

            console.log('Updating data on JSONBin.io...', data);
            const response = await fetch(this.API_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Key': this.API_KEY
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Data updated successfully:', result);
            return result;
        } catch (error) {
            console.error('Error updating data:', error);
            throw error;
        }
    }
}

// Structure des données
const defaultData = {
    promos: [
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
    ],
    featuredProduct: {
        title: "Glace Kinder Bueno",
        description: "Découvrez notre délicieuse glace Kinder Bueno, un mélange parfait de crème glacée onctueuse et de morceaux croquants de Kinder Bueno. Un véritable délice pour les amateurs de chocolat et de noisettes !",
        price: "3.50",
        image: "images/bueno.jpg"
    },
    recipes: [
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
    ]
};

// Exporter les éléments nécessaires
export { ApiService, defaultData }; 