# Panduan Publishing Hexa Framework

Dokumen ini berisi langkah-langkah lengkap untuk mempublikasikan Hexa Framework ke GitHub dan npm.

## Status Saat Ini

✅ **Sudah Selesai:**
- Framework code lengkap
- 3 package siap publish (@hexa-framework/core, @hexa-framework/cli, create-hexa-app)
- 6 dokumentasi lengkap dalam Bahasa Indonesia
- Git repository sudah diinisialisasi
- Semua file sudah di-commit

## Langkah 1: Publish ke GitHub

### 1.1 Buat Repository di GitHub

1. Buka https://github.com/new
2. Isi detail repository:
   - **Repository name**: `hexa-framework`
   - **Description**: `A TypeScript framework for building APIs with Hexagonal Architecture`
   - **Visibility**: Public
   - **JANGAN centang** "Initialize this repository with a README"
3. Klik **Create repository**

### 1.2 Push Code ke GitHub

Jalankan perintah berikut di terminal (di folder `hexa-framework`):

```bash
# Tambahkan remote origin (ganti USERNAME dengan username GitHub Anda)
git remote add origin https://github.com/USERNAME/hexa-framework.git

# Push ke GitHub
git branch -M main
git push -u origin main
```

**Contoh jika username GitHub adalah lutfianrhdn:**
```bash
git remote add origin https://github.com/lutfianrhdn/hexa-framework.git
git branch -M main
git push -u origin main
```

### 1.3 Verifikasi

Buka https://github.com/USERNAME/hexa-framework dan pastikan semua file sudah terupload.

## Langkah 2: Persiapan Publish ke npm

### 2.1 Cek npm Login Status

```bash
npm whoami
```

**Jika belum login:**
```bash
npm login
```

Masukkan:
- Username npm Anda
- Password
- Email
- One-time password (jika menggunakan 2FA)

### 2.2 Test Build Semua Package

Pastikan semua package sudah ter-build dengan benar:

```bash
# Test build core
cd packages/core
npm run build

# Test build cli
cd ../cli
npm run build

# Test build create-hexa-app
cd ../../create-hexa-app
npm run build

# Kembali ke root
cd ..
```

## Langkah 3: Publish ke npm

### 3.1 Publish @hexa-framework/core

```bash
cd packages/core
npm publish --access public
cd ../..
```

**Output yang diharapkan:**
```
+ @hexa-framework/core@1.0.0
```

### 3.2 Publish @hexa-framework/cli

```bash
cd packages/cli
npm publish --access public
cd ../..
```

**Output yang diharapkan:**
```
+ @hexa-framework/cli@1.0.0
```

### 3.3 Publish create-hexa-app

```bash
cd create-hexa-app
npm publish --access public
cd ..
```

**Output yang diharapkan:**
```
+ create-hexa-app@1.0.0
```

## Langkah 4: Test Installation

### 4.1 Test dengan npx

Buat folder baru di luar project hexa-framework:

```bash
# Pindah ke direktori lain
cd ..
mkdir test-hexa
cd test-hexa

# Test create-hexa-app
npx create-hexa-app my-test-api
```

### 4.2 Test Generated Project

```bash
cd my-test-api

# Install dependencies
npm install

# Setup database
# Edit .env file terlebih dahulu, lalu:
npx prisma generate
npx prisma migrate dev --name init

# Test code generation
npx hexa generate

# Pilih:
# Resource name: Post
# Fields:
#   - title (string, required)
#   - content (string, required)
#   - published (boolean, optional)

# Run development server
npm run dev

# Test API (di terminal lain)
curl http://localhost:3000/api/v1/health
```

## Langkah 5: Update GitHub Repository

### 5.1 Tambahkan Topics di GitHub

1. Buka repository di GitHub
2. Klik ⚙️ (Settings) di sebelah kanan "About"
3. Tambahkan topics:
   - `typescript`
   - `hexagonal-architecture`
   - `express`
   - `api-framework`
   - `nodejs`
   - `prisma`
   - `clean-architecture`

### 5.2 Tambahkan Description

Set description: "A TypeScript framework for building APIs with Hexagonal Architecture"

### 5.3 Tambahkan Website

Set website: `https://www.npmjs.com/package/@hexa-framework/core`

## Troubleshooting

### Error: Package name already exists

Jika nama package sudah diambil orang lain, Anda perlu menggunakan scoped package:

1. Edit `packages/core/package.json`:
   ```json
   "name": "@yourusername/hexa-framework-core"
   ```

2. Edit `packages/cli/package.json`:
   ```json
   "name": "@yourusername/hexa-framework-cli"
   ```

3. Edit `create-hexa-app/package.json`:
   ```json
   "name": "@yourusername/create-hexa-app"
   ```

4. Edit `create-hexa-app/src/index.ts`, update dependency:
   ```typescript
   "@yourusername/hexa-framework-core": "^1.0.0"
   ```

5. Rebuild dan publish ulang

### Error: 401 Unauthorized

Anda belum login ke npm. Jalankan:
```bash
npm login
```

### Error: 402 Payment Required

Anda mencoba publish scoped package (`@username/package`) tapi npm Anda bukan Pro account. Solusi:
1. Gunakan nama package tanpa scope
2. Atau publish dengan `--access public`

## Verifikasi Final

Pastikan semua package berhasil:

1. **Check npm:**
   - https://www.npmjs.com/package/@hexa-framework/core
   - https://www.npmjs.com/package/@hexa-framework/cli
   - https://www.npmjs.com/package/create-hexa-app

2. **Check GitHub:**
   - https://github.com/USERNAME/hexa-framework

3. **Test installation:**
   ```bash
   npx create-hexa-app test-app
   cd test-app
   npm install
   npx hexa generate
   npm run dev
   ```

## Maintenance

### Update Version

Untuk update framework di kemudian hari:

```bash
# Update version di semua package.json
# packages/core/package.json
# packages/cli/package.json
# create-hexa-app/package.json

# Rebuild
cd packages/core && npm run build
cd ../cli && npm run build
cd ../../create-hexa-app && npm run build

# Commit changes
git add .
git commit -m "chore: bump version to 1.0.1"
git push

# Publish
cd packages/core && npm publish
cd ../cli && npm publish
cd ../../create-hexa-app && npm publish
```

## Selesai! 🎉

Framework Anda sekarang sudah tersedia untuk digunakan oleh siapa saja:

```bash
npx create-hexa-app my-awesome-api
```

Untuk dokumentasi lengkap, arahkan user ke:
- GitHub: https://github.com/USERNAME/hexa-framework
- npm: https://www.npmjs.com/package/@hexa-framework/core
