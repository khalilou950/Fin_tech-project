# 🌍 Support Multi-Langues - Saisie Vocale

## ✅ Langues Supportées

La saisie vocale supporte maintenant **3 langues** :

| Langue | Code | Drapeau | Exemples |
|--------|------|---------|----------|
| **Français** | `fr-FR` | 🇫🇷 | "J'ai acheté du pain avec 50 da" |
| **English** | `en-US` | 🇬🇧 | "I bought bread for 50 da" |
| **العربية (Arabe)** | `ar-SA` | 🇸🇦 | "اشتريت خبز بـ 50 دينار" |

---

## 🎯 Comment Utiliser

### 1. Sélectionner la Langue

Dans la page Transactions, vous verrez 3 boutons de langue au-dessus du bouton microphone :

```
🌍 Langue: [🇫🇷 Français] [🇬🇧 English] [🇸🇦 العربية]
```

Cliquez sur la langue dans laquelle vous souhaitez parler.

### 2. Enregistrer Votre Transaction

1. Cliquez sur le bouton microphone
2. Parlez dans la langue sélectionnée
3. La transcription apparaîtra automatiquement
4. Cliquez sur "Créer la Transaction"

---

## 💬 Exemples par Langue

### 🇫🇷 Français

**Dépenses:**
- "J'ai acheté du pain avec 50 da"
- "Dépense de 500 dinars pour le transport"
- "J'ai payé 300 da pour un sandwich"
- "250 da essence"
- "1500 da facture électricité"

**Revenus:**
- "Revenu de 20000 da salaire"
- "J'ai gagné 5000 dinars freelance"
- "Reçu 30000 da paie du mois"

### 🇬🇧 English

**Expenses:**
- "I bought bread for 50 da"
- "Spent 500 dinars on transport"
- "Paid 300 da for a sandwich"
- "250 da gasoline"
- "1500 da electricity bill"

**Income:**
- "Income of 20000 da salary"
- "Earned 5000 dinars freelance"
- "Received 30000 da monthly paycheck"

### 🇸🇦 العربية (Arabic)

**مصروفات (Dépenses):**
- "اشتريت خبز بـ 50 دينار"
- "مصروف 500 دينار للنقل"
- "دفعت 300 دينار ساندويتش"
- "250 دينار وقود"
- "1500 دينار فاتورة كهرباء"

**دخل (Revenus):**
- "دخل 20000 دينار راتب"
- "استلمت 5000 دينار عمل حر"
- "25000 دينار أجر الشهر"

---

## 🧠 Détection Automatique par Langue

### Mots-clés de Type (Revenu vs Dépense)

| Type | Français | English | العربية |
|------|----------|---------|---------|
| **Revenu** | revenu, salaire, gagné, reçu, gain | income, salary, earned, received, revenue | دخل, راتب, مكافأة, أجر |
| **Dépense** | acheté, dépense, payé, dépensé, coûté | bought, spent, paid, expense, cost | مصروف, اشتريت, دفعت, صرفت |

### Mots-clés de Catégories

#### 🍕 Food / Nourriture / طعام

| Français | English | العربية |
|----------|---------|---------|
| lait, pain, nourriture, restaurant, café | milk, bread, food, restaurant, coffee | حليب, خبز, طعام, مطعم, قهوة |
| pizza, burger, sandwich, fruit, légume | pizza, burger, sandwich, fruit, vegetable | بيتزا, فاكهة, خضار |
| viande, poulet, poisson | meat, chicken, fish | لحم, دجاج, سمك |

#### 🚗 Transport / النقل

| Français | English | العربية |
|----------|---------|---------|
| essence, transport, taxi, bus | gasoline, transport, taxi, bus | وقود, نقل, تاكسي, حافلة |
| métro, train, voiture, carburant | metro, train, car, fuel | مترو, قطار, سيارة, بنزين |

#### 🛍️ Shopping / تسوق

| Français | English | العربية |
|----------|---------|---------|
| vêtement, habit, chaussure | clothing, clothes, shoes | ملابس, أحذية |
| shopping, magasin, achats | shopping, store, purchase | تسوق, متجر, مشتريات |

#### 🎬 Entertainment / ترفيه

| Français | English | العربية |
|----------|---------|---------|
| cinéma, film, jeu, concert | cinema, movie, game, concert | سينما, فيلم, لعبة, حفلة |
| sortie, loisir | entertainment, leisure | ترفيه |

#### ⚡ Utilities / مرافق

| Français | English | العربية |
|----------|---------|---------|
| électricité, eau, gaz | electricity, water, gas | كهرباء, ماء, غاز |
| internet, téléphone | internet, phone | انترنت, هاتف |

#### 📄 Bills / فواتير

| Français | English | العربية |
|----------|---------|---------|
| facture, loyer, assurance | bill, rent, insurance | فاتورة, إيجار, تأمين |

#### 🏥 Health / صحة

| Français | English | العربية |
|----------|---------|---------|
| médecin, pharmacie, médicament | doctor, pharmacy, medicine | طبيب, صيدلية, دواء |
| santé, docteur | health | صحة |

#### 💰 Salary / راتب

| Français | English | العربية |
|----------|---------|---------|
| salaire, paie | salary, wage, paycheck | راتب, أجر |

#### 💼 Freelance / عمل حر

| Français | English | العربية |
|----------|---------|---------|
| freelance, mission, contrat | freelance, gig, contract | عمل حر, مهمة, عقد |

---

## 🔧 Fonctionnalités Techniques

### Web Speech API

Chaque langue utilise le code approprié pour la reconnaissance vocale :

```typescript
- Français : 'fr-FR'
- English  : 'en-US'
- Arabic   : 'ar-SA' (Arabe saoudien)
```

### Support RTL pour l'Arabe

L'interface s'adapte automatiquement pour l'arabe :
- Direction du texte : **RTL** (Right-to-Left)
- Exemples affichés de droite à gauche
- Transcription alignée à droite

### Parser Intelligent Multi-Langues

Le backend analyse le texte vocal et :
1. Détecte les mots-clés dans les 3 langues
2. Extrait le montant avec supports multi-devises
3. Identifie la catégorie par mots-clés multi-langues
4. Génère une description appropriée selon la langue

---

## 📱 Compatibilité

### Reconnaissance Vocale

| Navigateur | Français | English | العربية |
|------------|----------|---------|---------|
| **Chrome** | ✅ Excellent | ✅ Excellent | ✅ Bon |
| **Edge** | ✅ Excellent | ✅ Excellent | ✅ Bon |
| **Safari** | ✅ Bon | ✅ Excellent | ⚠️ Limité |
| **Firefox** | ❌ Non supporté | ❌ Non supporté | ❌ Non supporté |

> **Note:** La qualité de reconnaissance de l'arabe peut varier selon le navigateur et l'accent.

---

## 💡 Conseils d'Utilisation

### Pour de Meilleurs Résultats

1. **Parlez clairement** et pas trop vite
2. **Mentionnez le montant** explicitement avec l'unité (da, dinars, euros)
3. **Utilisez des mots-clés** de catégorie pour une détection automatique précise
4. **Format recommandé:**
   - Français: "J'ai [verbe] [article] avec/pour [montant] [devise]"
   - English: "I [verb] [item] for/with [amount] [currency]"
   - Arabic: "[فعل] [مادة] بـ [مبلغ] [عملة]"

### Exemples Optimaux

✅ **Bon:**
- "J'ai acheté du lait avec 300 da"
- "I paid 50 dinars for bread"
- "دفعت 100 دينار وقود"

⚠️ **Moins Optimal:**
- "Lait trois cents" (montant peu clair)
- "Bought something" (montant manquant)
- "شراء" (information insuffisante)

---

## 🎉 Avantages du Multi-Langues

✅ **Praticité:** Parlez dans votre langue maternelle
✅ **Précision:** Meilleure reconnaissance dans votre langue
✅ **Accessibilité:** Utilisable par des personnes de différentes langues
✅ **Flexibilité:** Changez de langue selon vos besoins

---

## 🔄 Changement de Langue

Vous pouvez changer de langue **à tout moment** :

1. Cliquez sur le bouton de la nouvelle langue
2. Le système réinitialise l'instance de reconnaissance vocale
3. Enregistrez votre transaction dans la nouvelle langue

**Note:** Les exemples affichés changent automatiquement selon la langue sélectionnée.

---

## 🚀 Prochaines Améliorations Possibles

- [ ] Support d'autres variantes arabes (égyptien, marocain, etc.)
- [ ] Dialectes français (suisse, belge, québécois)
- [ ] Autres langues (espagnol, allemand, etc.)
- [ ] Détection automatique de la langue
- [ ] Traduction automatique des descriptions

---

**Testez maintenant dans votre langue préférée ! 🌍🎤**
