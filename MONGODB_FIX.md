# 🔧 Solution à l'Erreur MongoDB: ECONNREFUSED ::1:27017

## ✅ Modifications Effectuées

J'ai corrigé le fichier `lib/db.ts` pour résoudre l'erreur de connexion MongoDB. Les changements incluent:

1. **Force l'utilisation d'IPv4** : Remplacé `localhost` par `127.0.0.1` pour éviter les problèmes IPv6
2. **Ajout de l'option `family: 4`** : Force explicitement la connexion IPv4
3. **Messages d'erreur améliorés** : Affiche des solutions claires en cas d'erreur
4. **Timeout optimisé** : Réduit le timeout à 5 secondes pour une détection rapide des erreurs

## 📋 Étapes à Suivre

### Étape 1: Créer le fichier `.env.local`

Créez un fichier `.env.local` à la racine de votre projet avec ce contenu:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://127.0.0.1:27017/pocketguard-ai

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Node Environment
NODE_ENV=development
```

> **Note**: Le fichier `.env.local` est gitignore par défaut (sécurité).

### Étape 2: Vérifier que MongoDB est Installé et Démarré

#### Sur Windows:

1. **Vérifier si MongoDB est installé:**
   ```powershell
   mongod --version
   ```

2. **Démarrer MongoDB (en tant qu'administrateur):**
   ```powershell
   net start MongoDB
   ```

   Si cette commande échoue:
   ```powershell
   # Créer le dossier de données si nécessaire
   mkdir C:\data\db
   
   # Démarrer MongoDB manuellement
   mongod --dbpath C:\data\db
   ```

#### Sur macOS:

```bash
# Démarrer MongoDB
brew services start mongodb-community

# Ou manuellement
mongod --config /usr/local/etc/mongod.conf
```

#### Sur Linux:

```bash
# Démarrer MongoDB
sudo systemctl start mongod

# Vérifier le statut
sudo systemctl status mongod
```

### Étape 3: Alternative - Utiliser MongoDB Atlas (Cloud - Gratuit)

Si vous ne voulez pas installer MongoDB localement:

1. **Créez un compte gratuit sur MongoDB Atlas:**
   - Visitez: https://www.mongodb.com/cloud/atlas/register

2. **Créez un cluster gratuit (M0)**

3. **Configurez l'accès:**
   - Créez un utilisateur de base de données
   - Whitelist votre adresse IP (ou 0.0.0.0/0 pour développement)

4. **Copiez votre connection string** et mettez-le dans `.env.local`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pocketguard-ai?retryWrites=true&w=majority
   ```

### Étape 4: Tester la Connexion

1. **Redémarrez votre application:**
   ```bash
   npm run dev
   ```

2. **Essayez de vous inscrire:**
   - Allez sur la page d'inscription
   - Entrez vos informations
   - Vous devriez voir dans la console: `✅ Connected to MongoDB successfully`

## 🐛 Si Vous Avez Toujours des Erreurs

### Erreur: "MongoDB n'est pas reconnu comme commande"

MongoDB n'est pas installé. Téléchargez-le depuis:
- Windows: https://www.mongodb.com/try/download/community

### Erreur: "net start MongoDB - Le service spécifié n'existe pas"

MongoDB n'est pas installé comme service Windows. Options:
1. Installer MongoDB Community Edition avec l'option "Install as Service"
2. Démarrer manuellement: `mongod --dbpath C:\data\db`
3. Utiliser MongoDB Atlas (cloud)

### Erreur: "Authentication failed"

Si vous utilisez MongoDB Atlas:
- Vérifiez que le nom d'utilisateur et mot de passe sont corrects
- Assurez-vous d'avoir échappé les caractères spéciaux dans le mot de passe
- Exemple: `p@ssw0rd` devient `p%40ssw0rd` dans l'URI

### Port 27017 déjà utilisé

```bash
# Windows (en tant qu'administrateur)
netstat -ano | findstr :27017
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :27017
kill -9 <PID>
```

## 📚 Ressources Utiles

- [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)

---

**Résumé**: L'erreur était causée par Node.js qui essayait de se connecter via IPv6 (::1) au lieu d'IPv4 (127.0.0.1). La solution force l'utilisation d'IPv4 et améliore la gestion des erreurs.
