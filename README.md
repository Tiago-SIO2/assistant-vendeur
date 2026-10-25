Assistant Vendeur

Présentation

Assistant Vendeur est un outil pour les revendeurs de vêtements de seconde main, sur des plateformes comme Vinted. Le vendeur se connecte, range ses vêtements dans des collections, puis décrit chaque pièce en quelques mots-clés, choisit son état et peut ajouter une photo. Une IA rédige alors une annonce complète (titre, description, prix estimé et hashtags) que le vendeur n'a plus qu'à copier.

Adresse de production

https://assistant-vendeur.vercel.app

Architecture

L'application est développée avec Next.js et hébergée sur Vercel, qui exécute aussi les fonctions serverless du back. Les données sont stockées dans Supabase (PostgreSQL), qui gère également la connexion des utilisateurs par lien magique. Le modèle d'IA est hébergé chez Groq, et Upstash Redis limite le nombre de générations par utilisateur. Le navigateur ne communique qu'avec le back, qui est le seul à détenir les clés.

J'ai choisi quatre briques. Upstash QStash fait la génération en arrière-plan, car l'appel à l'IA prend plusieurs secondes et ne doit pas bloquer le vendeur ; le worker vérifie la signature de QStash et réessaie en cas d'erreur. Supabase Realtime affiche l'annonce dès qu'elle est prête, sans recharger la page, ce qui complète naturellement l'asynchrone. Langfuse trace chaque appel à l'IA avec ses tokens, sa durée et son coût, pour surveiller la ressource la plus coûteuse. Enfin, Supabase Storage stocke les photos des articles dans un espace privé, car une annonce sans photo se vend mal. Tous ces services sont contrôlés sur la page /admin, réservée aux administrateurs.

Modèle d'IA

J'utilise le modèle openai/gpt-oss-20b, hébergé par Groq. Il est rapide, gratuit pour un usage étudiant, et accepte un schéma JSON strict : l'annonce revient toujours au bon format, puis elle est vérifiée une seconde fois côté serveur. Comme l'API de Groq est compatible OpenAI, il suffit de changer les variables d'environnement pour passer à un autre fournisseur ou à un modèle plus puissant.

Structure de données

La base contient deux tables. La table collections regroupe les collections d'un vendeur (id, user_id, nom, created_at). La table items contient les articles (id, user_id, collection_id, mots_cles, titre, description, prix_estime, marque, taille, couleur, etat, hashtags, photo_path, statut, created_at). Chaque article appartient à une collection grâce à la clé étrangère collection_id, et chaque ligne appartient à un utilisateur grâce à la colonne user_id.

La Row Level Security est activée sur les deux tables : un utilisateur ne peut voir et créer que ses propres collections et articles, et ne peut ajouter un article que dans une de ses collections. Les photos suivent la même règle : chacun n'accède qu'à son propre dossier.

Lancer le projet en local

Il faut Node.js 20 ou plus, ainsi que des comptes Supabase, Groq, Upstash et Langfuse. On récupère le projet, on installe les dépendances et on crée son fichier de variables :

bash
git clone https://github.com/<Tiago-SIO2>/assistant-vendeur.git
cd assistant-vendeur
npm install
cp .env.example .env.local

On remplit ensuite .env.local avec ses propres clés : celles du modèle d'IA (AI_BASE_URL, AI_API_KEY, AI_MODEL et les deux prix pour le calcul du coût), de Supabase (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY), de l'administration (ADMIN_EMAILS), d'Upstash Redis et QStash, l'adresse de l'application (APP_URL) et les clés de Langfuse. La liste complète est dans .env.example.

Enfin, on lance deux terminaux : l'un pour le serveur QStash local, l'autre pour l'application, disponible sur http://localhost:3000.

bash
npx @upstash/qstash-cli@latest dev
bash
npm run dev

Limites et améliorations possibles

Quand une génération échoue, le vendeur voit un message général, sans en connaître la cause précise. Le modèle étant petit, il peut parfois ajouter un détail non demandé, et le prix reste une estimation. Il n'est pas encore possible de modifier ni de supprimer une annonce.

Pour améliorer l'application, j'afficherais la cause exacte d'un échec (quota atteint ou service en panne), je laisserais l'IA analyser la photo pour compléter l'annonce, et j'ajouterais la modification, la régénération et la suppression des annonces.