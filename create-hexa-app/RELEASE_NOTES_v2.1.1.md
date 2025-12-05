# 🚀 Hexa Framework v2.1.1 Release Notes

**Release Date:** December 5, 2025  
**Package:** create-hexa-framework-app  
**Version:** 2.1.1  
**npm:** https://www.npmjs.com/package/create-hexa-framework-app

---

## 🎉 Major Feature: Powerful CLI Like Laravel Artisan!

We're excited to announce **Hexa CLI** - a powerful command-line interface that brings Laravel Artisan-level productivity to TypeScript developers!

### ⭐ Star Feature: Complete CRUD Generator

Generate a complete CRUD system with **one command**:

```bash
npm run hexa generate crud Product -- --fields "name:string,price:number,stock:number"
```

**What gets generated in ~3 seconds:**
- ✅ Entity with TypeScript interfaces
- ✅ Repository interface
- ✅ Repository implementation (Prisma-based)
- ✅ Service layer with business logic structure
- ✅ REST Controller or GraphQL Resolver
- ✅ Express Router with dependency injection
- ✅ Zod validation schemas
- ✅ Prisma model automatically added to schema

**Total: 7 files + Prisma model** following hexagonal architecture!

---

## 🆕 What's New

### CLI Commands (15+)

#### 📦 **Generator Commands**
```bash
hexa generate controller <name>   # Generate controller
hexa generate service <name>      # Generate service
hexa generate repository <name>   # Generate repository
hexa generate entity <name>       # Generate entity
hexa generate middleware <name>   # Generate middleware
hexa generate dto <name>          # Generate DTOs
hexa generate crud <name>         # ⭐ Generate complete CRUD
```

#### 🗄️ **Database Commands**
```bash
hexa db migrate              # Run database migrations
hexa db migrate:fresh        # Fresh database (⚠️ destroys data)
hexa db migrate:reset        # Rollback and re-run migrations
hexa db seed                 # Seed the database
```

#### ⚙️ **Development Commands**
```bash
hexa serve                   # Start dev server
hexa build                   # Build for production
hexa test                    # Run tests
hexa list                    # Show all commands
```

### Smart Features

✅ **Interactive Mode** - Run `npm run hexa` for guided experience  
✅ **Command Shortcuts** - `hexa g c` = `hexa generate controller`  
✅ **Auto-Detection** - Detects project configuration automatically  
✅ **Type Safety** - Generates properly typed TypeScript code  
✅ **Hexagonal Architecture** - Enforces clean architecture patterns  
✅ **Field Parsing** - Supports `name:string`, `age:number`, `bio:string?`  
✅ **Overwrite Protection** - Prompts before overwriting files  
✅ **Beautiful UI** - Colored output with spinners and emojis  

---

## 📊 Impact

### Before CLI (v2.0.0)
- ⏱️ **Time per CRUD:** 30-45 minutes
- 📝 Manual file creation (7+ files)
- 🐛 Error-prone copy-paste
- ❌ Inconsistent code style

### After CLI (v2.1.1)
- ⏱️ **Time per CRUD:** ~3 seconds
- 📝 Automated generation (7+ files)
- ✅ Type-safe code generation
- ✅ Consistent hexagonal architecture

**Productivity Gain: 600x faster!** ⚡

---

## 🎯 Quick Start

### Create New Project with CLI

```bash
# Create project
npx create-hexa-framework-app@2.1.1 my-awesome-api

# Navigate to project
cd my-awesome-api

# Use CLI
npm run hexa list
```

### Generate Your First CRUD

```bash
# Generate Product CRUD
npm run hexa generate crud Product -- --fields "name:string,price:number,stock:number,description:string?"

# Run migrations
npx prisma generate
npx prisma migrate dev --name add_product

# Register router in src/transports/api/routers/index.ts
# Then start dev server
npm run dev
```

### Example: E-commerce Product System

```bash
npm run hexa g crud Product -- --fields "name:string,description:string?,price:number,stock:number,categoryId:number,imageUrl:string?,isActive:boolean"
```

Generates a complete product management system ready for production!

---

## 📚 Documentation

- 📖 **[CLI Guide](./HEXA_CLI_GUIDE.md)** - Comprehensive CLI documentation
- 📋 **[Changelog](./CHANGELOG.md)** - Version history
- 📊 **[Release Summary](./CLI_RELEASE_SUMMARY.md)** - Detailed feature overview
- 📘 **[README](./README.md)** - Main project documentation

---

## 🔧 Technical Details

### Architecture
- **CLI Framework:** Commander.js
- **Interactive Prompts:** Inquirer.js
- **UI:** Chalk + Ora (spinners)
- **Code Generation:** Template-based with smart naming
- **Project Detection:** Auto-detects template, database, transports

### File Structure
```
cli/
├── hexa-cli.ts              # Main CLI entry (186 lines)
├── commands/
│   ├── generate/
│   │   ├── crud.ts          # ⭐ CRUD generator (523 lines)
│   │   ├── controller.ts    # Controller generator
│   │   └── ...
│   ├── db/
│   │   ├── migrate.ts       # Migration commands
│   │   └── ...
│   └── serve.ts             # Dev server
└── utils/
    ├── naming.ts            # Naming conventions
    └── file-helpers.ts      # File operations
```

### Package Stats
- **Size:** 63.6 kB (compressed)
- **Unpacked:** 332.6 kB
- **Files:** 93 files total
- **CLI Files:** 20+ TypeScript files
- **Dependencies:** 5 (chalk, commander, fs-extra, inquirer, ora)

---

## 🆚 Comparison with Laravel Artisan

| Feature | Laravel Artisan | Hexa CLI | Winner |
|---------|----------------|----------|--------|
| **CRUD Generation** | 3 files (Model, Migration, Controller) | 7 files + Prisma model (Full hexagonal architecture) | 🏆 **Hexa CLI** |
| **Type Safety** | ❌ PHP (weak typing) | ✅ TypeScript (strong typing) | 🏆 **Hexa CLI** |
| **Architecture** | MVC pattern | Hexagonal architecture | 🏆 **Hexa CLI** |
| **Controller Generation** | ✅ Yes | ✅ Yes | 🤝 Tie |
| **Migrations** | ✅ Yes | ✅ Yes | 🤝 Tie |
| **Database Seeding** | ✅ Yes | ✅ Yes | 🤝 Tie |
| **Dev Server** | ✅ Yes | ✅ Yes | 🤝 Tie |
| **Interactive Mode** | ✅ Yes | ✅ Yes | 🤝 Tie |

**Verdict:** Hexa CLI **exceeds** Laravel Artisan in code generation comprehensiveness!

---

## 🐛 Bug Fixes

### v2.1.1
- ✅ Fixed: CLI templates not included in npm package
- ✅ Added `cli-templates` directory to package files

### v2.1.0
- ✅ Initial CLI release
- ✅ All features working as expected
- ✅ 0 TypeScript compilation errors

---

## 🚀 Migration Guide

### From v2.0.0 to v2.1.1

**Existing projects:** No breaking changes! CLI is added as an enhancement.

**New projects:** Automatically include CLI

**Manual upgrade (optional):**
1. Download CLI templates from GitHub
2. Copy to your project's `cli/` directory
3. Update package.json scripts:
   ```json
   {
     "scripts": {
       "hexa": "ts-node cli/hexa-cli.ts",
       "hexa:build": "tsc --project cli/tsconfig.json"
     },
     "bin": {
       "hexa": "./dist/cli/hexa-cli.js"
     }
   }
   ```

---

## 📦 Installation

### Create New Project

```bash
# Latest version
npx create-hexa-framework-app my-api

# Specific version
npx create-hexa-framework-app@2.1.1 my-api

# With options
npx create-hexa-framework-app my-api --template full-auth --database postgresql --transports rest,graphql
```

### Global Installation

```bash
# Install globally
npm install -g create-hexa-framework-app

# Use it
create-hexa-framework-app my-api
```

---

## 🎓 Examples

### Blog System
```bash
npm run hexa g crud Post -- --fields "title:string,content:string,excerpt:string?,authorId:number,published:boolean,publishedAt:date?"
npm run hexa g crud Comment -- --fields "content:string,postId:number,authorId:number"
npm run hexa g crud Category -- --fields "name:string,slug:string,description:string?"
```

### E-commerce System
```bash
npm run hexa g crud Product -- --fields "name:string,price:number,stock:number,categoryId:number"
npm run hexa g crud Order -- --fields "userId:number,total:number,status:string"
npm run hexa g crud OrderItem -- --fields "orderId:number,productId:number,quantity:number,price:number"
```

### User Management
```bash
npm run hexa g crud User -- --fields "email:string,name:string,role:string"
npm run hexa g crud Profile -- --fields "userId:number,bio:string?,avatar:string?,phone:string?"
```

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for complete version history.

---

## 🙏 Acknowledgments

- Inspired by **Laravel Artisan** - the gold standard of CLI tools
- Built with ❤️ for the TypeScript community
- Special thanks to all contributors and testers

---

## 📞 Support

- 🐛 **Issues:** https://github.com/lutfian-rhdn/hexa-framework/issues
- 📚 **Documentation:** https://github.com/lutfian-rhdn/hexa-framework
- 💬 **Discussions:** https://github.com/lutfian-rhdn/hexa-framework/discussions
- 📧 **Email:** lutfian.rhdn@gmail.com

---

## 🔗 Links

- **npm Package:** https://www.npmjs.com/package/create-hexa-framework-app
- **GitHub Repository:** https://github.com/lutfian-rhdn/hexa-framework
- **Documentation:** [HEXA_CLI_GUIDE.md](./HEXA_CLI_GUIDE.md)
- **Changelog:** [CHANGELOG.md](./CHANGELOG.md)

---

## 📄 License

MIT © 2025 lutfian.rhdn

---

**🎉 Happy coding with Hexa Framework v2.1.1!**

The most productive way to build TypeScript APIs with hexagonal architecture.
