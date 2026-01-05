# Semantic-Bus Configuration

> Complete reference for all configuration options

---

## 📁 Configuration Files

| File | Purpose | Versioned |
|------|---------|-----------|
| `config.json` | Default configuration | ✅ Yes |
| `config.local.json` | Local overrides | ❌ No (gitignored) |

### Setup

```bash
cp config.json config.local.json
```

Edit `config.local.json` for your environment. Never modify `config.json` directly.

---

## 🔧 Configuration Sections

### Database Connections

```json
{
  "mlabDB": "mongodb://mongodb:27017/admin",
  "mongodbFlowDB": "mongodb://admin:adminpassword@mongodb_flow:27018/admin"
}
```

| Key | Description | Default |
|-----|-------------|---------|
| `mlabDB` | Primary MongoDB connection string | `mongodb://mongodb:27017/admin` |
| `mongodbFlowDB` | Secondary MongoDB for flow data | `mongodb://admin:adminpassword@mongodb_flow:27018/admin` |

---

### Message Queue (AMQP)

```json
{
  "socketServer": "amqp://rabbitmq:5672",
  "socketClient": "ws://localhost:15674/ws/",
  "amqpHost": "devLocal"
}
```

| Key | Description | Default |
|-----|-------------|---------|
| `socketServer` | RabbitMQ AMQP connection | `amqp://rabbitmq:5672` |
| `socketClient` | WebSocket connection for client | `ws://localhost:15674/ws/` |
| `amqpHost` | Virtual host name | `devLocal` |

---

### Authentication

```json
{
  "secret": "secret",
  "googleAuth": {
    "callbackURL": "/auth/",
    "clientID": "",
    "clientSecret": ""
  }
}
```

| Key | Description |
|-----|-------------|
| `secret` | JWT signing secret (change in production!) |
| `googleAuth.callbackURL` | OAuth callback path |
| `googleAuth.clientID` | Google OAuth client ID |
| `googleAuth.clientSecret` | Google OAuth client secret |

⚠️ **Security**: Always use strong secrets in production!

---

### Engine Configuration

```json
{
  "engineUrl": "http://engine:92/engine"
}
```

| Key | Description | Default |
|-----|-------------|---------|
| `engineUrl` | Internal URL to reach engine service | `http://engine:92/engine` |

---

### Timer Service

```json
{
  "timer": {
    "port": 8081,
    "secret": "secret",
    "target": "http://localhost:8080"
  }
}
```

| Key | Description | Default |
|-----|-------------|---------|
| `timer.port` | Timer service port | `8081` |
| `timer.secret` | Timer authentication secret | `secret` |
| `timer.target` | Target URL for timer callbacks | `http://localhost:8080` |

---

### Email (SMTP)

```json
{
  "smtp": {
    "host": "",
    "port": 587,
    "debug": true,
    "auth": {
      "user": "",
      "pass": ""
    }
  }
}
```

| Key | Description | Default |
|-----|-------------|---------|
| `smtp.host` | SMTP server hostname | (empty) |
| `smtp.port` | SMTP server port | `587` |
| `smtp.debug` | Enable debug logging | `true` |
| `smtp.auth.user` | SMTP username | (empty) |
| `smtp.auth.pass` | SMTP password | (empty) |

---

### Payment (Stripe)

```json
{
  "pk_stripe": null,
  "secret_stripe_private": null,
  "secret_stripe_public": null
}
```

| Key | Description |
|-----|-------------|
| `pk_stripe` | Stripe public key |
| `secret_stripe_private` | Stripe private secret |
| `secret_stripe_public` | Stripe public secret |

---

### Component Pricing

```json
{
  "components_information": {
    "filter": { "price": 40 },
    "objectTransformer": { "price": 80 },
    "googleGeoLocaliser": { "price": 20, "record_price": 10 }
  }
}
```

Each component can have:
- `price`: Base execution cost in credits
- `record_price`: Additional cost per record (for some components)

---

### Private Scripts

```json
{
  "privateScript": []
}
```

Array of private script identifiers for restricted components.

---

## 🌍 Environment Variables

These override config file values:

| Variable | Description |
|----------|-------------|
| `APP_PORT` | Application port (main: 80, engine: 8080) |
| `CONFIG_URL` | External URL to fetch configuration |
| `NODE_ENV` | Environment mode (development/production) |

---

## 🐳 Docker Configuration

### docker-compose.yaml Services

| Service | Port | Environment |
|---------|------|-------------|
| main | 80 | `APP_PORT=80` |
| engine | 8080 | `APP_PORT=8080` |
| mongodb | 27017 | - |
| rabbitmq | 5672, 15672 | - |
| scylla | 9042 | - |

### Volume Mounts

```yaml
volumes:
  - ./config.local.json:/app/config.json:ro
  - ./uploads:/app/uploads
```

---

## 📋 Package-Specific Configs

Each package has its own `config.json`:

| Package | Path |
|---------|------|
| Main | `packages/main/config.json` |
| Engine | `packages/engine/config.json` |
| Timer | `packages/timer/config.json` |

These inherit from root `config.json` and can override specific values.

---

## ✅ Configuration Checklist

### Development

- [ ] Copy `config.json` to `config.local.json`
- [ ] Verify MongoDB connection string
- [ ] Verify RabbitMQ connection string
- [ ] Set `secret` to a test value

### Production

- [ ] Set strong `secret` value
- [ ] Configure `googleAuth` credentials
- [ ] Configure `smtp` for email notifications
- [ ] Configure `stripe` for payments
- [ ] Update all connection strings for production hosts
- [ ] Set `NODE_ENV=production`

