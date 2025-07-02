#!/bin/bash

echo "🔧 Correction des imports core de manière sécurisée..."

# Fonction pour remplacer de manière sécurisée
safe_replace() {
    local file="$1"
    local old_pattern="$2"
    local new_pattern="$3"
    
    # Vérifier si le fichier contient le pattern
    if grep -q "$old_pattern" "$file"; then
        echo "  📝 Correction: $file"
        sed -i "s|$old_pattern|$new_pattern|g" "$file"
    fi
}

# 1. Corriger les imports depuis main vers core
echo "📂 Correction des imports dans packages/main..."
find packages/main -name "*.js" -type f | while read -r file; do
    safe_replace "$file" "require('../../core" "require('@semantic-bus/core"
    safe_replace "$file" 'require("../../core' 'require("@semantic-bus/core'
    safe_replace "$file" "require('../../../core" "require('@semantic-bus/core"
    safe_replace "$file" 'require("../../../core' 'require("@semantic-bus/core'
done

# 2. Corriger les imports depuis engine vers core
echo "📂 Correction des imports dans packages/engine..."
find packages/engine -name "*.js" -type f | while read -r file; do
    safe_replace "$file" "require('../../core" "require('@semantic-bus/core"
    safe_replace "$file" 'require("../../core' 'require("@semantic-bus/core'
    safe_replace "$file" "require('../../../core" "require('@semantic-bus/core"
    safe_replace "$file" 'require("../../../core' 'require("@semantic-bus/core'
done

# 3. Corriger les imports depuis timer vers core
echo "📂 Correction des imports dans packages/timer..."
find packages/timer -name "*.js" -type f | while read -r file; do
    safe_replace "$file" "require('../../core" "require('@semantic-bus/core"
    safe_replace "$file" 'require("../../core' 'require("@semantic-bus/core'
    safe_replace "$file" "require('../../../core" "require('@semantic-bus/core"
    safe_replace "$file" 'require("../../../core' 'require("@semantic-bus/core'
done

# 4. Corriger les imports problématiques dans core lui-même
echo "📂 Correction des imports problématiques dans packages/core..."

# Corriger getConfiguration.js qui importe depuis d'autres packages
safe_replace "packages/core/getConfiguration.js" "require('../main/config.json')" "require('@semantic-bus/main/config.json')"
safe_replace "packages/core/getConfiguration.js" "require('../engine/config.json')" "require('@semantic-bus/engine/config.json')"
safe_replace "packages/core/getConfiguration.js" "require('../timer/config.json')" "require('@semantic-bus/timer/config.json')"

# Corriger auth_lib.js qui importe config depuis main
safe_replace "packages/core/lib/auth_lib.js" "require('../../main/config.json')" "require('@semantic-bus/main/config.json')"

# Corriger timerScheduler.js qui importe depuis timer
safe_replace "packages/core/timerScheduler.js" 'require("../timer/config.json")' 'require("@semantic-bus/timer/config.json")'

echo "✅ Correction des imports terminée !"
echo "📊 Vérification des imports restants..."

# Vérifier s'il reste des imports problématiques
echo "🔍 Imports vers core restants:"
grep -r "require.*\.\./.*core" packages/ || echo "  ✅ Aucun import problématique trouvé"

echo "🔍 Imports cross-package restants:"
grep -r "require.*\.\./\.\./\.\.*/" packages/ || echo "  ✅ Aucun import cross-package problématique trouvé" 