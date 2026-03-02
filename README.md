# Readify - Système de Gestion de Bibliothèque Intelligente

Readify est une application web moderne (Next.js 15) permettant de gérer une bibliothèque physique. Elle distingue les rôles **Admin** (gestion du stock, financier, décisionnel) et **Membre** (emprunts, réservations, tendances).

## Installation & Lancement

1. **Cloner le projet**
2. **Installer les dépendances** : `pnpm install`
3. **Variables d'environnement** : Créer un `.env` avec :
   - `DATABASE_URL` (Postgres/Neon)
   - `BETTER_AUTH_SECRET`
   - `NEXT_PUBLIC_APP_URL=http://localhost:3000`
4. **Synchroniser la DB** : `npx drizzle-kit push`
5. **Lancer** : `pnpm dev`

---

## Fonctionnalités Clés

### Pour les Membres
- **Catalogue Dynamique** : Recherche par titre, auteur ou ISBN.
- **Système d'Emprunt** : Emprunt immédiat si le stock est disponible.
- **Réservations FIFO** : Si le stock est à 0, le membre peut réserver.
  - *Règle métier* : Maximum 2 réservations actives par membre.
  - *Annulation* : Possibilité d'annuler manuellement sa réservation.
- **Tableau de Bord** : Affichage des livres "Tendances" (les plus empruntés du mois).

### Pour les Administrateurs
- **CRUD Catalogue** : Ajout, modification et suppression sécurisée des ouvrages.
- **Aide à la Décision** : 
  - Historique complet des rotations pour chaque livre (qui l'a eu, quand, est-ce rendu ?).
  - Statistiques des lecteurs les plus actifs.
  - Suivi financier des amendes impayées.
- **Gestion des Usagers** : Visualisation du taux d'annulation et suspension automatique.

---

## Architecture Technique
- **Framework** : Next.js 15 (App Router)
- **Base de données** : PostgreSQL via Drizzle ORM
- **Authentification** : Better-Auth (Rôles RBAC)
- **UI Components** : Shadcn/UI & Tailwind CSS