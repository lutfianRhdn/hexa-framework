# 📋 QUICK COMMANDS - Hexa Framework

Copy-paste commands untuk mulai menggunakan framework!

---

## 🎯 OPSI 1: Gunakan Lokal (Sudah Siap!)

```bash
# Create new project (sudah linked!)
cd d:\projects\test-hexa
create-hexa-app blog-api

# Setup project
cd blog-api
npm install
npm link @hexa-framework/core
npm link @hexa-framework/cli

# Configure environment
copy .env.example .env
# Edit .env dengan text editor favorit

# Setup database
npx prisma generate
npx prisma migrate dev --name init

# Generate resource
hexa generate
# ⚡ Input: Post
# ⚡ Fields: title (string, required), content (string, required), published (boolean)

# Run server
npm run dev

# Test API
curl http://localhost:3000/api/v1/health
curl http://localhost:3000/api/v1/posts
```

**✅ Done! API sudah berjalan!**

---

## 🌐 OPSI 2: Publish ke npm & GitHub

### Step 1: Push ke GitHub

```bash
cd d:\projects\OPShapesite\hexa-framework

# GANTI 'lutfianrhdn' dengan username GitHub Anda!
git remote add origin https://github.com/lutfianrhdn/hexa-framework.git
git branch -M main
git push -u origin main
```

### Step 2: Verify npm Login

```bash
npm whoami
# Output: lutfian.rhdn (sudah login!)
```

### Step 3: Publish Packages

```bash
# Publish @hexa-framework/core
cd packages\core
npm publish --access public
cd ..\..

# Publish @hexa-framework/cli  
cd packages\cli
npm publish --access public
cd ..\..

# Publish create-hexa-app
cd create-hexa-app
npm publish --access public
cd ..
```

### Step 4: Test Published Package

```bash
# Di direktori lain
cd ..
mkdir test-npm
cd test-npm

npx create-hexa-app my-test-api
cd my-test-api
npm install
npm run dev
```

**🎉 Published! Sekarang siapa saja bisa pakai!**

---

## 🔧 Daily Development Commands

```bash
# Generate new resource
hexa generate

# Generate permissions
hexa permission

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Prisma commands
npx prisma studio              # Open GUI
npx prisma generate            # Generate client
npx prisma migrate dev         # Run migration
npx prisma migrate deploy      # Deploy migration (production)

# Docker commands
docker-compose up -d           # Start containers
docker-compose down            # Stop containers
docker-compose logs -f         # View logs
```

---

## 🧪 Test Your Generated API

```bash
# Health check
curl http://localhost:3000/api/v1/health

# Create resource
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Hello\",\"content\":\"World\",\"published\":true}"

# Get all resources
curl http://localhost:3000/api/v1/posts

# Get one resource
curl http://localhost:3000/api/v1/posts/1

# Update resource
curl -X PUT http://localhost:3000/api/v1/posts/1 \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Updated\"}"

# Delete resource
curl -X DELETE http://localhost:3000/api/v1/posts/1
```

---

## 📚 Documentation Quick Access

```bash
# Open documentation
code docs\getting-started.md
code docs\architecture.md
code docs\cli-reference.md
code docs\api-reference.md
code docs\best-practices.md
code docs\deployment.md

# Open guides
code NEXT_STEPS.md
code PUBLISHING_GUIDE.md
code COMPLETION_SUMMARY.md
```

---

## 🚨 Troubleshooting

### Error: Package name already taken

```bash
# Use scoped package instead
# Edit all package.json:
# "@hexa-framework/core" → "@yourusername/hexa-framework-core"
# Then rebuild and republish
```

### Error: Command not found (hexa / create-hexa-app)

```bash
# Re-link packages
cd packages\cli
npm link
cd ..\..

cd create-hexa-app
npm link
cd ..
```

### Error: Cannot find module '@hexa-framework/core'

```bash
# In your project directory
npm link @hexa-framework/core
npm link @hexa-framework/cli
```

---

## ⚡ Speed Reference

| Command | Time | What it does |
|---------|------|--------------|
| `create-hexa-app my-api` | 1 min | Create full project |
| `hexa generate` | 30 sec | Generate CRUD resource |
| `npm run dev` | 5 sec | Start dev server |
| `npx prisma migrate dev` | 10 sec | Update database |

**Total time from zero to running API: ~2 minutes!** ⚡

---

## 🎯 Common Workflows

### Add New Resource

```bash
# 1. Update Prisma schema
code prisma\schema.prisma
# Add your model

# 2. Run migration
npx prisma migrate dev --name add_your_model

# 3. Generate code
hexa generate
# Input your resource details

# 4. Server auto-restarts (nodemon)
# Test your new endpoints!
```

### Deploy to Production

```bash
# 1. Build
npm run build

# 2. Set environment
set NODE_ENV=production

# 3. Run migrations
npx prisma migrate deploy

# 4. Start with PM2
pm2 start npm --name "my-api" -- start
```

### Update Framework Version

```bash
# In your project
npm update @hexa-framework/core
npm update @hexa-framework/cli

# Or specific version
npm install @hexa-framework/core@1.1.0
```

---

## 📦 Package Locations

```
Framework: d:\projects\OPShapesite\hexa-framework\
├── Core: packages\core\
├── CLI: packages\cli\
└── Creator: create-hexa-app\

Your Projects: anywhere you want!
Example: d:\projects\my-apis\blog-api\
```

---

## ✅ Checklist: Ready to Use?

- [x] Framework built successfully
- [x] Packages linked globally
- [x] npm login verified (lutfian.rhdn)
- [x] Documentation complete
- [x] Git repository initialized
- [ ] Pushed to GitHub (optional)
- [ ] Published to npm (optional)

**Current Status: ✅ READY TO USE LOCALLY!**

---

## 🎊 You're All Set!

Framework **Hexa Framework** sudah 100% siap digunakan!

**Start building now:**
```bash
create-hexa-app my-awesome-api
```

**Happy coding! 🚀**
