# Release Notes v1.0.1 - Complete Example Files Added! 🎉

## 🚀 What's New

**Major Update:** `create-hexa-framework-app` now generates complete working example with User CRUD implementation!

### Problem Fixed
In version 1.0.0, users reported that running `npx create-hexa-app` only generated empty folders without example files. This has been completely fixed in v1.0.1!

---

## ✨ New Features

### Complete User CRUD Example

When you create a new project, you now get:

#### 1. Domain Layer (Core)
- ✅ **User Entity** - Complete interface with DTOs
- ✅ **Repository Interface** - IUserRepository with custom methods
- ✅ **User Service** - Business logic with validation and bcrypt

#### 2. Adapter Layer
- ✅ **Prisma Repository** - Full CRUD implementation
- ✅ **Soft Delete** - Safe deletion pattern
- ✅ **Custom Queries** - findByEmail, findByUsername

#### 3. Transport Layer (API)
- ✅ **User Controller** - REST API handlers
- ✅ **Express Router** - Complete route definitions
- ✅ **Zod Validation** - Input validation schemas

#### 4. Supporting Files
- ✅ **Response Mapper** - Hide sensitive fields (password)
- ✅ **Auth Middleware** - Authentication examples
- ✅ **Database Config** - Prisma client setup
- ✅ **Environment Config** - Validation included
- ✅ **Prisma Schema** - User model ready to use

---

## 📦 Installation

```bash
# Latest version with examples
npx create-hexa-framework-app@latest my-app

# Navigate to project
cd my-app

# Setup environment
cp .env.example .env
# Edit .env with DATABASE_URL and JWT_SECRET

# Generate Prisma client
npx prisma generate

# Run migration
npx prisma migrate dev --name init

# Start server
npm run dev
```

Server will be available at: **http://localhost:3000** 🎉

---

## 🎯 API Endpoints

Your generated project includes these working endpoints:

```
POST   /api/v1/users          Create new user
GET    /api/v1/users          Get all users (with pagination)
GET    /api/v1/users/:id      Get user by ID
PUT    /api/v1/users/:id      Update user
DELETE /api/v1/users/:id      Delete user (soft delete)
GET    /health                Health check
```

### Example Request

```bash
# Create user
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "username": "johndoe",
    "password": "secret123",
    "role": "user"
  }'
```

### Example Response

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "email": "john@example.com",
    "username": "johndoe",
    "role": "user",
    "isActive": true,
    "createdAt": "2025-12-05T10:00:00.000Z",
    "updatedAt": "2025-12-05T10:00:00.000Z"
  }
}
```

---

## 📁 Project Structure

```
my-app/
├── src/
│   ├── core/                        Domain layer
│   │   ├── entities/User.ts        ✅ NEW
│   │   ├── repositories/IUserRepository.ts ✅ NEW
│   │   └── services/UserService.ts ✅ NEW
│   ├── adapters/postgres/
│   │   └── repositories/PostgresUserRepository.ts ✅ NEW
│   ├── transports/api/
│   │   ├── controllers/UserController.ts ✅ NEW
│   │   ├── routers/v1/userRouter.ts ✅ NEW
│   │   └── validations/userValidation.ts ✅ NEW
│   ├── mappers/response/userMapper.ts ✅ NEW
│   ├── policies/authPolicy.ts ✅ NEW
│   ├── configs/
│   │   ├── database.ts ✅ NEW
│   │   └── env.ts ✅ NEW
│   └── index.ts ✅ UPDATED
├── prisma/schema.prisma ✅ UPDATED (User model)
├── package.json ✅ UPDATED (bcrypt added)
└── ...
```

---

## 🔥 Features Demonstrated

### Hexagonal Architecture
- Clear separation between domain, adapter, and transport layers
- Independent testable components
- Easy to extend and maintain

### Security
- Password hashing with bcrypt
- Input validation with Zod
- Sensitive field filtering
- CORS & Helmet configured

### Database
- Prisma ORM integration
- Type-safe queries
- Migration support
- Soft delete pattern
- Pagination support

### Error Handling
- Global error handler
- Async error wrapper
- Validation error formatting
- Development/production modes

### Code Quality
- Full TypeScript
- Strict type checking
- DTOs for data transfer
- Clean architecture patterns

---

## 📚 Documentation

Comprehensive documentation available:

- [README.md](./README.md) - Quick start guide
- [CHANGELOG.md](./CHANGELOG.md) - Complete version history
- [EXAMPLE_FEATURES.md](./EXAMPLE_FEATURES.md) - Detailed feature documentation
- [FRAMEWORK_COMPLETE.md](./FRAMEWORK_COMPLETE.md) - Complete usage guide
- [docs/api-reference.md](./docs/api-reference.md) - API reference
- [docs/deployment.md](./docs/deployment.md) - Deployment guide
- [docs/best-practices.md](./docs/best-practices.md) - Best practices

---

## 🆚 Version Comparison

| Feature | v1.0.0 | v1.0.1 |
|---------|--------|--------|
| Folder structure | ✅ | ✅ |
| Config files | ✅ | ✅ |
| Example entity | ❌ | ✅ |
| Example repository | ❌ | ✅ |
| Example service | ❌ | ✅ |
| Example controller | ❌ | ✅ |
| Example validation | ❌ | ✅ |
| Working API | ❌ | ✅ |

---

## 🔧 Breaking Changes

None. This is a backwards-compatible enhancement.

---

## 🐛 Bug Fixes

- Fixed empty folder generation issue
- Added missing example files
- Updated package.json to include bcrypt dependency

---

## 📦 Package Updates

### create-hexa-framework-app
- **Version**: 1.0.0 → 1.0.1
- **Size**: 7.9 kB → 12.2 kB
- **Unpacked**: 48.3 kB

### New Dependencies
- `bcrypt@^5.1.1` - Password hashing
- `@types/bcrypt@^5.0.2` - TypeScript types

---

## 🎓 Learning Resources

The generated example demonstrates:

1. **Entity Definition** - How to define domain entities
2. **Repository Pattern** - Interface + Prisma implementation
3. **Service Layer** - Business logic separation
4. **Controller Layer** - HTTP request handling
5. **Validation** - Zod schema validation
6. **Response Mapping** - Data transformation
7. **Middleware** - Authentication patterns
8. **Configuration** - Environment management

Copy these patterns to create your own entities!

---

## 🔮 What's Next

### Future Enhancements
- JWT authentication example
- More entity examples (Posts, Comments)
- Testing examples (Jest)
- Docker setup
- CI/CD pipeline examples

### CLI Tool Updates
```bash
# Coming soon
hexa-framework generate entity Product
hexa-framework generate service Product
hexa-framework generate controller Product
```

---

## 🙏 Acknowledgments

Thanks to all users who reported the empty folder issue. Your feedback helped improve the framework!

---

## 📝 License

MIT

---

## 🔗 Links

- **npm Package**: https://www.npmjs.com/package/create-hexa-framework-app
- **GitHub Repository**: https://github.com/lutfianRhdn/hexa-framework
- **Documentation**: [README.md](./README.md)

---

## 🚀 Get Started Now!

```bash
npx create-hexa-framework-app@latest my-awesome-api
cd my-awesome-api
npm run dev
```

**Happy Coding!** 🎉

---

*Released on December 5, 2025*
*Maintainer: lutfian.rhdn*
