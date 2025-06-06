class ApiService {
    constructor() {
        // Remplacez YOUR_API_KEY par votre clé API JSONBin.io
        this.API_KEY = '$2a$10$4UYdz05Raxn/Ly3y4y6p/u649fUdDaQg6XjHlBtlTuZIxgYH.okca';
        // ID du bin JSONBin.io
        this.BIN_ID = '6842aeda8561e97a50204111';
        this.BASE_URL = 'https://api.jsonbin.io/v3/b';
    }

    async getData() {
        try {
            const response = await fetch(`${this.BASE_URL}/${this.BIN_ID}/latest`, {
                method: 'GET',
                headers: {
                    'X-Master-Key': this.API_KEY,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            return data.record;
        } catch (error) {
            console.error('Erreur lors de la récupération des données:', error);
            return null;
        }
    }

    async updateData(newData) {
        try {
            const response = await fetch(`${this.BASE_URL}/${this.BIN_ID}`, {
                method: 'PUT',
                headers: {
                    'X-Master-Key': this.API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newData)
            });
            const data = await response.json();
            return data.record;
        } catch (error) {
            console.error('Erreur lors de la mise à jour des données:', error);
            return null;
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