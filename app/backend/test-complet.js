/**
 * Script de test complet pour vérifier toutes les fonctionnalités
 * Exécutez avec: node test-complet.js
 */

const BASE_URL = 'http://localhost:5000';
let accessToken = '';
let refreshToken = '';
let userId = '';
let testTransactionId = '';
let testBudgetId = '';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(`📋 ${title}`, 'cyan');
  console.log('='.repeat(60));
}

function logTest(name) {
  log(`\n🧪 ${name}...`, 'blue');
}

function logSuccess(message) {
  log(`  ✅ ${message}`, 'green');
}

function logError(message) {
  log(`  ❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`  ℹ️  ${message}`, 'yellow');
}

// ============================================
// 1. AUTHENTIFICATION
// ============================================

async function testSignup() {
  logTest('1.1 Sign Up');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test User Complete',
        email: `test-${Date.now()}@example.com`,
        password: 'Test123!',
      }),
    });
    const data = await response.json();
    if (data.success) {
      logSuccess('Inscription réussie');
      logSuccess(`Email: ${data.data.user.email}`);
      return true;
    } else {
      logError(`Échec: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Erreur: ${error.message}`);
    return false;
  }
}

async function testSignin() {
  logTest('1.2 Sign In');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@example.com',
        password: 'Demo123!',
      }),
    });
    const data = await response.json();
    if (data.success) {
      accessToken = data.data.accessToken;
      refreshToken = data.data.refreshToken;
      userId = data.data.user._id || data.data.user.id;
      logSuccess('Connexion réussie');
      logSuccess(`Token obtenu: ${accessToken.substring(0, 20)}...`);
      return true;
    } else {
      logError(`Échec: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Erreur: ${error.message}`);
    return false;
  }
}

async function testGetMe() {
  logTest('1.3 Get Me (Session)');
  if (!accessToken) {
    logError('Token manquant');
    return false;
  }
  try {
    const response = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (data.success) {
      logSuccess(`Profil récupéré: ${data.data.user.fullName}`);
      logSuccess(`Email: ${data.data.user.email}`);
      return true;
    } else {
      logError(`Échec: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Erreur: ${error.message}`);
    return false;
  }
}

async function testLogout() {
  logTest('1.4 Logout');
  if (!accessToken) {
    logError('Token manquant');
    return false;
  }
  try {
    const response = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await response.json();
    if (data.success) {
      logSuccess('Déconnexion réussie');
      // Reconnexion pour les tests suivants
      await testSignin();
      return true;
    } else {
      logError(`Échec: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Erreur: ${error.message}`);
    return false;
  }
}

// ============================================
// 2. PARAMÈTRES UTILISATEUR
// ============================================

async function testUpdateEmail() {
  logTest('2.1 Update Email');
  if (!accessToken) return false;
  try {
    const response = await fetch(`${BASE_URL}/api/auth/update-email`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'demo@example.com', // Remettre l'email original
      }),
    });
    const data = await response.json();
    if (data.success) {
      logSuccess('Email mis à jour');
      return true;
    } else {
      logError(`Échec: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Erreur: ${error.message}`);
    return false;
  }
}

async function testUpdatePassword() {
  logTest('2.2 Update Password');
  if (!accessToken) return false;
  try {
    const response = await fetch(`${BASE_URL}/api/auth/update-password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        oldPassword: 'Demo123!',
        newPassword: 'Demo123!', // Remettre le même mot de passe
      }),
    });
    const data = await response.json();
    if (data.success) {
      logSuccess('Mot de passe mis à jour');
      return true;
    } else {
      logError(`Échec: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Erreur: ${error.message}`);
    return false;
  }
}

async function testUpdateCurrency() {
  logTest('2.3 Update Currency');
  if (!accessToken) return false;
  try {
    const currencies = ['DZD', 'USD', 'EUR'];
    for (const currency of currencies) {
      const response = await fetch(`${BASE_URL}/api/settings/currency`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currency }),
      });
      const data = await response.json();
      if (data.success) {
        logSuccess(`Devise changée en ${currency}`);
      }
    }
    return true;
  } catch (error) {
    logError(`Erreur: ${error.message}`);
    return false;
  }
}

async function testUpdateTheme() {
  logTest('2.4 Update Theme');
  if (!accessToken) return false;
  try {
    const themes = ['light', 'dark'];
    for (const theme of themes) {
      const response = await fetch(`${BASE_URL}/api/settings/theme`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme }),
      });
      const data = await response.json();
      if (data.success) {
        logSuccess(`Thème changé en ${theme}`);
      }
    }
    return true;
  } catch (error) {
    logError(`Erreur: ${error.message}`);
    return false;
  }
}

async function testUpdateProfile() {
  logTest('2.5 Update Profile');
  if (!accessToken) return false;
  try {
    const response = await fetch(`${BASE_URL}/api/settings/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'Khalil Fares BENNABI',
      }),
    });
    const data = await response.json();
    if (data.success) {
      logSuccess('Profil mis à jour');
      return true;
    } else {
      logError(`Échec: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Erreur: ${error.message}`);
    return false;
  }
}

// ============================================
// 3. TRANSACTIONS
// ============================================

async function testCreateTransaction() {
  logTest('3.1 Create Transaction');
  if (!accessToken) return false;
  try {
    const response = await fetch(`${BASE_URL}/api/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: new Date().toISOString(),
        merchant: 'Test Merchant Complete',
        category: 'Food',
        amount: 5000,
        type: 'Expense',
        currency: 'DZD',
        source: 'manual',
      }),
    });
    const data = await response.json();
    if (data.success) {
      testTransactionId = data.data.transaction._id || data.data.transaction.id;
      logSuccess('Transaction créée');
      logSuccess(`ID: ${testTransactionId}`);
      return true;
    } else {
      logError(`Échec: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Erreur: ${error.message}`);
    return false;
  }
}

async function testGetTransactions() {
  logTest('3.2 Get Transactions');
  if (!accessToken) return false;
  try {
    const response = await fetch(`${BASE_URL}/api/transactions`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (data.success) {
      logSuccess(`${data.data.transactions.length} transactions récupérées`);
      return true;
    } else {
      logError(`Échec: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Erreur: ${error.message}`);
    return false;
  }
}

async function testFilterTransactions() {
  logTest('3.3 Filter Transactions');
  if (!accessToken) return false;
  try {
    // Test filtre par catégorie
    const catResponse = await fetch(`${BASE_URL}/api/transactions?category=Food`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    const catData = await catResponse.json();
    if (catData.success) {
      logSuccess(`Filtre catégorie: ${catData.data.transactions.length} transactions`);
    }

    // Test filtre par type
    const typeResponse = await fetch(`${BASE_URL}/api/transactions?type=Expense`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    const typeData = await typeResponse.json();
    if (typeData.success) {
      logSuccess(`Filtre type: ${typeData.data.transactions.length} transactions`);
    }

    // Test recherche
    const searchResponse = await fetch(`${BASE_URL}/api/transactions?search=Test`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    const searchData = await searchResponse.json();
    if (searchData.success) {
      logSuccess(`Recherche: ${searchData.data.transactions.length} transactions`);
    }

    return true;
  } catch (error) {
    logError(`Erreur: ${error.message}`);
    return false;
  }
}

async function testUpdateTransaction() {
  logTest('3.4 Update Transaction');
  if (!accessToken || !testTransactionId) return false;
  try {
    const response = await fetch(`${BASE_URL}/api/transactions/${testTransactionId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 6000,
        merchant: 'Updated Merchant',
      }),
    });
    const data = await response.json();
    if (data.success) {
      logSuccess('Transaction mise à jour');
      return true;
    } else {
      logError(`Échec: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Erreur: ${error.message}`);
    return false;
  }
}

async function testDeleteTransaction() {
  logTest('3.5 Delete Transaction');
  if (!accessToken || !testTransactionId) return false;
  try {
    const response = await fetch(`${BASE_URL}/api/transactions/${testTransactionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (data.success) {
      logSuccess('Transaction supprimée');
      testTransactionId = ''; // Reset
      return true;
    } else {
      logError(`Échec: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Erreur: ${error.message}`);
    return false;
  }
}

// ============================================
// 4. BUDGETS
// ============================================

async function testCreateBudget() {
  logTest('4.1 Create Budget');
  if (!accessToken) return false;
  try {
    const response = await fetch(`${BASE_URL}/api/budgets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category: 'Other',
        limit: 15000,
        resetCycle: 'monthly',
      }),
    });
    const data = await response.json();
    if (data.success) {
      testBudgetId = data.data.budget._id || data.data.budget.id;
      logSuccess('Budget créé');
      logSuccess(`ID: ${testBudgetId}`);
      return true;
    } else {
      if (data.message && data.message.includes('already exists')) {
        logInfo('Budget existe déjà (normal)');
        // Récupérer le budget existant
        const budgetsResponse = await fetch(`${BASE_URL}/api/budgets`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        const budgetsData = await budgetsResponse.json();
        if (budgetsData.success && budgetsData.data.budgets.length > 0) {
          const existingBudget = budgetsData.data.budgets.find(b => b.category === 'Other');
          if (existingBudget) {
            testBudgetId = existingBudget._id || existingBudget.id;
          }
        }
        return true;
      }
      logError(`Échec: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Erreur: ${error.message}`);
    return false;
  }
}

async function testGetBudgets() {
  logTest('4.2 Get Budgets');
  if (!accessToken) return false;
  try {
    const response = await fetch(`${BASE_URL}/api/budgets`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (data.success) {
      logSuccess(`${data.data.budgets.length} budgets récupérés`);
      if (data.data.budgets.length > 0) {
        const budget = data.data.budgets[0];
        logSuccess(`Exemple: ${budget.category} - ${budget.spent}/${budget.limit}`);
      }
      return true;
    } else {
      logError(`Échec: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Erreur: ${error.message}`);
    return false;
  }
}

async function testUpdateBudget() {
  logTest('4.3 Update Budget');
  if (!accessToken || !testBudgetId) return false;
  try {
    const response = await fetch(`${BASE_URL}/api/budgets/${testBudgetId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        limit: 20000,
      }),
    });
    const data = await response.json();
    if (data.success) {
      logSuccess('Budget mis à jour');
      return true;
    } else {
      logError(`Échec: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Erreur: ${error.message}`);
    return false;
  }
}

async function testDeleteBudget() {
  logTest('4.4 Delete Budget');
  if (!accessToken || !testBudgetId) return false;
  try {
    const response = await fetch(`${BASE_URL}/api/budgets/${testBudgetId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (data.success) {
      logSuccess('Budget supprimé');
      testBudgetId = ''; // Reset
      return true;
    } else {
      logError(`Échec: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Erreur: ${error.message}`);
    return false;
  }
}

// ============================================
// 5. ANALYTICS
// ============================================

async function testAnalyticsSummary() {
  logTest('5.1 Analytics Summary');
  if (!accessToken) return false;
  try {
    const response = await fetch(`${BASE_URL}/api/analytics/summary`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (data.success) {
      logSuccess(`Revenus: ${data.data.totalIncome}`);
      logSuccess(`Dépenses: ${data.data.totalExpense}`);
      logSuccess(`Solde: ${data.data.balance}`);
      logSuccess(`Catégories: ${Object.keys(data.data.spendingByCategory || {}).length}`);
      logSuccess(`Trends: ${Object.keys(data.data.trends || {}).length} mois`);
      return true;
    } else {
      logError(`Échec: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Erreur: ${error.message}`);
    return false;
  }
}

async function testAnalyticsAlerts() {
  logTest('5.2 Analytics Alerts');
  if (!accessToken) return false;
  try {
    const response = await fetch(`${BASE_URL}/api/analytics/alerts`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (data.success) {
      logSuccess(`${data.data.count} alertes trouvées`);
      if (data.data.alerts && data.data.alerts.length > 0) {
        data.data.alerts.slice(0, 3).forEach(alert => {
          logInfo(`  - ${alert.message}`);
        });
      }
      return true;
    } else {
      logError(`Échec: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Erreur: ${error.message}`);
    return false;
  }
}

async function testAnalyticsForecast() {
  logTest('5.3 Analytics Forecast');
  if (!accessToken) return false;
  try {
    const response = await fetch(`${BASE_URL}/api/analytics/forecast`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (data.success) {
      logSuccess(`${Object.keys(data.data.forecast || {}).length} prévisions`);
      return true;
    } else {
      logError(`Échec: ${data.message}`);
      return false;
    }
  } catch (error) {
    logError(`Erreur: ${error.message}`);
    return false;
  }
}

// ============================================
// MAIN TEST RUNNER
// ============================================

async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  log('🧪 TEST COMPLET - Vérification de Toutes les Fonctionnalités', 'cyan');
  console.log('='.repeat(60));

  // Vérifier que le serveur est accessible
  try {
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    if (!healthData.success) {
      logError('Le serveur n\'est pas accessible!');
      logInfo('Assurez-vous que le serveur est démarré: npm run dev');
      process.exit(1);
    }
    logSuccess('Serveur accessible');
  } catch (error) {
    logError('Le serveur n\'est pas accessible!');
    logInfo('Assurez-vous que le serveur est démarré: npm run dev');
    process.exit(1);
  }

  const results = [];

  // 1. Authentification
  logSection('1. AUTHENTIFICATION & COMPTES UTILISATEURS');
  results.push(await testSignup());
  results.push(await testSignin());
  results.push(await testGetMe());
  results.push(await testLogout());

  // 2. Paramètres Utilisateur
  logSection('2. PARAMÈTRES UTILISATEUR');
  results.push(await testUpdateEmail());
  results.push(await testUpdatePassword());
  results.push(await testUpdateCurrency());
  results.push(await testUpdateTheme());
  results.push(await testUpdateProfile());

  // 3. Transactions
  logSection('3. GESTION DES TRANSACTIONS');
  results.push(await testCreateTransaction());
  results.push(await testGetTransactions());
  results.push(await testFilterTransactions());
  results.push(await testUpdateTransaction());
  results.push(await testDeleteTransaction());

  // 4. Budgets
  logSection('4. BUDGETS INTELLIGENTS');
  results.push(await testCreateBudget());
  results.push(await testGetBudgets());
  results.push(await testUpdateBudget());
  results.push(await testDeleteBudget());

  // 5. Analytics
  logSection('5. ANALYTICS AVANCÉES');
  results.push(await testAnalyticsSummary());
  results.push(await testAnalyticsAlerts());
  results.push(await testAnalyticsForecast());

  // Résumé final
  console.log('\n' + '='.repeat(60));
  log('📊 RÉSUMÉ DES TESTS', 'cyan');
  console.log('='.repeat(60));

  const passed = results.filter(r => r === true).length;
  const failed = results.filter(r => r === false).length;
  const total = results.length;

  logSuccess(`Tests réussis: ${passed}/${total}`);
  if (failed > 0) {
    logError(`Tests échoués: ${failed}/${total}`);
  }

  console.log('\n' + '='.repeat(60));
  if (passed === total) {
    log('\n🎉 TOUTES LES FONCTIONNALITÉS FONCTIONNENT PARFAITEMENT!', 'green');
    log('✅ Backend 100% opérationnel', 'green');
  } else {
    log('\n⚠️  Certaines fonctionnalités nécessitent une attention', 'yellow');
  }
  console.log('='.repeat(60) + '\n');
}

// Exécuter les tests
runAllTests().catch(error => {
  logError(`\nErreur fatale: ${error.message}`);
  process.exit(1);
});

