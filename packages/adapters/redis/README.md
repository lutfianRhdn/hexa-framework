# @hexa/adapter-redis

Redis cache adapter for Hexa Framework.

## Installation

```bash
npm install @hexa/adapter-redis redis
```

## Usage

### Setup Adapter

```typescript
import { RedisAdapter, createRedisAdapter, createRedisCache } from '@hexa/adapter-redis';

const adapter = createRedisAdapter({
  host: 'localhost',
  port: 6379,
  password: 'secret',
  keyPrefix: 'myapp:',
});

await adapter.connect();
```

### Caching

```typescript
const cache = createRedisCache(adapter);

// Set with 1 hour TTL
await cache.set('user:123', { name: 'John' }, 3600);

// Get
const user = await cache.get('user:123');

// Delete
await cache.delete('user:123');

// Check exists
const exists = await cache.exists('user:123');
```

### Session Store

```typescript
import { createSessionStore } from '@hexa/adapter-redis';

const sessionStore = createSessionStore(adapter, {
  prefix: 'session:',
  ttlSeconds: 86400, // 24 hours
});

// Store session
await sessionStore.set('abc123', { userId: 1, role: 'admin' });

// Get session
const session = await sessionStore.get('abc123');

// Destroy session
await sessionStore.destroy('abc123');
```
