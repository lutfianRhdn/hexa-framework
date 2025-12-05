# 🎯 DEPLOYMENT INSTRUCTIONS - READY TO EXECUTE

## ✅ Status Saat Ini

Framework **SUDAH SIAP** untuk di-publish! 

### Yang Sudah Selesai:
- ✅ @hexa-framework/core - Built successfully (0 errors)
- ✅ @hexa-framework/cli - Built successfully (0 errors)
- ✅ create-hexa-app - Built successfully (0 errors)
- ✅ 6 Dokumentasi lengkap (Bahasa Indonesia)
- ✅ Git repository initialized dan committed
- ✅ Package.json updated dengan repository info
- ✅ Publishing guide & README created

### Yang Perlu Dilakukan:
1. 🔄 Login ke npm
2. 🚀 Push ke GitHub
3. 📦 Publish 3 packages ke npm
4. ✅ Test instalasi

---

## 🚀 STEP-BY-STEP DEPLOYMENT

### STEP 1: Login to npm

```bash
# Login ke npm account
npm login
```

**Input yang diperlukan:**
- Username: [masukkan username npm Anda]
- Password: [masukkan password npm Anda]
- Email: [masukkan email npm Anda]
- OTP (jika 2FA enabled): [masukkan OTP code]

**Verify login:**
```bash
npm whoami
```
Expected: Menampilkan username npm Anda

---

### STEP 2: Create GitHub Repository

**Option A: Via GitHub Website (Recommended)**

1. Buka: https://github.com/new
2. **Repository name:** `hexa-framework`
3. **Description:** `Hexagonal Architecture TypeScript Framework for Building Backend APIs`
4. **Visibility:** Public
5. **PENTING:** JANGAN centang "Initialize this repository with a README"
6. Klik **"Create repository"**
7. **Copy URL** yang muncul (contoh: https://github.com/lutfian-rhdn/hexa-framework.git)

**Option B: Via GitHub CLI (jika punya gh CLI)**
```bash
gh repo create hexa-framework --public --description "Hexagonal Architecture TypeScript Framework"
```

---

### STEP 3: Push to GitHub

```bash
# Pastikan masih di directory hexa-framework
cd d:\projects\OPShapesite\hexa-framework

# Add remote (ganti URL dengan URL repository Anda)
git remote add origin https://github.com/lutfian-rhdn/hexa-framework.git

# Push ke GitHub
git push -u origin master
```

**Jika error "master" tidak ada, coba:**
```bash
git branch -M main
git push -u origin main
```

**Verify:** Buka https://github.com/lutfian-rhdn/hexa-framework dan pastikan semua file sudah ada.

---

### STEP 4: Publish @hexa-framework/core to npm

```bash
# Navigate ke core package
cd packages\core

# Publish
npm publish --access public
```

**Expected Output:**
```
npm notice
npm notice 📦  @hexa-framework/core@1.0.0
npm notice === Tarball Contents ===
npm notice ... [list of files]
npm notice === Tarball Details ===
npm notice name:          @hexa-framework/core
npm notice version:       1.0.0
npm notice filename:      hexa-framework-core-1.0.0.tgz
npm notice package size:  [size]
npm notice unpacked size: [size]
npm notice total files:   [count]
npm notice
+ @hexa-framework/core@1.0.0
```

**Verify:**
```bash
npm view @hexa-framework/core
```

**Jika error "package name taken":**
- Gunakan scoped package: `@your-username/hexa-framework-core`
- Edit `package.json` dan ganti name field
- Rebuild: `npm run build`
- Publish lagi

---

### STEP 5: Publish @hexa-framework/cli to npm

```bash
# Navigate ke CLI package
cd ..\cli

# Publish
npm publish --access public
```

**Expected Output:**
```
+ @hexa-framework/cli@1.0.0
```

**Verify:**
```bash
npm view @hexa-framework/cli
```

---

### STEP 6: Publish create-hexa-app to npm

```bash
# Navigate ke create-hexa-app
cd ..\..\create-hexa-app

# Publish
npm publish --access public
```

**Expected Output:**
```
+ create-hexa-app@1.0.0
```

**Verify:**
```bash
npm view create-hexa-app
```

---

### STEP 7: Test End-to-End

```bash
# Buat test directory
mkdir D:\temp-hexa-test
cd D:\temp-hexa-test

# Test create-hexa-app
npx create-hexa-app@latest test-blog-api

# Akan prompt: Enter project name
# Tekan Enter atau ketik: test-blog-api

# Navigate ke project
cd test-blog-api

# Check structure
dir

# Install dependencies (jika belum auto-install)
npm install

# Test CLI
npm install -g @hexa-framework/cli

# Generate resource
hexa generate

# Pilih:
# - Resource name: post
# - Add fields: y
# - Field name: title (type: string, required: y)
# - Field name: content (type: string, required: y)
# - Add more fields: n

# Check generated files
dir src\core\entities
dir src\core\services
dir src\transports\api\controllers

# Configure .env
copy .env.example .env
# Edit .env dengan text editor, isi DATABASE_URL dan JWT_SECRET

# Run dev server
npm run dev
```

**Expected:** Server running di `http://localhost:3000`

**Test health endpoint:**
```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Server is running",
  "data": {
    "uptime": "...",
    "timestamp": "..."
  }
}
```

---

## 🎉 SUCCESS CHECKLIST

Setelah semua step selesai, verify:

- [ ] ✅ npm login berhasil (`npm whoami` menampilkan username)
- [ ] ✅ GitHub repository created dan code ter-push
- [ ] ✅ @hexa-framework/core published ke npm
- [ ] ✅ @hexa-framework/cli published ke npm
- [ ] ✅ create-hexa-app published ke npm
- [ ] ✅ `npx create-hexa-app` works dan generate project
- [ ] ✅ `npm install -g @hexa-framework/cli` works
- [ ] ✅ `hexa generate` works dan generate files
- [ ] ✅ Generated project bisa run `npm run dev`
- [ ] ✅ Health endpoint response

---

## 🔗 Final Links

After successful deployment:

### npm Packages:
- **Core:** https://www.npmjs.com/package/@hexa-framework/core
- **CLI:** https://www.npmjs.com/package/@hexa-framework/cli
- **Starter:** https://www.npmjs.com/package/create-hexa-app

### GitHub:
- **Repository:** https://github.com/lutfian-rhdn/hexa-framework
- **Issues:** https://github.com/lutfian-rhdn/hexa-framework/issues
- **Docs:** https://github.com/lutfian-rhdn/hexa-framework/tree/master/docs

### Quick Start Commands:
```bash
# Create new project
npx create-hexa-app my-api

# Install CLI
npm install -g @hexa-framework/cli

# Generate resource
hexa generate resource user
```

---

## 🐛 Common Issues & Solutions

### Issue 1: npm login fails

**Error:** `ENEEDAUTH`

**Solution:**
```bash
npm logout
npm login
```

### Issue 2: Package name already taken

**Error:** `403 Forbidden - You do not have permission to publish`

**Solutions:**

**A. Use scoped package:**
Edit `package.json`:
```json
{
  "name": "@your-username/hexa-framework-core"
}
```

**B. Use different name:**
```json
{
  "name": "hexa-framework-ts"
}
```

Then rebuild and publish again:
```bash
npm run build
npm publish --access public
```

### Issue 3: Git push rejected

**Error:** `! [rejected] master -> master (fetch first)`

**Solution:**
```bash
git pull origin master --allow-unrelated-histories
git push -u origin master
```

### Issue 4: 402 Payment Required

**Error:** Publishing scoped package requires payment

**Solution:**
Add `--access public`:
```bash
npm publish --access public
```

### Issue 5: Build errors

**Solution:**
```bash
# Clean and rebuild
npm run clean
npm install
npm run build

# Then publish
npm publish --access public
```

---

## 📊 Publishing Statistics

**Total Files:** 42 files
**Total Lines:** ~7,329 lines of code
**Packages:** 3 (core, cli, create-hexa-app)
**Documentation:** 8 files (6 guides + 2 READMEs)

**Package Sizes:**
- @hexa-framework/core: ~50KB
- @hexa-framework/cli: ~80KB
- create-hexa-app: ~30KB

---

## 🎯 Post-Publishing Tasks (Optional)

### 1. Create GitHub Release

```bash
# Tag current version
git tag -a v1.0.0 -m "Release v1.0.0 - Initial public release"
git push origin v1.0.0
```

Then create release on GitHub:
1. Go to: https://github.com/lutfian-rhdn/hexa-framework/releases/new
2. Choose tag: v1.0.0
3. Title: `v1.0.0 - Initial Release`
4. Description: Copy from CHANGELOG or write release notes
5. Publish release

### 2. Add Badges to README

Update npm version badges after publishing (automatic).

### 3. Share Framework

Share on:
- Twitter/X
- LinkedIn
- Dev.to
- Reddit (r/typescript, r/node)
- Discord communities

**Sample Post:**
```
🚀 Introducing Hexa Framework v1.0.0!

A TypeScript framework for building scalable REST APIs with Hexagonal Architecture.

✨ Features:
- Clean Architecture (Ports & Adapters)
- Type-safe with TypeScript
- Code generation CLI
- JWT Auth + Permissions
- Prisma ORM support
- Full documentation in Bahasa Indonesia

Get started:
npx create-hexa-app my-api

GitHub: https://github.com/lutfian-rhdn/hexa-framework
npm: https://npmjs.com/package/create-hexa-app
```

---

## 📞 Need Help?

Jika ada masalah saat deployment:

1. Check error message di terminal
2. Lihat troubleshooting di atas
3. Check npm logs: `C:\Users\[username]\AppData\Local\npm-cache\_logs\`
4. Verify package.json configuration
5. Pastikan semua dependencies ter-install

---

**Ready to deploy? Follow STEP 1 above! 🚀**

**Created with ❤️ by lutfian.rhdn**
