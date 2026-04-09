/**
 * Script de vérification de connexion MongoDB
 * Exécutez avec: node check-mongodb-connection.js
 */

const mongoose = require('mongoose');

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pocketguard-ai';

console.log('🔍 Vérification de la connexion MongoDB...\n');
console.log(`📍 URI: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}\n`);

async function testConnection() {
    try {
        // Options de connexion
        const options = {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4, // Force IPv4
        };

        console.log('⏳ Tentative de connexion...');

        // Connexion avec timeout
        await mongoose.connect(MONGODB_URI, options);

        console.log('✅ Connexion réussie!\n');

        // Informations sur la connexion
        const admin = mongoose.connection.db.admin();
        const info = await admin.serverInfo();

        console.log('📊 Informations du serveur MongoDB:');
        console.log(`   - Version: ${info.version}`);
        console.log(`   - Hôte: ${mongoose.connection.host}`);
        console.log(`   - Port: ${mongoose.connection.port}`);
        console.log(`   - Base de données: ${mongoose.connection.name}`);
        console.log(`   - État: ${mongoose.connection.readyState === 1 ? 'Connecté' : 'Déconnecté'}`);

        // Lister les bases de données
        const databases = await admin.listDatabases();
        console.log(`\n📁 Bases de données disponibles (${databases.databases.length}):`);
        databases.databases.forEach(db => {
            const sizeInMB = (db.sizeOnDisk / (1024 * 1024)).toFixed(2);
            console.log(`   - ${db.name} (${sizeInMB} MB)`);
        });

        console.log('\n✅ MongoDB est prêt à être utilisé!');

    } catch (error) {
        console.error('❌ Erreur de connexion:', error.message);

        if (error.message.includes('ECONNREFUSED')) {
            console.error('\n💡 Solutions:');
            console.error('1. MongoDB n\'est pas démarré. Démarrez-le avec:');
            console.error('   - Windows: net start MongoDB (en tant qu\'administrateur)');
            console.error('   - macOS: brew services start mongodb-community');
            console.error('   - Linux: sudo systemctl start mongod');
            console.error('\n2. Ou utilisez MongoDB manuellement:');
            console.error('   mongod --dbpath C:\\data\\db');
            console.error('\n3. Ou utilisez MongoDB Atlas (cloud gratuit):');
            console.error('   https://www.mongodb.com/cloud/atlas/register');
        } else if (error.message.includes('authentication failed')) {
            console.error('\n💡 Problème d\'authentification:');
            console.error('   - Vérifiez votre nom d\'utilisateur et mot de passe');
            console.error('   - Assurez-vous que l\'utilisateur a les permissions nécessaires');
            console.error('   - Vérifiez que les caractères spéciaux sont échappés dans l\'URI');
        } else if (error.message.includes('ENOTFOUND')) {
            console.error('\n💡 Hôte introuvable:');
            console.error('   - Vérifiez l\'adresse du serveur dans MONGODB_URI');
            console.error('   - Vérifiez votre connexion Internet (pour MongoDB Atlas)');
            console.error('   - Vérifiez que votre IP est whitelistée (pour MongoDB Atlas)');
        }

        console.error('\n📝 URI actuel:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
        console.error('\nℹ️  Consultez MONGODB_FIX.md pour plus d\'aide');

        process.exit(1);
    } finally {
        // Fermer la connexion
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('\n🔌 Connexion fermée');
        }
    }
}

// Exécuter le test
testConnection().catch(error => {
    console.error('❌ Erreur inattendue:', error);
    process.exit(1);
});
