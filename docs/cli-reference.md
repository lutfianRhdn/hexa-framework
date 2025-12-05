# 🛠️ CLI Reference

> Dokumentasi lengkap untuk Hexa CLI

## Installation

### Global Installation

```bash
npm install -g @hexa-framework/cli
```

Setelah install global, gunakan command `hexa`:

```bash
hexa --version
hexa --help
```

### npx (Tanpa Install)

```bash
npx @hexa-framework/cli generate
```

## Commands

### `hexa generate`

Generate resource lengkap dengan semua files yang dibutuhkan.

#### Syntax

```bash
hexa generate [options]
hexa g [options]  # shorthand
```

#### Interactive Mode

```bash
hexa generate
```

CLI akan menanyakan:

1. **Resource name** (singular, e.g., "Post", "User", "Product")
2. **Field definitions** (name, type, optional, array)

#### Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--name <name>` | `-n` | Resource name | Interactive |
| `--skip-migration` | `-s` | Skip Prisma migration | `false` |
| `--output <dir>` | `-o` | Output directory | `./src` |

#### Examples

**Basic Usage:**

```bash
hexa generate
# > Resource name: Post
# > Add field? Yes
# > Field name: title
# > Field type: string
# > Optional? No
# > Array? No
```

**With Options:**

```bash
hexa generate --name User --skip-migration
```

**Using Shorthand:**

```bash
hexa g -n Product -o ./app
```

#### Generated Files

Command ini akan generate 8 files:

```
src/
├── core/
│   ├── entities/
│   │   └── post/
│   │       └── post.ts                    # ✅ Types & interfaces
│   ├── repositories/
│   │   └── post.ts                        # ✅ Repository interface
│   └── services/
│       └── PostService.ts                 # ✅ Business logic
├── adapters/
│   └── postgres/
│       └── repositories/
│           └── PostRepository.ts          # ✅ Prisma implementation
├── transports/
│   └── api/
│       ├── controllers/
│       │   └── PostController.ts          # ✅ REST controller
│       ├── routers/
│       │   └── v1/
│       │       └── post.ts                # ✅ Express routes
│       └── validations/
│           └── post.ts                    # ✅ Zod schemas
└── mappers/
    └── response/
        └── PostResponseMapper.ts          # ✅ Response transformer
```

#### Field Types

Supported field types:

| Type | Description | Example | Prisma Type |
|------|-------------|---------|-------------|
| `string` | Text data | "Hello" | `String` |
| `number` | Integer or float | 42, 3.14 | `Int`, `Float` |
| `boolean` | True/false | true | `Boolean` |
| `date` | Date/time | 2025-01-01 | `DateTime` |

#### Field Modifiers

- **Optional**: Field can be `null` or `undefined`
- **Array**: Field is an array of values

```bash
# String field, required
title: string

# Optional string
description: string?

# Array of strings
tags: string[]

# Optional array
categories: string[]?
```

### `hexa permission scan`

Scan codebase untuk menemukan semua permissions yang digunakan.

#### Syntax

```bash
hexa permission scan [options]
```

#### Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--path <path>` | `-p` | Directory to scan | `./src` |
| `--output <file>` | `-o` | Output file | Console |
| `--format <format>` | `-f` | Output format (json, yaml, csv) | `json` |

#### Examples

```bash
# Scan default directory
hexa permission scan

# Scan specific path
hexa permission scan -p ./src/transports

# Output to file
hexa permission scan -o permissions.json

# YAML output
hexa permission scan -f yaml -o permissions.yaml
```

#### Output Example

```json
{
  "permissions": [
    {
      "name": "post:read",
      "file": "src/transports/api/routers/v1/post.ts",
      "line": 12,
      "route": "GET /api/v1/posts"
    },
    {
      "name": "post:create",
      "file": "src/transports/api/routers/v1/post.ts",
      "line": 18,
      "route": "POST /api/v1/posts"
    }
  ],
  "total": 2
}
```

### `hexa permission verify`

Verify bahwa semua permissions sudah terdefinisi di database.

#### Syntax

```bash
hexa permission verify [options]
```

#### Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--fix` | `-f` | Auto-create missing permissions | `false` |
| `--database <url>` | `-d` | Database connection | `.env` |

#### Examples

```bash
# Check only
hexa permission verify

# Auto-fix missing permissions
hexa permission verify --fix

# Use custom database
hexa permission verify -d postgres://user:pass@localhost:5432/db
```

#### Output Example

```
✅ post:read - Found in database
✅ post:create - Found in database
❌ post:delete - NOT FOUND

Missing: 1 permission(s)

Run with --fix to create missing permissions
```

With `--fix`:

```
✅ post:read - Found
✅ post:create - Found
⚠️  post:delete - Created

✨ Done! All permissions verified.
```

### `hexa info`

Display informasi tentang project dan framework.

#### Syntax

```bash
hexa info [options]
```

#### Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--verbose` | `-v` | Show detailed info |
| `--json` | `-j` | Output as JSON |

#### Examples

```bash
# Basic info
hexa info

# Detailed info
hexa info --verbose

# JSON output
hexa info --json
```

#### Output Example

```
Hexa Framework Info
===================

Framework Version: 1.0.0
CLI Version: 1.0.0
Node Version: v18.17.0

Project Info:
  Name: my-api
  Type: Hexa Framework Project
  TypeScript: 5.3.3
  
Dependencies:
  @hexa-framework/core: ^1.0.0
  express: ^4.18.2
  prisma: ^5.7.0
  
Database:
  Provider: PostgreSQL
  Status: Connected ✅
  
Resources:
  - User (5 files)
  - Post (8 files)
  - Comment (8 files)
  
Total Files: 21
```

## Global Options

Options yang tersedia untuk semua commands:

| Option | Alias | Description |
|--------|-------|-------------|
| `--version` | `-V` | Show version number |
| `--help` | `-h` | Show help |
| `--no-color` | | Disable colors |
| `--silent` | | Suppress output |

## Configuration File

Buat file `.hexarc.json` di root project untuk custom configuration:

```json
{
  "generate": {
    "outputDir": "./src",
    "skipMigration": false,
    "templates": {
      "entity": "./templates/custom-entity.template.ts"
    }
  },
  "permission": {
    "scanPath": "./src",
    "outputFormat": "json"
  }
}
```

### Configuration Options

#### generate

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `outputDir` | string | Output directory for generated files | `./src` |
| `skipMigration` | boolean | Skip Prisma migration after generate | `false` |
| `templates` | object | Custom template paths | Built-in |

#### permission

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `scanPath` | string | Directory to scan for permissions | `./src` |
| `outputFormat` | string | Output format (json, yaml, csv) | `json` |

## Environment Variables

CLI akan membaca environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `HEXA_OUTPUT_DIR` | Default output directory | `./src` |
| `HEXA_SKIP_MIGRATION` | Skip migration by default | `false` |
| `DATABASE_URL` | Database connection string | From `.env` |
| `HEXA_NO_COLOR` | Disable colored output | `false` |

## Workflow Examples

### 1. Create New Resource

```bash
# Step 1: Generate resource
hexa generate
# > Resource: Post
# > Fields: title (string), content (string), published (boolean)

# Step 2: Update Prisma schema (auto-generated)
# File: prisma/schema.prisma

# Step 3: Run migration
npx prisma migrate dev --name add-post

# Step 4: Import router
# File: src/transports/api/routers/v1/index.ts
import postRouter from './post';
app.use('/posts', postRouter);

# Step 5: Test API
curl http://localhost:3000/api/v1/posts
```

### 2. Audit Permissions

```bash
# Step 1: Scan all permissions
hexa permission scan -o permissions.json

# Step 2: Review permissions
cat permissions.json

# Step 3: Verify against database
hexa permission verify

# Step 4: Fix missing permissions
hexa permission verify --fix
```

### 3. Project Info Check

```bash
# Quick check
hexa info

# Detailed check
hexa info --verbose

# Export to JSON
hexa info --json > project-info.json
```

## Troubleshooting

### Command Not Found

```bash
# Error: hexa: command not found

# Solution 1: Install globally
npm install -g @hexa-framework/cli

# Solution 2: Use npx
npx @hexa-framework/cli generate

# Solution 3: Check PATH
echo $PATH
# Should include npm global bin directory
```

### Permission Denied

```bash
# Error: EACCES: permission denied

# Solution: Use sudo (Unix/Mac)
sudo npm install -g @hexa-framework/cli

# Or fix npm permissions
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### Generate Fails

```bash
# Error: Cannot find output directory

# Solution: Make sure you're in project root
cd /path/to/project

# Or specify output directory
hexa generate -o ./src
```

### Prisma Migration Fails

```bash
# Error: Migration failed

# Solution 1: Check database connection
# Verify DATABASE_URL in .env

# Solution 2: Skip migration, run manually
hexa generate --skip-migration
npx prisma migrate dev

# Solution 3: Reset database (dev only!)
npx prisma migrate reset
```

## Tips & Tricks

### 1. Use Aliases

Add to `.bashrc` or `.zshrc`:

```bash
alias hg='hexa generate'
alias hps='hexa permission scan'
alias hpv='hexa permission verify'
alias hi='hexa info'
```

### 2. Custom Templates

Create custom templates:

```bash
# Create template file
touch templates/custom-entity.template.ts

# Configure in .hexarc.json
{
  "generate": {
    "templates": {
      "entity": "./templates/custom-entity.template.ts"
    }
  }
}

# Use custom template
hexa generate
```

### 3. CI/CD Integration

```yaml
# .github/workflows/verify-permissions.yml
name: Verify Permissions

on: [push, pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npx hexa permission verify
```

### 4. Pre-commit Hook

```bash
# .husky/pre-commit
#!/bin/sh

# Verify permissions before commit
npx hexa permission verify

if [ $? -ne 0 ]; then
  echo "❌ Permission verification failed!"
  exit 1
fi
```

## Advanced Usage

### Programmatic API

Use CLI functions in your code:

```typescript
import { generateResource } from '@hexa-framework/cli';

// Generate resource programmatically
await generateResource({
  name: 'Post',
  fields: [
    { name: 'title', type: 'string', optional: false, isArray: false },
    { name: 'content', type: 'string', optional: false, isArray: false }
  ],
  outputDir: './src',
  skipMigration: false
});
```

### Custom Commands

Extend CLI with custom commands:

```typescript
// scripts/custom-command.ts
import { Command } from 'commander';

const program = new Command();

program
  .command('custom')
  .description('My custom command')
  .action(() => {
    console.log('Custom command executed!');
  });

program.parse();
```

Run:

```bash
node scripts/custom-command.ts custom
```

---

Next: [API Reference](./api-reference.md)
