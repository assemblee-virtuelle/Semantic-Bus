#!/bin/bash

echo "🔧 Correction des imports restants..."

# Corriger tous les fichiers dans workspaceComponentInitialize
echo "📝 Correction des fichiers workspaceComponentInitialize..."

# googleAuth.js
sed -i "s|require('../../../core/lib/workspace_component_lib')|require('@semantic-bus/core/lib/workspace_component_lib')|g" packages/main/server/workspaceComponentInitialize/googleAuth.js

# upload.js
sed -i "s|require('../../../core/lib/file_lib_scylla')|require('@semantic-bus/core/lib/file_lib_scylla')|g" packages/main/server/workspaceComponentInitialize/upload.js
sed -i "s|require('../../../core/models/file_model_scylla')|require('@semantic-bus/core/models/file_model_scylla')|g" packages/main/server/workspaceComponentInitialize/upload.js
sed -i "s|require('../../../core/dataTraitmentLibrary/file_convertor.js')|require('@semantic-bus/core/dataTraitmentLibrary/file_convertor.js')|g" packages/main/server/workspaceComponentInitialize/upload.js
sed -i "s|require('../../../core/lib/workspace_component_lib')|require('@semantic-bus/core/lib/workspace_component_lib')|g" packages/main/server/workspaceComponentInitialize/upload.js

# httpProvider.js  
sed -i "s|require('../../../core/lib/workspace_component_lib')|require('@semantic-bus/core/lib/workspace_component_lib')|g" packages/main/server/workspaceComponentInitialize/httpProvider.js
sed -i "s|require('../../../core/lib/workspace_lib')|require('@semantic-bus/core/lib/workspace_lib')|g" packages/main/server/workspaceComponentInitialize/httpProvider.js
sed -i "s|require('../../../core/lib/fragment_lib_scylla')|require('@semantic-bus/core/lib/fragment_lib_scylla')|g" packages/main/server/workspaceComponentInitialize/httpProvider.js
sed -i "s|require('../../../core/dataTraitmentLibrary/index.js')|require('@semantic-bus/core/dataTraitmentLibrary/index.js')|g" packages/main/server/workspaceComponentInitialize/httpProvider.js
sed -i "s|require('../../../core/lib/file_lib_scylla')|require('@semantic-bus/core/lib/file_lib_scylla')|g" packages/main/server/workspaceComponentInitialize/httpProvider.js

# cacheNosql.js
sed -i "s|require('../../../core/lib/workspace_component_lib')|require('@semantic-bus/core/lib/workspace_component_lib')|g" packages/main/server/workspaceComponentInitialize/cacheNosql.js
sed -i "s|require('../../../core/lib/cache_lib')|require('@semantic-bus/core/lib/cache_lib')|g" packages/main/server/workspaceComponentInitialize/cacheNosql.js

echo "✅ Correction des imports restants terminée !"

# Vérification
echo "🔍 Imports core restants:"
grep -r "require.*\.\./.*core" packages/ | grep -v node_modules || echo "  ✅ Tous les imports core ont été corrigés !"

echo "🔍 Nouveaux imports @semantic-bus:"
grep -r "@semantic-bus/core" packages/ | wc -l
echo "imports @semantic-bus/core trouvés" 