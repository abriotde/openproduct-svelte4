# Guide de démarrage rapide - Extraction d'emails

## Installation (une seule fois)

```bash
cd scripts
pip3 install -r requirements_email_extraction.txt
```

## Utilisation rapide

### 1. Test sur 5 producteurs (recommandé pour commencer)

```bash
python3 extract_emails_from_websites.py --limit 5 --dry-run
```

**Résultat** : Génère uniquement le rapport CSV (pas de SQL)

### 2. Consulter le rapport

```bash
# Ouvrir le fichier CSV le plus récent
ls -t email_extraction_report_*.csv | head -1 | xargs cat
```

### 3. Traiter 50 producteurs et générer le SQL

```bash
python3 extract_emails_from_websites.py --limit 50
```

**Résultat** : Génère le CSV + le fichier SQL

### 4. Vérifier le SQL généré

```bash
# Afficher le fichier SQL le plus récent
ls -t email_updates_*.sql | head -1 | xargs cat
```

### 5. Appliquer les mises à jour en base

```bash
# Remplacer par le nom du fichier généré
psql "$DATABASE_URL" -f email_updates_20251110_084136.sql
```

## Résultats attendus

Sur un échantillon de 100 producteurs, vous devriez obtenir :
- **60-70%** d'emails trouvés
- **80-90%** de liens réseaux sociaux trouvés
- **40-50%** de formulaires de contact détectés

## Fichiers générés

| Fichier | Description |
|---------|-------------|
| `email_extraction_report_*.csv` | Rapport détaillé avec tous les résultats |
| `email_updates_*.sql` | Requêtes UPDATE pour la base de données |
| `extract_emails.log` | Logs détaillés de l'exécution |

## Exemples de résultats

### Rapport CSV

```csv
id,company_name,website,emails_found,email_list,facebook,instagram,has_contact_form
107,La ferme Kabocha,https://www.lafermekabocha.bzh/,1,lafermekabocha@gmail.com,https://facebook.com/...,https://instagram.com/...,Oui
```

### Fichier SQL

```sql
-- Producteur: La ferme Kabocha
UPDATE producers SET email = 'lafermekabocha@gmail.com' WHERE id = 107;
```

## Que faire ensuite ?

### Cas 1 : Email trouvé ✅
→ Le script génère automatiquement la requête UPDATE

### Cas 2 : Formulaire de contact détecté 📝
→ Visitez le site manuellement et remplissez le formulaire

### Cas 3 : Réseaux sociaux uniquement 📱
→ Visitez le profil Facebook/Instagram pour chercher l'email

### Cas 4 : Rien trouvé ❌
→ Vérifiez si le site web est toujours actif

## Commandes utiles

```bash
# Voir les logs en temps réel
tail -f extract_emails.log

# Compter les emails trouvés dans le dernier rapport
grep -c "@" email_extraction_report_*.csv | tail -1

# Lister tous les producteurs avec email trouvé
awk -F',' '$4 > 0 {print $2, $5}' email_extraction_report_*.csv | tail -1
```

## Aide

```bash
python3 extract_emails_from_websites.py --help
```

Pour plus de détails, consultez `README_EMAIL_EXTRACTION.md`.

