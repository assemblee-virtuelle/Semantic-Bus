-- Créez le keyspace avec une stratégie de réplication adaptée
CREATE KEYSPACE IF NOT EXISTS mykeyspace 
WITH replication = {
  'class': 'SimpleStrategy',  -- Pour la production, envisagez 'NetworkTopologyStrategy'
  'replication_factor': 1     -- Pour la production, utilisez un facteur de réplication plus élevé
};

-- Créez la table avec les colonnes nécessaires
CREATE TABLE IF NOT EXISTS mykeyspace.fragment (
    id UUID PRIMARY KEY,     -- Identifiant unique pour chaque fragment
    data blob,               -- Données du fragment
    rootFrag UUID,           -- Référence au fragment racine
    originFrag UUID,         -- Référence à l'origine du fragment
    branchFrag UUID,         -- Référence au fragment de branche
    branchOriginFrag UUID,   -- Référence à l'origine de la branche
    garbageTag boolean,      -- Tag pour indiquer si le fragment est marqué comme garbage
    garbageProcess int       -- Indicateur de processus de garbage
);

-- Créez un index secondaire pour faciliter les requêtes sur branchOriginFrag
CREATE INDEX IF NOT EXISTS branchoriginfrag_index 
ON mykeyspace.fragment(branchOriginFrag);