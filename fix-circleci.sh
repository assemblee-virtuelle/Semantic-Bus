#!/bin/bash

# Script pour supprimer CircleCI des status checks GitHub
# Usage: ./fix-circleci.sh YOUR_GITHUB_TOKEN

if [ -z "$1" ]; then
    echo "❌ Usage: $0 YOUR_GITHUB_TOKEN"
    echo "Créez un token sur: https://github.com/settings/tokens"
    echo "Permissions requises: repo, admin:repo_hook"
    exit 1
fi

GITHUB_TOKEN="$1"
REPO="assemblee-virtuelle/Semantic-Bus"
BRANCH="main"

echo "🔍 1. Vérification des règles de protection actuelles..."
CURRENT_PROTECTION=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/$REPO/branches/$BRANCH/protection")

if echo "$CURRENT_PROTECTION" | grep -q "message.*Not Found"; then
    echo "ℹ️  Aucune règle de protection sur la branche $BRANCH"
    exit 0
fi

if echo "$CURRENT_PROTECTION" | grep -q "Bad credentials"; then
    echo "❌ Token invalide ou permissions insuffisantes"
    exit 1
fi

echo "✅ Règles de protection trouvées"

# Extraire les status checks actuels (sans CircleCI)
echo "🔧 2. Suppression de CircleCI des status checks..."

# Récupérer la configuration actuelle sans CircleCI
FILTERED_CHECKS=$(echo "$CURRENT_PROTECTION" | jq -r '.required_status_checks.contexts[]' 2>/dev/null | grep -v "ci/circleci" | jq -R . | jq -s .)

if [ "$FILTERED_CHECKS" = "null" ] || [ "$FILTERED_CHECKS" = "[]" ]; then
    echo "ℹ️  Aucun status check trouvé ou CircleCI déjà supprimé"
    exit 0
fi

# Mettre à jour les status checks
UPDATE_PAYLOAD=$(cat <<EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": $FILTERED_CHECKS
  },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null
}
EOF
)

echo "📝 Nouvelle configuration:"
echo "$UPDATE_PAYLOAD" | jq .

RESPONSE=$(curl -s -X PUT \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    -H "Content-Type: application/json" \
    -d "$UPDATE_PAYLOAD" \
    "https://api.github.com/repos/$REPO/branches/$BRANCH/protection")

if echo "$RESPONSE" | grep -q '"required_status_checks"'; then
    echo "✅ Status checks mis à jour avec succès!"
    echo "🎉 CircleCI supprimé des contrôles requis"
else
    echo "❌ Erreur lors de la mise à jour:"
    echo "$RESPONSE" | jq .
fi

echo ""
echo "🔍 3. Vérification des webhooks CircleCI..."
WEBHOOKS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$REPO/hooks")

CIRCLECI_HOOKS=$(echo "$WEBHOOKS" | jq '.[] | select(.config.url | contains("circleci"))')

if [ "$CIRCLECI_HOOKS" != "" ]; then
    echo "🗑️  Webhooks CircleCI trouvés, suppression..."
    echo "$WEBHOOKS" | jq '.[] | select(.config.url | contains("circleci")) | .id' | while read -r hook_id; do
        echo "Suppression du webhook $hook_id..."
        curl -s -X DELETE \
            -H "Authorization: token $GITHUB_TOKEN" \
            "https://api.github.com/repos/$REPO/hooks/$hook_id"
        echo "✅ Webhook $hook_id supprimé"
    done
else
    echo "ℹ️  Aucun webhook CircleCI trouvé"
fi

echo ""
echo "🎯 Configuration terminée!"
echo "Testez maintenant avec un nouveau commit pour vérifier que CircleCI ne se déclenche plus." 