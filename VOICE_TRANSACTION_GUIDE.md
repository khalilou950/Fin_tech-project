# 🎤 Saisie Vocale pour Transactions

## ✅ Fonctionnalité Ajoutée

Vous pouvez maintenant ajouter des transactions **simplement en parlant** ! Cette fonctionnalité utilise la reconnaissance vocale pour créer automatiquement des transactions à partir de vos commandes vocales en français.

## 🎯 Comment Utiliser

### 1. Accédez à la Page Transactions
Allez sur la page **Transactions** de votre application Finovia.

### 2. Trouvez la Section Vocale
Vous verrez une nouvelle carte **"Ajouter une Transaction par Vocal"** avec un bouton micro violet/rose.

### 3. Enregistrez Votre Commande
1. **Cliquez sur le bouton microphone** 🎤
2. **Parlez clairement** votre transaction (exemple: "J'ai acheté du pain avec 50 da")
3. **La transcription apparaît** en temps réel
4. **Cliquez sur "Créer la Transaction"** pour valider

### 4. Vérifiez votre Transaction
La transaction sera automatiquement créée et apparaîtra dans votre liste !

---

## 💬 Exemples de Commandes Vocales

### Dépenses

| Ce que vous dites | Résultat |
|-------------------|----------|
| "J'ai acheté du pain avec 50 da" | Dépense: Pain, 50 DZD, Catégorie: Food |
| "Dépense de 500 dinars pour le transport" | Dépense: Transport, 500 DZD, Catégorie: Transport |
| "250 da essence" | Dépense: Essence, 250 DZD, Catégorie: Transport |
| "J'ai payé 300 da pour un sandwich" | Dépense: Sandwich, 300 DZD, Catégorie: Food |
| "1500 da facture électricité" | Dépense: Facture électricité, 1500 DZD, Catégorie: Utilities |

### Revenus

| Ce que vous dites | Résultat |
|-------------------|----------|
| "Revenu de 20000 da salaire" | Revenu: Salaire, 20000 DZD, Catégorie: Salary |
| "J'ai gagné 5000 dinars freelance" | Revenu: Freelance, 5000 DZD, Catégorie: Freelance |
| "Reçu 30000 da paie du mois" | Revenu: Paie du mois, 30000 DZD, Catégorie: Salary |

---

## 🧠 Reconnaissance Intelligente

Le système analyse votre phrase pour extraire automatiquement :

### 1. Le Montant
Détecte les nombres avec diverses unités :
- `300`, `300 da`, `300da`, `300 dinars`, `300 DZD`
- `50 euros`, `50€`, `50 EUR`
- `100 dollars`, `100$`, `100 USD`

### 2. La Description
Extrait le nom de l'article ou du service :
- "pain", "lait", "essence", "facture", etc.
- Si aucune description n'est trouvée : "Achat vocal" par défaut

### 3. La Catégorie (Automatique)
Basée sur des mots-clés dans votre phrase :

| Catégorie | Mots-clés détectés |
|-----------|-------------------|
| **Food** | lait, pain, nourriture, restaurant, café, pizza, burger, fruit, légume, viande, poulet, poisson |
| **Transport** | essence, transport, taxi, bus, métro, train, voiture, carburant |
| **Shopping** | vêtement, habit, chaussure, shopping, magasin |
| **Entertainment** | cinéma, film, jeu, concert, sortie, loisir |
| **Utilities** | électricité, eau, gaz, internet, téléphone |
| **Bills** | facture, loyer, assurance |
| **Health** | médecin, pharmacie, médicament, santé, docteur |
| **Salary** | salaire, paie |
| **Freelance** | freelance, mission, contrat |
| **Other** | (par défaut si aucune catégorie détectée) |

### 4. Le Type (Revenu ou Dépense)
Détecté automatiquement :
- **Dépense** : "acheté", "dépense", "payé", "dépensé", "coûté"
- **Revenu** : "revenu", "salaire", "gagné", "reçu", "income"

---

## 🌐 Compatibilité Navigateur

La saisie vocale utilise l'**API Web Speech** du navigateur.

### ✅ Navigateurs Supportés
- **Chrome** (Desktop & Mobile) - ⭐ Recommandé
- **Microsoft Edge** - ⭐ Recommandé
- **Safari** (macOS & iOS)
- **Samsung Internet**

### ❌ Non Supporté
- Firefox (l'API Web Speech n'est pas encore supportée)
- Anciens navigateurs

**Note:** Si votre navigateur ne supporte pas la fonctionnalité, un message vous sera affiché.

---

## 🔒 Sécurité & Confidentialité

- ✅ **Reconnaissance locale** : La reconnaissance vocale se fait dans votre navigateur
- ✅ **Authentification requise** : Seuls les utilisateurs connectés peuvent créer des transactions
- ✅ **Pas d'enregistrement audio** : Seul le texte transcrit est envoyé au serveur
- ✅ **Permissions microphone** : Le navigateur vous demandera d'autoriser l'accès au micro

---

## 🛠️ Architecture Technique

### Backend

**Fichier:** `app/api/transactions/create-from-voice/route.ts`

**Fonctionnalités:**
- ✅ Authentification avec `authMiddleware`
- ✅ Parsing intelligent du texte vocal en français
- ✅ Extraction du montant, devise, description, catégorie
- ✅ Création de la transaction dans MongoDB
- ✅ Mise à jour automatique des budgets

**Exemple de requête:**
```typescript
POST /api/transactions/create-from-voice
{
  "voiceText": "j'ai acheté du pain avec 50 da"
}
```

**Exemple de réponse:**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "_id": "...",
      "merchant": "Pain",
      "amount": 50,
      "currency": "DZD",
      "category": "Food",
      "type": "Expense",
      "source": "voice"
    },
    "parsedData": { ... },
    "originalText": "j'ai acheté du pain avec 50 da"
  }
}
```

### Frontend

**Fichier:** `components/voice-transaction-input.tsx`

**Fonctionnalités:**
- ✅ Interface utilisateur intuitive avec bouton microphone
- ✅ Web Speech API pour reconnaissance vocale en français (`fr-FR`)
- ✅ Transcription en temps réel
- ✅ Gestion des erreurs (pas de parole, permission refusée, etc.)
- ✅ Design moderne avec gradient violet/rose
- ✅ Animations et feedback visuel

**Composant:**
```tsx
<VoiceTransactionInput onTransactionCreated={loadTransactions} />
```

---

## 🎨 Interface Utilisateur

### États Visuels

1. **État Initial**
   - Bouton microphone violet
   - Texte: "⚪ Appuyez pour commencer"

2. **En Écoute**
   - Bouton microphone rouge avec animation pulse
   - Texte: "🔴 Enregistrement en cours..."

3. **Transcription Affichée**
   - Zone de texte avec la transcription
   - Bouton "Créer la Transaction" visible

4. **Création en Cours**
   - Spinner d'attente
   - Texte: "Création en cours..."

5. **Succès**
   - Toast de confirmation
   - Message: "✅ Transaction créée ! Pain - 50 DZD"

---

## 🐛 Dépannage

### "Permission refusée"
**Problème:** Le navigateur bloque l'accès au microphone.
**Solution:** 
1. Cliquez sur l'icône de cadenas dans la barre d'adresse
2. Autorisez l'accès au microphone
3. Rafraîchissez la page

### "Aucune parole détectée"
**Problème:** Le système n'a pas entendu votre voix.
**Solution:**
1. Vérifiez que votre microphone fonctionne
2. Parlez plus fort et clairement
3. Réessayez

### "Could not extract a valid amount"
**Problème:** Le montant n'a pas pu être détecté dans votre phrase.
**Solution:**
1. Assurez-vous de mentionner un montant
2. Utilisez un format clair: "300 da", "50 dinars"
3. Exemples: ✅ "50 da" | ❌ "un peu d'argent"

### La catégorie est "Other"
**Problème:** Le système n'a pas reconnu la catégorie.
**Solution:**
1. Utilisez des mots-clés précis (voir tableau des catégories ci-dessus)
2. Exemple: Dites "essence" au lieu de "carburant pour la voiture"
3. Vous pouvez modifier manuellement la catégorie après création

---

## 📈 Améliorations Futures

Fonctionnalités potentielles à ajouter :

- [ ] Support de différentes langues (arabe, anglais)
- [ ] Édition de transactions existantes par vocal
- [ ] Commandes vocales pour les budgets
- [ ] Statistiques vocales ("combien j'ai dépensé ce mois?")
- [ ] Reconnaissance de devises multiples dans une phrase
- [ ] Historique des commandes vocales
- [ ] Correction manuelle avant validation

---

## 🎉 Conclusion

La saisie vocale rend Finovia encore plus pratique et rapide à utiliser ! Plus besoin de taper, **parlez simplement** et vos transactions seront enregistrées automatiquement.

**Essayez maintenant :**
1. Allez sur la page Transactions
2. Cliquez sur le micro
3. Dites : "J'ai acheté du pain avec 50 da"
4. Validez !

**Bon usage ! 🎤💰**
