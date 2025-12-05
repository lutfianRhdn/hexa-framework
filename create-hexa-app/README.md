# 🚀 create-hexa-app

Scaffold Hexa Framework project dengan cepat dan mudah.

## 📦 Installation

### Using npx (Recommended)

```bash
npx create-hexa-app my-api
```

### Global Installation

```bash
npm install -g create-hexa-app
create-hexa-app my-api
```

## 🎯 Usage

### Interactive Mode

```bash
npx create-hexa-app
```

Akan muncul prompt:
```
? Enter project name: my-blog-api
```

### Direct Mode

```bash
npx create-hexa-app my-blog-api
```

## 📂 Generated Project Structure

```
my-blog-api/
├── src/
│   ├── core/                    # Domain Layer
│   │   ├── entities/            # Domain entities
│   │   ├── repositories/        # Repository interfaces
│   │   └── services/            # Business services
│   ├── adapters/                # Infrastructure Layer
│   │   └── postgres/
│   │       └── repositories/    # Prisma implementations
│   ├── transports/              # Presentation Layer
│   │   └── api/
│   │       ├── controllers/     # REST controllers
│   │       ├── routers/         # Express routers
│   │       │   └── v1/
│   │       └── validations/     # Zod schemas
│   ├── policies/                # Authorization
│   │   ├── authMiddleware.ts
│   │   └── permissionMiddleware.ts
│   ├── mappers/                 # Data transformation
│   │   └── response/
│   └── configs/                 # Configuration
│       ├── database.ts
│       └── env.ts
├── prisma/
│   └── schema.prisma            # Database schema
├── .env.example                 # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## ⚙️ What's Included

### Dependencies

- **@hexa-framework/core** - Base classes dan utilities
- **express** - Web framework
- **@prisma/client** - Database ORM
- **zod** - Schema validation
- **jsonwebtoken** - JWT authentication
- **bcrypt** - Password hashing
- **helmet** - Security headers
- **cors** - CORS middleware
- **express-rate-limit** - Rate limiting
- **winston** - Logging
- **dotenv** - Environment variables

### Dev Dependencies

- **TypeScript** - Type safety
- **ts-node-dev** - Development server
- **@types/** - Type definitions
- **prisma** - Database migrations
- **eslint** - Code linting
- **prettier** - Code formatting

### Scripts

```json
{
  "dev": "ts-node-dev --respawn src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "prisma:studio": "prisma studio"
}
```

## 🚀 Next Steps

After creating your project:

### 1. Navigate to Project

```bash
cd my-blog-api
```

### 2. Configure Environment

Copy and edit `.env`:

```bash
copy .env.example .env
```

Edit `.env`:
```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
JWT_SECRET=your-super-secret-key-change-this
CORS_ORIGIN=http://localhost:3000
```

### 3. Setup Database

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Generate Your First Resource

Install CLI:
```bash
npm install -g @hexa-framework/cli
```

Generate resource:
```bash
hexa generate resource post
```

This creates:
- `src/core/entities/post.entity.ts`
- `src/core/repositories/post.repository.ts`
- `src/core/services/post.service.ts`
- `src/adapters/postgres/repositories/post.repository.adapter.ts`
- `src/transports/api/controllers/post.controller.ts`
- `src/transports/api/routers/v1/post.router.ts`
- `src/transports/api/validations/post.validation.ts`
- `src/mappers/response/post.mapper.ts`

### 5. Run Development Server

```bash
npm run dev
```

Server akan running di `http://localhost:3000`

### 6. Test API

```bash
# Health check
curl http://localhost:3000/health

# Your resources (jika sudah generate)
curl http://localhost:3000/api/v1/posts
```

## 📚 Documentation

Dokumentasi lengkap tersedia di:
- [Getting Started](https://github.com/lutfian-rhdn/hexa-framework/blob/master/docs/getting-started.md)
- [Architecture Guide](https://github.com/lutfian-rhdn/hexa-framework/blob/master/docs/architecture.md)
- [CLI Reference](https://github.com/lutfian-rhdn/hexa-framework/blob/master/docs/cli-reference.md)
- [API Reference](https://github.com/lutfian-rhdn/hexa-framework/blob/master/docs/api-reference.md)
- [Deployment Guide](https://github.com/lutfian-rhdn/hexa-framework/blob/master/docs/deployment.md)
- [Best Practices](https://github.com/lutfian-rhdn/hexa-framework/blob/master/docs/best-practices.md)

## 🤝 Contributing

Contributions are welcome! Please check our [Contributing Guide](https://github.com/lutfian-rhdn/hexa-framework/blob/master/CONTRIBUTING.md).

## 📄 License

MIT © lutfian.rhdn

## 🔗 Links

- [GitHub Repository](https://github.com/lutfian-rhdn/hexa-framework)
- [npm Package](https://www.npmjs.com/package/create-hexa-app)
- [Core Package](https://www.npmjs.com/package/@hexa-framework/core)
- [CLI Package](https://www.npmjs.com/package/@hexa-framework/cli)

---

**Made with ❤️ by lutfian.rhdn**
