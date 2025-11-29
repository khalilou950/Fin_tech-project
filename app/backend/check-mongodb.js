/**
 * Script pour vérifier si MongoDB est installé et accessible
 * Exécutez avec: node check-mongodb.js
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🔍 Vérification de MongoDB...\n');

// Vérifier si mongod est installé
async function checkMongoDBInstalled() {
  try {
    const { stdout, stderr } = await execAsync('mongod --version');
    if (stdout || stderr) {
      console.log('✅ MongoDB est installé:');
      console.log(stdout || stderr);
      return true;
    }
  } catch (error) {
    return false;
  }
}

// Vérifier si mongosh est installé
async function checkMongoSHInstalled() {
  try {
    const { stdout, stderr } = await execAsync('mongosh --version');
    if (stdout || stderr) {
      console.log('✅ MongoDB Shell (mongosh) est installé:');
      console.log(stdout || stderr);
      return true;
    }
  } catch (error) {
    return false;
  }
}

// Vérifier si MongoDB est en cours d'exécution
async function checkMongoDBRunning() {
  try {
    // Essayer de se connecter à MongoDB
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    // Test de connexion (timeout de 2 secondes)
    const testConnection = new Promise((resolve, reject) => {
      const child = exec('mongosh --eval "db.adminCommand(\'ping\')" --quiet', {
        timeout: 2000
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve(true);
        } else {
          reject(false);
        }
      });
      
      child.on('error', () => {
        reject(false);
      });
    });

    await testConnection;
    console.log('✅ MongoDB est en cours d\'exécution');
    return true;
  } catch (error) {
    console.log('❌ MongoDB n\'est pas en cours d\'exécution');
    return false;
  }
}

// Vérifier via le port 27017
async function checkPort27017() {
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    // Sur Windows
    if (process.platform === 'win32') {
      try {
        const { stdout } = await execAsync('netstat -an | findstr :27017');
        if (stdout.includes('27017')) {
          console.log('✅ Port 27017 est ouvert (MongoDB probablement en cours d\'exécution)');
          return true;
        }
      } catch (error) {
        // Ignorer l'erreur
      }
    } else {
      // Sur macOS/Linux
      try {
        const { stdout } = await execAsync('lsof -i :27017 || netstat -an | grep 27017');
        if (stdout) {
          console.log('✅ Port 27017 est ouvert (MongoDB probablement en cours d\'exécution)');
          return true;
        }
      } catch (error) {
        // Ignorer l'erreur
      }
    }
    
    console.log('⚠️  Port 27017 n\'est pas ouvert');
    return false;
  } catch (error) {
    return false;
  }
}

// Fonction principale
async function main() {
  console.log('='.repeat(50));
  console.log('📋 État de MongoDB');
  console.log('='.repeat(50));
  
  const installed = await checkMongoDBInstalled();
  if (!installed) {
    console.log('❌ MongoDB n\'est pas installé');
    console.log('\n📥 Pour installer MongoDB:');
    console.log('   Windows: https://www.mongodb.com/try/download/community');
    console.log('   macOS: brew install mongodb-community');
    console.log('   Linux: sudo apt-get install mongodb-org');
    console.log('\n📚 Ou utilisez MongoDB Atlas (cloud gratuit):');
    console.log('   https://www.mongodb.com/cloud/atlas/register');
  } else {
    console.log('');
  }
  
  const shellInstalled = await checkMongoSHInstalled();
  if (!shellInstalled && installed) {
    console.log('⚠️  MongoDB Shell (mongosh) n\'est pas installé');
    console.log('   Téléchargez-le depuis: https://www.mongodb.com/try/download/shell');
  } else if (!shellInstalled) {
    console.log('');
  }
  
  console.log('');
  const running = await checkMongoDBRunning();
  if (!running) {
    await checkPort27017();
    console.log('\n🚀 Pour démarrer MongoDB:');
    if (process.platform === 'win32') {
      console.log('   net start MongoDB');
    } else if (process.platform === 'darwin') {
      console.log('   brew services start mongodb-community');
    } else {
      console.log('   sudo systemctl start mongod');
    }
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (installed && running) {
    console.log('✅ MongoDB est prêt à être utilisé!');
    console.log('\n📝 Prochaines étapes:');
    console.log('   1. Configurez MONGODB_URI dans .env');
    console.log('   2. Démarrez le serveur: npm run dev');
    console.log('   3. Remplissez la base: npm run seed');
  } else if (installed && !running) {
    console.log('⚠️  MongoDB est installé mais pas démarré');
    console.log('   Démarrez MongoDB avant de lancer le serveur backend');
  } else {
    console.log('❌ MongoDB n\'est pas installé ou configuré');
    console.log('   Consultez MONGODB_SETUP.md pour les instructions détaillées');
  }
  
  console.log('='.repeat(50));
}

main().catch(console.error);



