# Fichiers CSV de Test pour l'Import de Transactions

Ce dossier contient plusieurs fichiers CSV d'exemple pour tester l'import de transactions.

## Fichiers disponibles :

### 1. `test-transactions.csv` (Format standard)
- Format : virgule comme délimiteur
- Colonnes : merchant, amount, type, category, date
- 20 transactions d'exemple
- Mix de revenus (income) et dépenses (expense)
- Différentes catégories : Food, Transport, Entertainment, Shopping, Utilities, Health, Salary, Freelance, Bills

### 2. `test-transactions-french.csv` (Format français)
- Format : virgule comme délimiteur
- Colonnes : description, montant, type, categorie, date
- 10 transactions d'exemple
- Démontre la flexibilité du parser avec différents noms de colonnes

### 3. `test-transactions-semicolon.csv` (Format point-virgule)
- Format : point-virgule comme délimiteur
- Colonnes : merchant, amount, type, category, date
- 6 transactions d'exemple
- Démontre le support des différents délimiteurs

## Format attendu :

Le parser CSV supporte plusieurs formats :

### Colonnes acceptées :
- **Merchant** : `merchant`, `description`, `name` (insensible à la casse)
- **Amount** : `amount`, `value`, `montant` (insensible à la casse)
- **Type** : `type` (valeurs : `income`, `expense`, `in`, `credit`, `revenu`, `dépense`)
- **Category** : `category`, `categorie` (insensible à la casse)
- **Date** : `date` (format : YYYY-MM-DD ou autre format de date valide)

### Délimiteurs supportés :
- Virgule (`,`)
- Point-virgule (`;`)
- Tabulation (`\t`)

### Formats de montant supportés :
- `1500.50`
- `1,500.50` (virgule supprimée)
- `€1500.50` (symbole de devise supprimé)
- `$ 1,500.50` (espaces et symboles supprimés)
- `1500,50` (virgule convertie en point)

## Comment utiliser :

1. Allez sur la page Transactions dans l'application
2. Cliquez sur "Upload CSV"
3. Sélectionnez un des fichiers CSV de test
4. Les transactions seront importées automatiquement

## Notes :

- Les montants doivent être positifs
- Les catégories doivent être parmi : Food, Transport, Entertainment, Shopping, Utilities, Bills, Health, Salary, Freelance, Other
- Si une catégorie n'est pas valide, elle sera automatiquement changée en "Other"
- Si le type n'est pas spécifié, il sera par défaut "Expense"
- Si la date n'est pas valide, la date actuelle sera utilisée

