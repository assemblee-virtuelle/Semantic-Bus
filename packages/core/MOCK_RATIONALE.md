# Logique des Mocks - @semantic-bus/core

Ce document explique **pourquoi** certaines dépendances sont mockées et d'autres pas.

## 🎯 Principe Fondamental

**Seulement les dépendances qui nécessitent une infrastructure externe sont mockées.**

Une dépendance nécessite un mock si elle :
- Se connecte à un réseau
- Nécessite un serveur/service externe
- Fait des appels I/O vers l'extérieur

## ✅ Dépendances Mockées (Infrastructure Externe)

### 🗄️ Bases de Données
- **`mongoose`** → Se connecte à MongoDB
- **`cassandra-driver`** → Se connecte à Cassandra/Scylla

### ☁️ Services Cloud
- **`@aws-sdk/client-dynamodb`** → Se connecte à AWS DynamoDB
- **`@aws-sdk/lib-dynamodb`** → Se connecte à AWS DynamoDB

**Utilisation dans le code :**
```javascript
// packages/core/db/dynamodb_client.js
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');

// packages/core/db/mongo_client.js  
const mongoose = require('mongoose');

// packages/core/db/scylla_client.js
const cassandra = require('cassandra-driver');
```

### 📧 Communication Réseau
- **`imap`** / **`node-imap`** → Se connecte à des serveurs de mail

### 🔐 OAuth (Appels Externes)
- **`passport`** → Peut faire des appels OAuth externes
- **`passport-google-oauth`** → Fait des appels vers l'API Google

## ❌ Dépendances NON Mockées (Librairies Computationnelles)

### 🔐 Cryptographie Pure
- **`jwt-simple`** → Encode/décode JWT localement, pas d'I/O réseau
- **`bcryptjs`** → Hachage cryptographique local, pas d'I/O réseau

**Pourquoi pas de mock ?**
```javascript
// JWT - juste de la cryptographie
const jwt = require('jwt-simple');
const token = jwt.encode({ user: 'test' }, 'secret'); // ✅ Pas d'I/O

// BCrypt - juste du hachage
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('password', 10); // ✅ Pas d'I/O
```

### 📊 Traitement de Données
- **`csvtojson`**, **`xlsx`**, **`xml2js`** → Traitement de fichiers local
- **`moment`**, **`uuid`** → Utilitaires purs

## 🔍 Comment Déterminer si un Mock est Nécessaire ?

### Questions à se poser :
1. **La librairie se connecte-t-elle à un réseau ?** → Mock nécessaire
2. **A-t-elle besoin d'un serveur externe ?** → Mock nécessaire  
3. **Fait-elle seulement du calcul/traitement local ?** → Pas de mock

### Exemples :

#### ✅ Mock Nécessaire
```javascript
// Se connecte à MongoDB
mongoose.connect('mongodb://localhost:27017/test');

// Se connecte à AWS
const client = new DynamoDBClient({ region: 'us-east-1' });

// Se connecte à un serveur IMAP
const imap = new Imap({ host: 'imap.gmail.com' });
```

#### ❌ Mock Inutile
```javascript
// Juste du hachage local
const hash = bcrypt.hashSync('password', 10);

// Juste de l'encodage local
const token = jwt.encode({ user: 'test' }, 'secret');

// Juste du parsing local
const data = JSON.parse(jsonString);
```

## 🎨 Avantages de cette Approche

1. **Performance** : Les vraies librairies computationnelles sont plus rapides que les mocks
2. **Authenticité** : Les tests utilisent le vrai comportement pour la cryptographie
3. **Simplicité** : Moins de mocks à maintenir
4. **Sécurité** : Les fonctions crypto sont testées avec leur vraie implémentation

## 📝 Résumé

**Mock = Infrastructure externe uniquement**
- Bases de données ✅
- Services cloud ✅  
- Communication réseau ✅
- Cryptographie locale ❌
- Traitement de données local ❌

Cette approche garantit que les tests sont rapides, isolés, mais utilisent les vraies implémentations là où c'est approprié. 