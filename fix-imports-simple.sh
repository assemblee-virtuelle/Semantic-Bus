#!/bin/bash

echo "🔧 Correction simple des imports..."

# Correction directe des imports les plus critiques
echo "📝 Correction des imports critiques..."

# 1. Corriger packages/main/server/validations/userValidations.js
sed -i "s|require('../../../core/helpers')|require('@semantic-bus/core/helpers')|g" packages/main/server/validations/userValidations.js

# 2. Corriger packages/main/server/services/security.js
sed -i "s|require('../../../core/lib/auth_lib')|require('@semantic-bus/core/lib/auth_lib')|g" packages/main/server/services/security.js
sed -i "s|require('../../../core/lib/user_lib')|require('@semantic-bus/core/lib/user_lib')|g" packages/main/server/services/security.js

# 3. Corriger packages/main/server/workspaceComponentInitialize/imap.js
sed -i "s|require('../../../core/lib/workspace_component_lib')|require('@semantic-bus/core/lib/workspace_component_lib')|g" packages/main/server/workspaceComponentInitialize/imap.js

# 4. Corriger packages/core/getConfiguration.js
sed -i "s|require('../main/config.json')|require('@semantic-bus/main/config.json')|g" packages/core/getConfiguration.js
sed -i "s|require('../engine/config.json')|require('@semantic-bus/engine/config.json')|g" packages/core/getConfiguration.js
sed -i "s|require('../timer/config.json')|require('@semantic-bus/timer/config.json')|g" packages/core/getConfiguration.js

# 5. Corriger packages/core/lib/auth_lib.js
sed -i "s|require('../../main/config.json')|require('@semantic-bus/main/config.json')|g" packages/core/lib/auth_lib.js

# 6. Corriger packages/core/timerScheduler.js
sed -i 's|require("../timer/config.json")|require("@semantic-bus/timer/config.json")|g' packages/core/timerScheduler.js

echo "✅ Correction terminée !"

# Vérification rapide
echo "🔍 Vérification des corrections:"
grep -r "@semantic-bus" packages/ | head -10 