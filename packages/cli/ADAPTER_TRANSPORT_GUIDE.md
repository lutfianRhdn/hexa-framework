# 🏗️ Adapter & Transport Layer Guide - Hexa CLI v1.2.0

## Overview

Hexa CLI v1.2.0 introduces powerful commands to generate **Adapters** and **Transport Layers**, following the **Hexagonal Architecture** (Ports & Adapters) pattern.

## 🎯 What are Adapters?

**Adapters** are components that connect your application's core business logic to external systems or infrastructure:

- Database/ORM (Prisma, TypeORM)
- Cache systems (Redis, Memcached)
- Message queues (RabbitMQ, Kafka, SQS)
- External APIs (Payment gateways, Email services)
- File storage (S3, local filesystem)

## 🚀 What are Transports?

**Transports** handle different communication protocols and interfaces for your application:

- HTTP/REST APIs (Express, Fastify)
- GraphQL APIs
- gRPC services
- WebSocket real-time communication
- CLI interfaces

---

## 📦 Make Adapter Command

### Basic Usage

```bash
# Create a database adapter (default)
hexa make:adapter User

# Create with specific type
hexa make:adapter Payment --type database
hexa make:adapter Session --type cache
hexa make:adapter Notification --type messaging
hexa make:adapter Job --type queue
```

### Adapter Types

#### 1. Database Adapter (`--type database`)

Creates a repository-pattern adapter with Prisma integration.

```bash
hexa make:adapter Product --type database
```

**Generated file:** `src/adapters/database/ProductAdapter.ts`

```typescript
import { PrismaClient } from '@prisma/client';

export class ProductAdapter {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<any[]> {
    return await this.prisma.product.findMany();
  }

  async findById(id: string): Promise<any | null> {
    return await this.prisma.product.findUnique({
      where: { id }
    });
  }

  async create(data: any): Promise<any> {
    return await this.prisma.product.create({ data });
  }

  async update(id: string, data: any): Promise<any> {
    return await this.prisma.product.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: { id }
    });
  }
}
```

**Use Case:**
- Data persistence
- Database queries
- Transaction management
- Data access layer

#### 2. Cache Adapter (`--type cache`)

Creates a caching adapter with TTL support.

```bash
hexa make:adapter Session --type cache
```

**Generated file:** `src/adapters/cache/SessionAdapter.ts`

```typescript
export class SessionAdapter {
  private cacheStore: Map<string, any> = new Map();
  private ttl: number = 3600; // 1 hour

  async get(key: string): Promise<any | null> {
    return this.cacheStore.get(key) || null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    this.cacheStore.set(key, value);
    setTimeout(() => {
      this.cacheStore.delete(key);
    }, (ttl || this.ttl) * 1000);
  }

  async delete(key: string): Promise<void> {
    this.cacheStore.delete(key);
  }

  async clear(): Promise<void> {
    this.cacheStore.clear();
  }
}
```

**Use Case:**
- Session management
- Query result caching
- Rate limiting
- Temporary data storage

#### 3. Messaging Adapter (`--type messaging`)

Creates a message queue/pub-sub adapter.

```bash
hexa make:adapter Notification --type messaging
```

**Generated file:** `src/adapters/messaging/NotificationAdapter.ts`

```typescript
export class NotificationAdapter {
  async send(message: any): Promise<void> {
    // Implement message sending logic
    console.log('Sending message:', message);
  }

  async receive(): Promise<any> {
    // Implement message receiving logic
    return null;
  }

  async subscribe(topic: string, handler: (message: any) => void): Promise<void> {
    console.log(`Subscribed to ${topic}`);
  }

  async unsubscribe(topic: string): Promise<void> {
    console.log(`Unsubscribed from ${topic}`);
  }
}
```

**Use Case:**
- Event-driven architecture
- Asynchronous processing
- Microservices communication
- Real-time notifications

#### 4. Queue Adapter (`--type queue`)

Same as messaging adapter, suitable for job queues.

```bash
hexa make:adapter Email --type queue
```

**Use Case:**
- Background jobs
- Task scheduling
- Batch processing
- Worker queues

---

## 🌐 Make Transport Command

### Basic Usage

```bash
# Create HTTP transport (default)
hexa make:transport User

# Create with specific type
hexa make:transport User --type http
hexa make:transport User --type graphql
hexa make:transport User --type grpc
hexa make:transport User --type websocket
```

### Transport Types

#### 1. HTTP/REST Transport (`--type http`)

Creates an Express router with RESTful CRUD routes.

```bash
hexa make:transport Product --type http
```

**Generated file:** `src/transports/http/ProductTransport.ts`

```typescript
import { Router, Request, Response, NextFunction } from 'express';
import { ProductController } from '../controllers/ProductController';

export class ProductTransport {
  private router: Router;
  private controller: ProductController;

  constructor(controller: ProductController) {
    this.router = Router();
    this.controller = controller;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // GET all
    this.router.get('/', (req, res, next) => {
      this.controller.index(req, res, next);
    });

    // GET by ID
    this.router.get('/:id', (req, res, next) => {
      this.controller.show(req, res, next);
    });

    // POST create
    this.router.post('/', (req, res, next) => {
      this.controller.store(req, res, next);
    });

    // PUT update
    this.router.put('/:id', (req, res, next) => {
      this.controller.update(req, res, next);
    });

    // DELETE
    this.router.delete('/:id', (req, res, next) => {
      this.controller.destroy(req, res, next);
    });
  }

  getRouter(): Router {
    return this.router;
  }
}

// Export router instance
export const productRouter = (controller: ProductController) => {
  const transport = new ProductTransport(controller);
  return transport.getRouter();
};
```

**Use Case:**
- RESTful APIs
- Traditional web services
- Mobile app backends
- Public APIs

#### 2. GraphQL Transport (`--type graphql`)

Creates GraphQL schema with queries and mutations.

```bash
hexa make:transport User --type graphql
```

**Generated file:** `src/transports/graphql/UserTransport.ts`

Includes:
- GraphQL Object Type definition
- Query resolvers (get, list)
- Mutation resolvers (create, update, delete)
- Context handling

**Use Case:**
- Flexible data fetching
- Single endpoint API
- Real-time subscriptions
- Mobile-first APIs

#### 3. gRPC Transport (`--type grpc`)

Creates gRPC service implementation.

```bash
hexa make:transport User --type grpc
```

**Generated file:** `src/transports/grpc/UserTransport.ts`

Includes:
- Service interface
- RPC method implementations
- Proto file template (in comments)

**Use Case:**
- Microservices communication
- High-performance APIs
- Streaming data
- Internal service calls

#### 4. WebSocket Transport (`--type websocket`)

Creates WebSocket server with real-time communication.

```bash
hexa make:transport Chat --type websocket
```

**Generated file:** `src/transports/websocket/ChatTransport.ts`

Includes:
- WebSocket server setup
- Message handling
- Broadcasting
- Client management

**Use Case:**
- Real-time chat
- Live notifications
- Collaborative editing
- Live dashboards

---

## 🏛️ Hexagonal Architecture Pattern

### The Flow

```
[External System] → [Adapter] → [Port/Interface] → [Core Logic]
                                                        ↓
[Client] → [Transport] → [Controller] → [Service] → [Repository]
```

### Example: Complete Feature

```bash
# 1. Create entity
hexa make:entity Product

# 2. Create repository (database adapter)
hexa make:adapter Product --type database

# 3. Create service
hexa make:service Product

# 4. Create controller
hexa make:controller Product -r

# 5. Create HTTP transport
hexa make:transport Product --type http

# 6. (Optional) Create cache adapter
hexa make:adapter ProductCache --type cache

# 7. (Optional) Create messaging adapter
hexa make:adapter ProductEvent --type messaging
```

### Project Structure

```
src/
├── core/
│   ├── entities/
│   │   └── Product.ts
│   ├── services/
│   │   └── ProductService.ts
│   └── interfaces/
│       └── IProductRepository.ts
├── adapters/
│   ├── database/
│   │   └── ProductAdapter.ts
│   ├── cache/
│   │   └── ProductCacheAdapter.ts
│   └── messaging/
│       └── ProductEventAdapter.ts
├── transports/
│   ├── http/
│   │   └── ProductTransport.ts
│   ├── graphql/
│   │   └── ProductTransport.ts
│   └── controllers/
│       └── ProductController.ts
```

---

## 💡 Use Case Examples

### E-commerce Platform

```bash
# Products
hexa make:adapter Product --type database
hexa make:adapter ProductCache --type cache
hexa make:transport Product --type http

# Orders
hexa make:adapter Order --type database
hexa make:adapter OrderEvent --type messaging
hexa make:transport Order --type http

# Real-time notifications
hexa make:transport Notification --type websocket
```

### Microservices Architecture

```bash
# User Service (gRPC)
hexa make:adapter User --type database
hexa make:transport User --type grpc

# Product Service (REST)
hexa make:adapter Product --type database
hexa make:transport Product --type http

# Notification Service (Message Queue)
hexa make:adapter Email --type queue
hexa make:adapter SMS --type queue
```

### Real-time Collaboration App

```bash
# HTTP API for CRUD
hexa make:transport Document --type http

# WebSocket for real-time updates
hexa make:transport Collaboration --type websocket

# GraphQL for flexible queries
hexa make:transport User --type graphql

# Cache for performance
hexa make:adapter Session --type cache
```

---

## 🔧 Customization

All generated templates are starting points. Customize them based on your needs:

### Extending Database Adapter

```typescript
export class ProductAdapter {
  // Generated methods...
  
  // Add custom queries
  async findByCategory(category: string): Promise<any[]> {
    return await this.prisma.product.findMany({
      where: { category }
    });
  }
  
  async findInStock(): Promise<any[]> {
    return await this.prisma.product.findMany({
      where: { stock: { gt: 0 } }
    });
  }
}
```

### Extending HTTP Transport

```typescript
private setupRoutes(): void {
  // Generated routes...
  
  // Add custom routes
  this.router.get('/category/:category', (req, res, next) => {
    this.controller.byCategory(req, res, next);
  });
  
  this.router.post('/bulk', (req, res, next) => {
    this.controller.bulkCreate(req, res, next);
  });
}
```

---

## 📚 Best Practices

1. **One Adapter per External System** - Create separate adapters for different databases, APIs, etc.

2. **Keep Core Logic Pure** - Business logic should not depend on specific adapters

3. **Use Interfaces/Ports** - Define interfaces that adapters implement

4. **Transport Independence** - Same service should work with any transport (HTTP, gRPC, etc.)

5. **Configuration Injection** - Pass configuration to adapters, don't hard-code

6. **Error Handling** - Wrap external errors in domain-specific exceptions

7. **Testing** - Mock adapters easily for unit testing core logic

---

## 🚀 Quick Reference

| Command | Purpose | Example |
|---------|---------|---------|
| `hexa make:adapter <name>` | Database adapter | `hexa make:adapter User` |
| `hexa make:adapter <name> -t cache` | Cache adapter | `hexa make:adapter Session -t cache` |
| `hexa make:adapter <name> -t messaging` | Message adapter | `hexa make:adapter Email -t messaging` |
| `hexa make:transport <name>` | HTTP transport | `hexa make:transport User` |
| `hexa make:transport <name> -t graphql` | GraphQL transport | `hexa make:transport User -t graphql` |
| `hexa make:transport <name> -t grpc` | gRPC transport | `hexa make:transport User -t grpc` |
| `hexa make:transport <name> -t websocket` | WebSocket transport | `hexa make:transport Chat -t websocket` |

---

## 🎉 Benefits

✅ **Separation of Concerns** - Core logic independent from infrastructure
✅ **Testability** - Easy to mock and test components
✅ **Flexibility** - Swap implementations without changing core
✅ **Scalability** - Add new transports/adapters without refactoring
✅ **Maintainability** - Clear structure and responsibilities
✅ **Reusability** - Adapters can be reused across projects

---

**Hexa Framework CLI v1.2.0** - Building scalable applications with hexagonal architecture 🔷
