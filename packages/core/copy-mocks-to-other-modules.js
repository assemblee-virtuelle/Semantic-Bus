#!/usr/bin/env node

/**
 * Script pour copier la configuration des mocks vers les autres modules
 * Cela permet à tous les modules d'utiliser @semantic-bus/core avec les mêmes mocks
 */

const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '__mocks__');
const modulesToUpdate = ['../engine', '../main', '../timer'];

// Configuration des mocks à ajouter aux autres modules
const mockConfig = {
  moduleNameMapper: {
    // Mock des dépendances externes d'infrastructure UNIQUEMENT
    
    // Bases de données (vraie infrastructure externe)
    '^mongoose$': '<rootDir>/../core/__mocks__/mongoose.js',
    '^cassandra-driver$': '<rootDir>/../core/__mocks__/cassandra-driver.js',
    
    // AWS SDK (infrastructure cloud externe)
    '^@aws-sdk/client-dynamodb$': '<rootDir>/../core/__mocks__/@aws-sdk/client-dynamodb.js',
    '^@aws-sdk/lib-dynamodb$': '<rootDir>/../core/__mocks__/@aws-sdk/lib-dynamodb.js',
    
    // Communication réseau (serveurs de mail)
    '^imap$': '<rootDir>/../core/__mocks__/imap.js',
    '^node-imap$': '<rootDir>/../core/__mocks__/node-imap.js',
    
    // OAuth (appels externes vers Google)
    '^passport$': '<rootDir>/../core/__mocks__/passport.js',
    '^passport-google-oauth$': '<rootDir>/../core/__mocks__/passport-google-oauth.js'
    
    // JWT et BCrypt: PAS de mock - librairies purement computationnelles
  }
};

function updateJestConfig(modulePath) {
  const jestConfigPath = path.join(modulePath, 'jest.config.js');
  
  if (!fs.existsSync(jestConfigPath)) {
    console.log(`⚠️  Jest config not found in ${modulePath}, skipping...`);
    return;
  }
  
  try {
    const configContent = fs.readFileSync(jestConfigPath, 'utf8');
    
    // Parse the existing config
    const moduleFunction = new Function('module', 'exports', 'require', configContent);
    const mockModule = { exports: {} };
    moduleFunction(mockModule, mockModule.exports, require);
    const existingConfig = mockModule.exports;
    
    // Merge mock configuration
    existingConfig.moduleNameMapper = {
      ...existingConfig.moduleNameMapper,
      ...mockConfig.moduleNameMapper
    };
    
    // Write back the updated config
    const newConfigContent = `module.exports = ${JSON.stringify(existingConfig, null, 2)};`;
    fs.writeFileSync(jestConfigPath, newConfigContent);
    
    console.log(`✅ Updated Jest config in ${modulePath}`);
  } catch (error) {
    console.error(`❌ Error updating ${modulePath}: ${error.message}`);
  }
}

function main() {
  console.log('🔧 Updating Jest configurations with mock settings...\n');
  
  modulesToUpdate.forEach(moduleDir => {
    const fullPath = path.resolve(__dirname, moduleDir);
    if (fs.existsSync(fullPath)) {
      updateJestConfig(fullPath);
    } else {
      console.log(`⚠️  Module directory ${fullPath} does not exist, skipping...`);
    }
  });
  
  console.log('\n📖 Configuration Documentation:');
  console.log('- Tous les modules peuvent maintenant importer @semantic-bus/core');
  console.log('- Les dépendances externes sont automatiquement mockées');
  console.log('- Voir packages/core/__mocks__/README.md pour plus de détails');
}

if (require.main === module) {
  main();
}

module.exports = { updateJestConfig, mockConfig }; 