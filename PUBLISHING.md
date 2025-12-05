# 📦 Publishing Guide - Hexa Framework

Panduan lengkap untuk publish Hexa Framework ke GitHub dan npm.

## 📋 Prerequisites

### 1. GitHub Account
- Buat akun di https://github.com jika belum punya
- Install Git di local: https://git-scm.com/

### 2. npm Account
- Buat akun di https://www.npmjs.com
- Verifikasi email
- Login via terminal: `npm login`

## 🔄 Step 1: Push ke GitHub

### 1.1 Create GitHub Repository

**Via GitHub Web:**
1. Buka https://github.com/new
2. Repository name: `hexa-framework`
3. Description: `Hexagonal Architecture TypeScript Framework`
4. Set: Public
5. **JANGAN** pilih "Initialize with README" (karena kita sudah punya)
6. Klik "Create repository"

### 1.2 Push Code

```bash
# Add remote repository
git remote add origin https://github.com/lutfianrhdn/hexa-framework.git

# Push code
git push -u origin master
```

### 1.3 Verify

- Buka https://github.com/lutfianrhdn/hexa-framework
- Pastikan semua file sudah ada
- Check README tampil dengan baik

## 📦 Step 2: Publish ke npm

### 2.1 Login to npm

```bash
npm login
# Username: (masukkan username npm)
# Password: (masukkan password)
# Email: (masukkan email)
```

Verify login:
```bash
npm whoami
# Output: username-kamu
```

### 2.2 Publish @hexa-framework/core

```bash
cd packages/core
npm publish --access public
```

**Expected Output:**
```
+ @hexa-framework/core@1.0.0
```

**Verify:**
```bash
npm view @hexa-framework/core
```

### 2.3 Publish @hexa-framework/cli

```bash
cd ../cli
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

### 2.4 Publish create-hexa-app

```bash
cd ../../create-hexa-app
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

## ✅ Step 3: Verify Installation

### 3.1 Test create-hexa-app

```bash
# Buat folder temporary
mkdir D:\temp-test
cd D:\temp-test

# Test npx command
npx create-hexa-app test-blog-api

# Ikuti prompt
# Project name: test-blog-api

# Verify project created
cd test-blog-api
dir
```

### 3.2 Test @hexa-framework/cli

```bash
# Install CLI globally
npm install -g @hexa-framework/cli

# Test generate command
hexa generate

# Pilih:
# - Resource name: post
# - Fields: title (required), content (required)

# Verify files generated
dir src\core\entities
dir src\core\services
```

### 3.3 Test @hexa-framework/core

Check package.json di project yang sudah dibuat:
```json
{
  "dependencies": {
    "@hexa-framework/core": "^1.0.0"
  }
}
```

Run:
```bash
npm install
npm run dev
```

**Expected:** Server running di http://localhost:3000

## 🐛 Troubleshooting

### Error: Package name already taken

**Solusi 1: Use scoped package (Recommended)**
```json
{
  "name": "@your-username/hexa-framework-core"
}
```

**Solusi 2: Add suffix**
```json
{
  "name": "hexa-framework-core-ts"
}
```

### Error: 402 Payment Required

**Cause:** Trying to publish scoped package without public access

**Fix:**
```bash
npm publish --access public
```

### Error: 403 Forbidden

**Cause 1:** Not logged in
```bash
npm login
```

**Cause 2:** No permission
- Package sudah ada dan milik orang lain
- Gunakan nama package berbeda

### Error: ENEEDAUTH

**Fix:**
```bash
npm logout
npm login
```

### Build errors before publish

**Core/CLI package:**
```bash
cd packages/core  # atau packages/cli
npm run clean
npm install
npm run build
```

**create-hexa-app:**
```bash
cd create-hexa-app
npm install
npm run build
```

## 🔄 Update Package (Future)

### 1. Update Version

**Patch (bug fix):** 1.0.0 → 1.0.1
```bash
npm version patch
```

**Minor (new feature):** 1.0.0 → 1.1.0
```bash
npm version minor
```

**Major (breaking changes):** 1.0.0 → 2.0.0
```bash
npm version major
```

### 2. Rebuild

```bash
npm run build
```

### 3. Publish Update

```bash
npm publish
```

### 4. Push Tag to GitHub

```bash
git push
git push --tags
```

## 📝 Post-Publishing Checklist

- [ ] ✅ GitHub repository created and pushed
- [ ] ✅ @hexa-framework/core published to npm
- [ ] ✅ @hexa-framework/cli published to npm
- [ ] ✅ create-hexa-app published to npm
- [ ] ✅ Test `npx create-hexa-app` works
- [ ] ✅ Test `npm install -g @hexa-framework/cli` works
- [ ] ✅ Update README badges dengan npm version
- [ ] ✅ Create GitHub Release (optional)
- [ ] ✅ Share on social media (optional)

## 🎉 Selamat!

Framework sudah published dan siap digunakan!

### Share Commands:

```bash
# Quick Start
npx create-hexa-app my-api

# Install CLI
npm install -g @hexa-framework/cli

# Generate Resource
hexa generate resource user
```

### Links:
- **GitHub:** https://github.com/lutfianrhdn/hexa-framework
- **npm Core:** https://npmjs.com/package/@hexa-framework/core
- **npm CLI:** https://npmjs.com/package/@hexa-framework/cli
- **npm Starter:** https://npmjs.com/package/create-hexa-app

---

**Created with ❤️ by lutfian.rhdn**
