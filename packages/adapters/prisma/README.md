# @hexa/adapter-prisma

Prisma database adapter for Hexa Framework.

## Installation

```bash
npm install @hexa/adapter-prisma @prisma/client
npm install prisma --save-dev
```

## Usage

### Setup Adapter

```typescript
import { PrismaAdapter, createPrismaAdapter } from '@hexa/adapter-prisma';

// Create adapter
const adapter = createPrismaAdapter({
  url: process.env.DATABASE_URL,
  log: ['error', 'warn'],
});

// Connect
await adapter.connect();

// Get Prisma client
const prisma = adapter.getClient();

// Disconnect on shutdown
await adapter.disconnect();
```

### Create Repository

```typescript
import { BasePrismaRepository } from '@hexa/adapter-prisma';
import { IBaseEntity } from '@hexa/common';
import { PrismaClient } from '@prisma/client';

interface User extends IBaseEntity {
  id: number;
  email: string;
  username: string;
  password: string;
}

class UserRepository extends BasePrismaRepository<User> {
  protected modelName = 'user';

  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  // Add custom methods
  async findByEmail(email: string): Promise<User | null> {
    return this.model.findFirst({
      where: { email, isActive: true, deletedAt: null },
    });
  }
}

// Usage
const userRepo = new UserRepository(prisma);
const users = await userRepo.getAll({ 
  pagination: { page: 1, limit: 10 } 
});
```

## API

### PrismaAdapter

- `connect()` - Connect to database
- `disconnect()` - Disconnect from database
- `getClient()` - Get Prisma client instance
- `isConnected()` - Check connection status

### BasePrismaRepository

- `getById(id)` - Get entity by ID
- `getAll(options)` - Get all with pagination, search, filters
- `create(item)` - Create new entity
- `update(id, item)` - Update entity
- `softDelete(id)` - Soft delete (sets isActive=false)
- `hardDelete(id)` - Permanent delete
- `createMany(items)` - Bulk create
- `count(filters)` - Count with filters
- `exists(id)` - Check if exists
