/**
 * Script pour configurer automatiquement le fichier .env
 * Exécutez avec: node setup-env.js
 */

import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');
const templatePath = path.join(__dirname, 'env.template');

// Générer des secrets JWT sécurisés
const jwtSecret = crypto.randomBytes(32).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(32).toString('hex');

// Contenu du fichier .env
const envContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
# MongoDB est installé localement et fonctionne
MONGODB_URI=mongodb://localhost:27017/pocketguard-ai

# JWT Configuration
# Secrets générés automatiquement - SÉCURISÉS
JWT_SECRET=${jwtSecret}
JWT_REFRESH_SECRET=${jwtRefreshSecret}
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# CORS Configuration
FRONTEND_URL=http://localhost:3000
`;

try {
  // Vérifier si .env existe déjà
  if (fs.existsSync(envPath)) {
    console.log('⚠️  Le fichier .env existe déjà.');
    console.log('📝 Mise à jour du fichier .env...');
  } else {
    console.log('📝 Création du fichier .env...');
  }

  // Écrire le fichier .env
  fs.writeFileSync(envPath, envContent, 'utf8');

  console.log('✅ Fichier .env configuré avec succès!');
  console.log('');
  console.log('📋 Configuration:');
  console.log('   - MongoDB: mongodb://localhost:27017/pocketguard-ai');
  console.log('   - Port: 5000');
  console.log('   - JWT Secrets: Générés automatiquement (sécurisés)');
  console.log('');
  console.log('🚀 Prochaines étapes:');
  console.log('   1. npm run dev          - Démarrer le serveur');
  console.log('   2. npm run seed         - Remplir la base de données');
  console.log('   3. npm test             - Tester l\'API');
} catch (error) {
  console.error('❌ Erreur lors de la configuration:', error.message);
  process.exit(1);
}

