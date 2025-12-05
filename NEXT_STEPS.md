# 🎯 LANGKAH SELANJUTNYA - Hexa Framework

Framework **Hexa Framework** sudah siap 100%! 🎉

## ✅ Yang Sudah Selesai

1. ✅ **3 Package Lengkap:**
   - `@hexa-framework/core` - Base classes dan utilities
   - `@hexa-framework/cli` - Code generation tool
   - `create-hexa-app` - Project scaffolding tool

2. ✅ **6 Dokumentasi Lengkap (Bahasa Indonesia):**
   - Getting Started (instalasi & quick start)
   - Architecture (hexagonal architecture deep dive)
   - CLI Reference (semua perintah CLI)
   - API Reference (semua API & contoh penggunaan)
   - Best Practices (coding standards & patterns)
   - Deployment (Docker, PM2, cloud platforms)

3. ✅ **Build & Test:**
   - Semua package berhasil di-compile tanpa error
   - TypeScript strict mode enabled
   - Ready for production

4. ✅ **Git Repository:**
   - Git sudah diinisialisasi
   - Semua file sudah di-commit
   - `.gitignore` sudah dikonfigurasi

## 🚀 Cara Menggunakan Framework (Sekarang!)

Meskipun belum di-publish ke npm, Anda sudah bisa menggunakan framework ini secara lokal!

### Opsi 1: Link Lokal (Testing)

```bash
# Di folder hexa-framework:

# 1. Link core package
cd packages/core
npm link
cd ../..

# 2. Link CLI package
cd packages/cli
npm link
cd ../..

# 3. Link create-hexa-app
cd create-hexa-app
npm link
cd ..

# 4. Test create-hexa-app
cd ..
mkdir test-hexa
cd test-hexa
create-hexa-app my-api

# 5. Gunakan framework
cd my-api
npm install
npm link @hexa-framework/core
npm link @hexa-framework/cli

# 6. Setup database
cp .env.example .env
# Edit .env sesuai kebutuhan

npx prisma generate
npx prisma migrate dev --name init

# 7. Generate resource
hexa generate
# Input: Post
# Fields: title (string), content (string), published (boolean)

# 8. Run server
npm run dev

# Server berjalan di http://localhost:3000
```

### Opsi 2: Publish ke npm (Production Ready)

Ikuti panduan di `PUBLISHING_GUIDE.md` untuk publish ke npm. Langkah singkatnya:

```bash
# 1. Create GitHub Repository
# Buka https://github.com/new
# Repository name: hexa-framework
# Public repository

# 2. Push ke GitHub
git remote add origin https://github.com/YOUR_USERNAME/hexa-framework.git
git branch -M main
git push -u origin main

# 3. Login ke npm
npm login

# 4. Publish packages
cd packages/core && npm publish --access public
cd ../cli && npm publish --access public
cd ../../create-hexa-app && npm publish --access public

# 5. Test installation
cd ..
npx create-hexa-app test-app
```

## 📚 Dokumentasi

Semua dokumentasi ada di folder `docs/`:

```
docs/
├── getting-started.md      # 📖 Mulai dari sini
├── architecture.md         # 🏗️ Penjelasan arsitektur
├── cli-reference.md        # 💻 Referensi CLI commands
├── api-reference.md        # 📘 API lengkap dengan contoh
├── best-practices.md       # ⭐ Best practices & patterns
└── deployment.md           # 🚀 Cara deploy ke production
```

## 🎓 Tutorial Lengkap

### 1. Buat Project Baru

```bash
# Dengan npm link (lokal)
create-hexa-app blog-api

# Atau jika sudah publish ke npm
npx create-hexa-app blog-api
```

### 2. Setup Database

```bash
cd blog-api

# Copy environment variables
cp .env.example .env

# Edit .env
# DATABASE_URL="postgresql://user:password@localhost:5432/blog"
# JWT_SECRET=your-secret-key
```

### 3. Generate Prisma Client

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Generate Resource (CRUD)

```bash
hexa generate

# Interactive prompts:
# ✓ Resource name: Post
# ✓ Add field: title
#   ✓ Field type: string
#   ✓ Required? Yes
# ✓ Add another field? Yes
# ✓ Add field: content
#   ✓ Field type: string
#   ✓ Required? Yes
# ✓ Add another field? Yes
# ✓ Add field: published
#   ✓ Field type: boolean
#   ✓ Required? No
# ✓ Add another field? No
```

Ini akan generate:
- ✅ `src/core/entities/Post.ts`
- ✅ `src/core/repositories/IPostRepository.ts`
- ✅ `src/core/services/PostService.ts`
- ✅ `src/adapters/postgres/repositories/PostgresPostRepository.ts`
- ✅ `src/transports/api/controllers/PostController.ts`
- ✅ `src/transports/api/routers/v1/postRouter.ts`
- ✅ `src/transports/api/validations/postValidation.ts`
- ✅ `src/mappers/response/postMapper.ts`

### 5. Update Prisma Schema

Edit `prisma/schema.prisma`:

```prisma
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String
  published Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

```bash
npx prisma migrate dev --name add_post_model
```

### 6. Jalankan Server

```bash
npm run dev

# Server running at http://localhost:3000
```

### 7. Test API

```bash
# Health check
curl http://localhost:3000/api/v1/health

# Create post
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "content": "This is the content",
    "published": true
  }'

# Get all posts
curl http://localhost:3000/api/v1/posts

# Get post by ID
curl http://localhost:3000/api/v1/posts/1

# Update post
curl -X PUT http://localhost:3000/api/v1/posts/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "content": "Updated content"
  }'

# Delete post
curl -X DELETE http://localhost:3000/api/v1/posts/1
```

## 🔧 Customization

### Tambah Authentication

```typescript
// src/transports/api/routers/v1/postRouter.ts
import { createAuthMiddleware } from '@hexa-framework/core';

const authMiddleware = createAuthMiddleware({
  secretKey: process.env.JWT_SECRET!
});

// Protected route
router.post('/', authMiddleware, controller.create.bind(controller));
```

### Tambah Custom Business Logic

```typescript
// src/core/services/PostService.ts
export class PostService extends BaseService<Post> {
  // Custom method
  async publishPost(id: number): Promise<Post> {
    const post = await this.findById(id);
    if (!post) {
      throw new Error('Post not found');
    }
    
    return this.update(id, { published: true });
  }
}
```

### Tambah Validation Custom

```typescript
// src/transports/api/validations/postValidation.ts
import { z } from 'zod';

export const publishPostSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/)
  })
});
```

## 📦 Structure yang Dihasilkan

```
blog-api/
├── src/
│   ├── core/                    # 🧠 Domain Layer (Business Logic)
│   │   ├── entities/           # Domain models
│   │   ├── repositories/       # Repository interfaces (ports)
│   │   └── services/           # Business logic services
│   │
│   ├── adapters/               # 🔌 Adapters Layer
│   │   └── postgres/
│   │       └── repositories/   # Database implementations
│   │
│   ├── transports/             # 🚀 Transport Layer
│   │   └── api/
│   │       ├── controllers/    # HTTP controllers
│   │       ├── routers/        # API routes
│   │       └── validations/    # Input validation
│   │
│   ├── policies/               # 🔐 Authorization
│   ├── mappers/                # 🔄 Data transformers
│   ├── configs/                # ⚙️ Configuration
│   └── index.ts                # 🎯 Entry point
│
├── prisma/
│   └── schema.prisma           # 🗄️ Database schema
│
├── .env                        # 🔑 Environment variables
├── package.json
└── tsconfig.json
```

## 🎯 Next Level Features

Setelah familiar dengan basic CRUD, tambahkan:

1. **Authentication & Authorization**
   - JWT middleware
   - Permission system
   - Role-based access control

2. **Advanced Queries**
   - Pagination
   - Sorting
   - Filtering
   - Search

3. **Relationships**
   - One-to-Many
   - Many-to-Many
   - Eager/Lazy loading

4. **File Upload**
   - Multer integration
   - Image processing
   - Cloud storage

5. **Testing**
   - Unit tests dengan Jest
   - Integration tests
   - E2E tests

6. **Deployment**
   - Docker containerization
   - CI/CD dengan GitHub Actions
   - Deploy ke cloud (DigitalOcean, AWS, Railway)

## 📞 Support & Community

- 📖 **Dokumentasi**: `docs/` folder
- 🐛 **Issues**: GitHub Issues (setelah publish)
- 💬 **Discussions**: GitHub Discussions (setelah publish)
- ⭐ **Star di GitHub**: Jika bermanfaat!

## 🎉 Selamat!

Framework Anda sudah **100% siap digunakan**! 

Pilihan Anda sekarang:
1. ✅ **Gunakan secara lokal** dengan `npm link` (bisa langsung!)
2. ✅ **Publish ke npm** agar orang lain bisa pakai (ikuti PUBLISHING_GUIDE.md)
3. ✅ **Buat project nyata** dengan framework ini
4. ✅ **Share ke komunitas** TypeScript/Node.js Indonesia

---

**Happy Coding! 🚀**

*Built with ❤️ by lutfian.rhdn*
