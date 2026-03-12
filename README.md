# YieldTrack ERP

YieldTrack est une application web de type ERP conçue pour la gestion de projets, la structuration en lots de travaux (Work Packages) et le suivi des tâches (Remaining Work, budgets, statuts). 

L'application utilise une architecture classique MVC (Modèle-Vue-Contrôleur) avec un backend en Node.js/Express, un ORM (Sequelize) relié à une base de données MariaDB, et un frontend rendu côté serveur avec EJS, agrémenté de jQuery et DataTables pour l'interactivité.

---

## 🛠️ Stack Technique

* **Backend :** Node.js, Express, TypeScript.
* **Base de données :** MariaDB via l'ORM Sequelize.
* **Frontend :** EJS (moteur de templates), Bootstrap 4 (Thème SB Admin 2), jQuery.
* **Tableaux de données :** DataTables (Ajax).
* **Authentification :** JWT (JSON Web Tokens) stockés dans des cookies sécurisés avec hachage Bcrypt.

---

## 🏗️ Architecture du Projet (MVC)

Le projet est structuré de la manière suivante :

* **`/src/models/`** : Contient les définitions des tables de la base de données via Sequelize (Classes TypeScript comme `User`, `Project`, `Task`, etc.) et les relations entre elles (dans `Index.ts`).
* **`/src/controllers/`** : Contient la logique métier. Fait le lien entre les requêtes de l'utilisateur, la base de données, et les vues renvoyées.
* **`/src/rootes/` (Routes)** : Déclare les points d'entrée de l'application (URL) et les associe aux fonctions des contrôleurs.
* **`/src/middlewares/`** : Fonctions intermédiaires, notamment pour vérifier l'authentification (`authMiddleware.ts`) ou charger les préférences d'affichage utilisateur (`preferencesMiddleware.ts`).
* **`/views/`** : Les fichiers de templates EJS. On y trouve les pages complètes (`/Pages/`), les composants réutilisables (`/partials/`) et les fenêtres modales (`/modals/`).
* **`/doc/`** : Scripts SQL pour la création de la base (`creation_db.sql`) et l'insertion des données de test (`data.sql`).

---

## 🚀 Fonctionnement Général

1. **Authentification** : L'utilisateur se connecte (`/login`). Un token JWT est généré et placé dans un cookie HTTP-Only. Le middleware `isAuthenticated` vérifie ce token à chaque requête sur les routes protégées.
2. **Navigation** : L'utilisateur navigue via la barre latérale (`views/partials/sidebar.ejs`) vers les entités : Projets, Work Packages, ou Remaining Tasks.
3. **Affichage des données** : Les pages affichent des tableaux de bord dynamiques. Les données ne sont pas chargées directement au rendu de la page HTML, mais récupérées asynchroneusement via des appels API (AJAX) effectués par DataTables.
4. **Préférences utilisateur (Modifiabilité)** : Les colonnes des tableaux peuvent être affichées ou masquées par l'utilisateur. Ces préférences sont envoyées via la route `/preferences/columns`, sauvegardées dans un cookie `tablePreferences`, et rechargées par un middleware.

---

## 📖 Guide de Développement : Implémenter un nouveau Tableau Dynamique

L'application dispose d'un système de tableaux dynamiques hautement réutilisable et personnalisable ("mouillabilité" / flexibilité). Voici comment intégrer une nouvelle table étape par étape.

### Étape 1 : Créer la route et le contrôleur pour l'API de données

DataTables a besoin d'une URL JSON pour charger ses données. Dans votre contrôleur, créez une fonction qui renvoie un objet JSON contenant un tableau nommé `data` :

```typescript
// src/controllers/myEntityController.ts
export const getMyEntityData = async (req: Request, res: Response) => {
    try {
        const items = await MyEntity.findAll({ /* vos includes */ });
        res.json({ data: items }); // DataTables s'attend EXACTEMENT à la clé "data"
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
};
```
Déclarez ensuite cette route dans vos fichiers de routeurs (ex: /my-entity/api/data).

### Étape 2 : Préparer la Vue (Contrôleur)
Créez la fonction qui va rendre la page EJS. Vous devez y définir les colonnes disponibles et injecter les préférences de l'utilisateur.

```typescript
// src/controllers/myEntityController.ts
export const MY_ENTITY_COLUMNS = [
    { id: 'id', label: "ID" },
    { id: 'name', label: "Nom" },
    { id: 'status', label: "Statut" }
];

export const renderMyEntityPage = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const TABLE_ID = 'myEntityList';
    // Chargement des préférences depuis le middleware
    const selectedColumns = (req as any).tablePreferences[TABLE_ID] || ['name', 'status']; 

    res.render('Pages/myEntityPage', {
        user, 
        tableId: TABLE_ID, 
        tableTitle: "Ma Nouvelle Liste",
        allColumns: MY_ENTITY_COLUMNS, 
        selectedColumns,
        currentUrl: req.originalUrl,
        createAction: { label: "Nouveau", icon: "fas fa-plus", modalTarget: "#myEntityModal" }
    });
};
```

### Étape 3 : Créer la Vue EJS (Structure)
Dans votre fichier views/Pages/myEntityPage.ejs, incluez le composant partiel dynamic_table. Ce composant gérera automatiquement l'affichage de l'entête du tableau, le bouton "Créer" et le menu déroulant de sélection des colonnes.

```html
<div class="container-fluid">
    <%- include('../partials/dynamic_table') %>
</div>
```

### Étape 4 : Initialiser DataTables et définir les Actions (JavaScript)
Toujours dans votre fichier EJS, ajoutez le script pour lier votre tableau HTML à votre API de données. Utilisez la fonction globale initYieldtrackTable (définie dans footer.ejs).

#### Gestion des Actions sur les lignes
Pour ajouter des boutons d'action (Éditer, Archiver, etc.) sur chaque ligne, vous devez définir une colonne actions avec la propriété render. Cette fonction permet de retourner du code HTML construit dynamiquement à partir des données de la ligne courante (row.id, row.name, etc.).

```javascript
<script>
    $(document).ready(function() {
        // 1. Récupération des préférences injectées par EJS
        const prefs = <%- JSON.stringify(selectedColumns) %>;

        // 2. Définition des colonnes
        const columnsDefinition = [
            { data: 'id', name: 'id', title: 'ID' },
            { data: 'name', name: 'name', title: 'Nom' },
            { data: 'status', name: 'status', title: 'Statut' },
            
            // 3. Implémentation de la colonne d'ACTIONS
            {
                data: null, 
                name: 'actions', 
                title: 'Actions', 
                orderable: false, // On désactive le tri sur cette colonne
                render: function(data, type, row) {
                    // row contient toutes les données de l'objet renvoyé par l'API JSON
                    return `
                        <div class="dropdown no-arrow d-inline">
                            <a class="btn btn-link btn-sm dropdown-toggle" href="#" data-toggle="dropdown">
                                <i class="fas fa-ellipsis-v text-gray-400"></i>
                            </a>
                            <div class="dropdown-menu dropdown-menu-right shadow">
                                <a class="dropdown-item" href="#" data-toggle="modal" data-target="#editModal" data-id="${row.id}">
                                    <i class="fas fa-pen fa-fw mr-2"></i> Éditer
                                </a>
                                <a class="dropdown-item text-danger" href="#" data-toggle="modal" data-target="#archiveModal" data-id="${row.id}" data-name="${row.name}">
                                    <i class="fas fa-trash fa-fw mr-2"></i> Archiver
                                </a>
                            </div>
                        </div>
                    `;
                }
            }
        ];

        // 4. Lancement du tableau
        // initYieldtrackTable(tableId, apiUrl, columnsConfig, userPreferences)
        initYieldtrackTable('<%= tableId %>', '/my-entity/api/data', columnsDefinition, prefs);
    });
</script>
```

### 💡 Comment fonctionne la modifiabilité (Préférences des colonnes) ?
La flexibilité des tableaux repose sur le couplage entre DataTables et le Backend :

Le fichier dynamic_table.ejs génère une liste de cases à cocher basée sur allColumns.

Quand l'utilisateur clique sur "Appliquer", un formulaire POST envoie les colonnes cochées vers /preferences/columns.

Le serveur enregistre ce tableau de chaînes de caractères (ex: ['name', 'status']) dans le cookie tablePreferences (valable 30 jours).

La page recharge. Le middleware lit le cookie et injecte selectedColumns dans la vue.

La fonction initYieldtrackTable (JavaScript) compare columnsDefinition avec les préférences. Si le nom d'une colonne n'est pas dans le tableau prefs, elle masque automatiquement la colonne via l'attribut visible: false de DataTables.
