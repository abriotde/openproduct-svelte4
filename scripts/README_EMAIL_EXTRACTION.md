# Script d'extraction d'emails depuis les sites web

Ce script permet d'extraire automatiquement les adresses email des producteurs depuis leurs sites web.

## Fonctionnalités

### ✅ Ce que le script fait

1. **Extraction d'emails** :
   - Visite la page d'accueil du site
   - Cherche et visite les pages "Contact", "À propos", etc.
   - Extrait tous les emails trouvés
   - Filtre les emails invalides ou techniques (Sentry, Wix, analytics, etc.)

2. **Détection de réseaux sociaux** :
   - Facebook
   - Instagram
   - LinkedIn
   - Twitter

3. **Détection de formulaires de contact** :
   - Identifie si le site a un formulaire de contact

4. **Génération de rapports** :
   - Fichier CSV avec tous les résultats détaillés
   - Fichier SQL avec les requêtes UPDATE pour la base de données
   - Logs détaillés dans `extract_emails.log`

### ⚠️ Limitations

- **Formulaires de contact** : Le script les détecte mais ne les remplit pas automatiquement
- **Réseaux sociaux** : Le script trouve les liens mais ne visite pas les profils (nécessiterait authentification)
- **CAPTCHA** : Le script ne peut pas contourner les protections anti-bot
- **Sites dynamiques** : Les sites avec contenu JavaScript lourd peuvent ne pas être entièrement analysés

## Installation

### Prérequis

- Python 3.7+
- Accès à la base de données PostgreSQL

### Installation des dépendances

```bash
cd scripts
pip3 install -r requirements_email_extraction.txt
```

Les dépendances installées :
- `psycopg2-binary` : Connexion à PostgreSQL
- `requests` : Requêtes HTTP
- `beautifulsoup4` : Parsing HTML
- `lxml` : Parser HTML rapide

## Utilisation

### Commande de base

```bash
python3 extract_emails_from_websites.py
```

Cette commande traite **tous** les producteurs sans email.

### Options disponibles

#### Limiter le nombre de producteurs

```bash
python3 extract_emails_from_websites.py --limit 10
```

Traite seulement les 10 premiers producteurs (utile pour tester).

#### Mode test (dry-run)

```bash
python3 extract_emails_from_websites.py --limit 5 --dry-run
```

Mode test qui :
- Extrait les emails
- Génère le rapport CSV
- **Ne génère PAS** le fichier SQL

Idéal pour vérifier les résultats avant de générer les requêtes UPDATE.

#### Aide

```bash
python3 extract_emails_from_websites.py --help
```

## Fichiers générés

### 1. Rapport CSV

**Nom** : `email_extraction_report_YYYYMMDD_HHMMSS.csv`

**Colonnes** :
- `id` : ID du producteur
- `company_name` : Nom de l'entreprise
- `website` : URL du site web
- `emails_found` : Nombre d'emails trouvés
- `email_list` : Liste des emails (séparés par des virgules)
- `facebook` : Lien Facebook (si trouvé)
- `instagram` : Lien Instagram (si trouvé)
- `linkedin` : Lien LinkedIn (si trouvé)
- `twitter` : Lien Twitter (si trouvé)
- `has_contact_form` : "Oui" ou "Non"
- `pages_visited` : Nombre de pages visitées
- `error` : Message d'erreur (si échec)

**Exemple** :
```csv
id,company_name,website,emails_found,email_list,facebook,instagram,has_contact_form,pages_visited
123,La ferme Kabocha,https://www.lafermekabocha.bzh/,1,lafermekabocha@gmail.com,https://facebook.com/...,https://instagram.com/...,Oui,2
```

### 2. Fichier SQL

**Nom** : `email_updates_YYYYMMDD_HHMMSS.sql`

**Contenu** : Requêtes UPDATE pour mettre à jour la base de données

**Exemple** :
```sql
-- Producteur: La ferme Kabocha
UPDATE producers SET email = 'lafermekabocha@gmail.com' WHERE id = 123;

-- Producteur: La ferme de Saint-Daniel
UPDATE producers SET email = 'lafermedesaintdaniel@gmail.com' WHERE id = 124;
```

### 3. Fichier de logs

**Nom** : `extract_emails.log`

**Contenu** : Logs détaillés de toutes les opérations

## Workflow recommandé

### 1. Test sur un petit échantillon

```bash
python3 extract_emails_from_websites.py --limit 10 --dry-run
```

- Vérifiez le rapport CSV généré
- Validez que les emails trouvés sont corrects
- Identifiez les problèmes éventuels

### 2. Traitement par lots

```bash
python3 extract_emails_from_websites.py --limit 100
```

- Traitez 100 producteurs à la fois
- Vérifiez le fichier SQL généré
- Appliquez les UPDATE en base de données

### 3. Application des mises à jour

```bash
psql "$DATABASE_URL" -f email_updates_20251110_083938.sql
```

### 4. Traitement manuel des cas spéciaux

Utilisez le rapport CSV pour identifier :
- Les producteurs avec formulaire de contact uniquement
- Les producteurs avec réseaux sociaux mais sans email
- Les producteurs avec erreurs

## Configuration

### Variable d'environnement

Le script utilise la variable `DATABASE_URL` pour se connecter à la base de données.

**Par défaut** : `postgresql://postgres:password@localhost:5432/openproduct_dev`

**Personnaliser** :
```bash
export DATABASE_URL="postgresql://user:password@host:port/database"
python3 extract_emails_from_websites.py
```

### Paramètres modifiables dans le script

Ouvrez `extract_emails_from_websites.py` et modifiez :

```python
# Timeout pour les requêtes HTTP (en secondes)
TIMEOUT = 10

# Nombre maximum de pages à visiter par site
MAX_PAGES_PER_SITE = 5

# Délai entre chaque requête (en secondes)
DELAY_BETWEEN_REQUESTS = 1
```

## Filtrage des emails

Le script filtre automatiquement :

### Emails ignorés
- Emails génériques : `contact@example.com`, `info@example.com`
- Emails système : `noreply@`, `postmaster@`, `webmaster@`
- Emails de test : `test@test`, `admin@example`

### Domaines ignorés
- Services techniques : `sentry.io`, `wixpress.com`
- Analytics : `googletagmanager.com`, `google-analytics.com`
- Réseaux sociaux : `facebook.com`, `twitter.com`, etc.

### Validation
- Format email valide (regex)
- Longueur < 50 caractères
- Pas de caractères suspects (hash, UUID)

## Statistiques

À la fin de l'exécution, le script affiche :

```
============================================================
STATISTIQUES FINALES
============================================================
Total de producteurs traités: 100
Emails trouvés: 67 (67.0%)
Réseaux sociaux trouvés: 85 (85.0%)
Formulaires de contact: 45 (45.0%)
Erreurs: 5 (5.0%)
============================================================
```

## Gestion des erreurs

### Erreurs courantes

1. **Timeout** : Le site ne répond pas assez vite
   - Solution : Augmenter `TIMEOUT` dans le script

2. **Connexion refusée** : Le site bloque les bots
   - Solution : Traiter manuellement

3. **SSL Error** : Problème de certificat
   - Solution : Le script ignore automatiquement

4. **404 Not Found** : Page inexistante
   - Solution : Vérifier l'URL du site web

### Logs

Consultez `extract_emails.log` pour les détails :

```bash
tail -f extract_emails.log
```

## Traitement manuel des cas spéciaux

### Producteurs avec formulaire de contact uniquement

1. Filtrez le CSV : `has_contact_form = Oui` et `emails_found = 0`
2. Visitez manuellement les sites
3. Remplissez les formulaires pour demander l'email

### Producteurs avec réseaux sociaux uniquement

1. Filtrez le CSV : `facebook != ""` et `emails_found = 0`
2. Visitez les profils Facebook/Instagram
3. Cherchez l'email dans "À propos" ou envoyez un message

## Exemples d'utilisation

### Traiter tous les producteurs

```bash
python3 extract_emails_from_websites.py
```

### Test rapide sur 5 producteurs

```bash
python3 extract_emails_from_websites.py --limit 5 --dry-run
```

### Traiter 50 producteurs et générer le SQL

```bash
python3 extract_emails_from_websites.py --limit 50
```

### Appliquer les mises à jour en base

```bash
# 1. Générer le fichier SQL
python3 extract_emails_from_websites.py --limit 100

# 2. Vérifier le contenu
cat email_updates_20251110_083938.sql

# 3. Appliquer en base
psql "$DATABASE_URL" -f email_updates_20251110_083938.sql
```

## Bonnes pratiques

1. **Testez d'abord** : Utilisez `--dry-run` et `--limit` pour tester
2. **Traitez par lots** : Ne traitez pas tous les producteurs d'un coup
3. **Vérifiez les résultats** : Consultez le CSV avant d'appliquer le SQL
4. **Respectez les sites** : Le délai entre requêtes évite de surcharger les serveurs
5. **Sauvegardez** : Gardez les rapports CSV pour référence future

## Améliorations futures possibles

- [ ] Validation des emails par vérification DNS (MX records)
- [ ] Détection de la langue du site pour adapter les mots-clés
- [ ] Support de sites avec JavaScript (Selenium/Playwright)
- [ ] Extraction d'autres informations (téléphone, adresse, etc.)
- [ ] Interface web pour visualiser les résultats
- [ ] Envoi automatique d'emails de demande de contact

## Support

Pour toute question ou problème :
1. Consultez les logs : `extract_emails.log`
2. Vérifiez le rapport CSV pour identifier le problème
3. Testez avec `--limit 1` sur un producteur spécifique

## Licence et avertissements

⚠️ **Avertissement légal** :
- Respectez les conditions d'utilisation des sites web
- Le scraping peut être interdit sur certains sites
- N'utilisez pas ce script pour du spam
- Respectez le RGPD pour le traitement des données personnelles

Ce script est fourni à des fins d'automatisation interne uniquement.

