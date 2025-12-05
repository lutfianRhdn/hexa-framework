# 🚀 Memulai dengan Hexa Framework

> Panduan lengkap untuk memulai development dengan Hexa Framework

## Prasyarat

Sebelum memulai, pastikan Anda telah menginstall:

- **Node.js** (v18 atau lebih tinggi)
- **npm** atau **yarn**
- **PostgreSQL** (atau database lain yang didukung Prisma)
- **Git**

## Instalasi

### 1. Install CLI Global

```bash
npm install -g @hexa-framework/cli
```

### 2. Buat Project Baru

```bash
# Menggunakan npx (recommended)
npx create-hexa-app my-blog-api

# Atau menggunakan CLI
hexa new my-blog-api
```

### 3. Pilih Template

Saat membuat project, Anda akan diminta memilih template:

- **basic** - Setup minimal (tanpa auth)
- **with-auth** - Dengan JWT authentication dan permissions
- **full-featured** - Semua fitur lengkap (recommended)

### 4. Install Dependencies

```bash
cd my-blog-api
npm install
```

## Struktur Project

```
my-blog-api/
├── src/
│   ├── core/                    # Domain Layer
│   │   ├── entities/            # Type definitions
│   │   ├── repositories/        # Repository interfaces
│   │   ├── services/            # Business logic
│   │   └── utils/               # Utilities
│   ├── adapters/                # Infrastructure Layer
│   │   ├── postgres/            # Prisma adapter
│   │   └── redis/               # Redis adapter (optional)
│   ├── transports/              # Presentation Layer
│   │   └── api/
│   │       ├── controllers/     # REST controllers
│   │       ├── routers/         # Express routers
│   │       └── validations/     # Zod schemas
│   ├── policies/                # Authorization
│   ├── mappers/                 # Data transformation
│   ├── configs/                 # Configuration
│   └── index.ts                 # Entry point
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── migrations/              # Database migrations
│   └── seeds/                   # Seed data
├── tests/                       # Tests
├── docs/                        # Documentation
├── .env                         # Environment variables
├── docker-compose.yaml          # Docker setup
├── Dockerfile                   # Docker image
├── package.json
└── tsconfig.json
```

## Setup Database

### 1. Copy Environment File

```bash
cp .env.example .env
```

### 2. Edit File .env

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# JWT
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-key"

# App
PORT=3000
NODE_ENV=development
```

### 3. Run Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npm run seed
```

## Generate Resource Pertama Anda

### 1. Generate Resource "Post"

```bash
hexa generate post
```

### 2. Jawab Pertanyaan CLI

```
🔷 Hexa Framework - Resource Generator

✔ Resource name: post
✔ Field name: title
✔ Field type: string
✔ Is this field required? yes
✔ Field name: content
✔ Field type: string  
✔ Is this field required? yes
✔ Field name: author
✔ Field type: string
✔ Is this field required? yes
✔ Field name: (tekan Enter untuk selesai)
```

### 3. Files yang Dihasilkan

CLI akan generate 8 files:

```
✅ Generated files:
  - src/core/entities/post/post.ts
  - src/core/repositories/post.ts
  - src/adapters/postgres/repositories/PostRepository.ts
  - src/core/services/PostService.ts
  - src/transports/api/controllers/PostController.ts
  - src/transports/api/routers/v1/post.ts
  - src/transports/api/validations/post.ts
  - src/mappers/post/mapper.ts
```

### 4. Update Prisma Schema

Tambahkan model di `prisma/schema.prisma`:

```prisma
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String   @db.Text
  author    String
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("posts")
}
```

### 5. Run Migration

```bash
npx prisma migrate dev --name add-post-model
```

### 6. Daftarkan Router

Edit `src/transports/api/routers/v1/index.ts`:

```typescript
import postRouter from './post';

// ... existing code ...

router.use('/posts', postRouter);
```

## Running the Application

### Development Mode

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

### Production Mode

```bash
# Build
npm run build

# Start
npm start
```

## Test API

### 1. Register User (jika menggunakan template with-auth)

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "password": "password123"
  }'
```

Response akan berisi `access_token`.

### 3. Create Post

```bash
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "My First Post",
    "content": "This is my first blog post!",
    "author": "John Doe"
  }'
```

### 4. Get All Posts

```bash
curl http://localhost:3000/api/v1/posts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Get Post by ID

```bash
curl http://localhost:3000/api/v1/posts/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 6. Update Post

```bash
curl -X PUT http://localhost:3000/api/v1/posts/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Updated Title"
  }'
```

### 7. Delete Post

```bash
curl -X DELETE http://localhost:3000/api/v1/posts/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Next Steps

Sekarang Anda sudah berhasil setup project dan membuat resource pertama! 🎉

Langkah selanjutnya:

1. [Pelajari Architecture](./architecture.md) - Memahami hexagonal architecture
2. [CLI Reference](./cli-reference.md) - Command lengkap CLI
3. [API Reference](./api-reference.md) - Documentation base classes
4. [Best Practices](./best-practices.md) - Tips dan best practices
5. [Deployment](./deployment.md) - Deploy ke production

## Troubleshooting

### Port sudah digunakan

Ubah `PORT` di file `.env`:

```env
PORT=3001
```

### Database connection error

Pastikan PostgreSQL berjalan dan credentials di `.env` benar:

```bash
# Check PostgreSQL status
# Linux/Mac:
sudo service postgresql status

# Windows:
# Check di Services
```

### TypeScript errors

Rebuild project:

```bash
npm run build
```

### Prisma generate errors

Regenerate Prisma Client:

```bash
npx prisma generate
```

## Bantuan

Jika Anda menemui masalah:

1. Check [documentation](../README.md)
2. Lihat [examples](../examples/)
3. Buka [GitHub Issues](https://github.com/lutfian-rhdn/hexa-framework/issues)

---

Happy coding! 🚀
