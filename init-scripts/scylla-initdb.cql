-- Créez le keyspace avec une stratégie de réplication adaptée
CREATE KEYSPACE IF NOT EXISTS mykeyspace 
WITH replication = {
  'class': 'SimpleStrategy',  -- Pour la production, envisagez 'NetworkTopologyStrategy'
  'replication_factor': 1     -- Pour la production, utilisez un facteur de réplication plus élevé
};

-- Créez la table avec uniquement la colonne id si elle n'existe pas
CREATE TABLE IF NOT EXISTS mykeyspace.fragment (
    id UUID PRIMARY KEY     -- Identifiant unique pour chaque fragment
);

-- Mise à jour de la structure de la table si elle existe
ALTER TABLE mykeyspace.fragment ADD data blob; 
ALTER TABLE mykeyspace.fragment ADD rootFrag UUID;  
ALTER TABLE mykeyspace.fragment ADD originFrag UUID;  
ALTER TABLE mykeyspace.fragment ADD branchFrag UUID; 
ALTER TABLE mykeyspace.fragment ADD branchOriginFrag UUID; 
ALTER TABLE mykeyspace.fragment ADD garbageTag boolean;  
ALTER TABLE mykeyspace.fragment ADD garbageProcess int;  
ALTER TABLE mykeyspace.fragment ADD indexArray int;  
ALTER TABLE mykeyspace.fragment ADD maxindexArray int;

-- Créez un index secondaire pour faciliter les requêtes sur branchOriginFrag
CREATE INDEX IF NOT EXISTS branchoriginfrag_index 
ON mykeyspace.fragment(branchOriginFrag);

CREATE INDEX IF NOT EXISTS originfrag_index 
ON mykeyspace.fragment(originFrag);

CREATE INDEX IF NOT EXISTS garbagetag_index 
ON mykeyspace.fragment(garbageTag);

CREATE INDEX IF NOT EXISTS garbageProcess_index 
ON mykeyspace.fragment(garbageProcess);

-- Créez la table pour le schéma de fichier
CREATE TABLE IF NOT EXISTS mykeyspace.file (
    id UUID PRIMARY KEY     -- Identifiant unique pour chaque fichier
);

-- Ajoutez les colonnes à la table file
ALTER TABLE mykeyspace.file ADD binary blob; 
ALTER TABLE mykeyspace.file ADD frag UUID; 
ALTER TABLE mykeyspace.file ADD filename text;
ALTER TABLE mykeyspace.file ADD cacheId text;
ALTER TABLE mykeyspace.file ADD processId text;

CREATE INDEX IF NOT EXISTS cacheid_index 
ON mykeyspace.file(cacheId);

CREATE INDEX IF NOT EXISTS processid_index 
ON mykeyspace.file(processId);



