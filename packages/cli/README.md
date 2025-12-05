# @hexa-framework/cli

> CLI tool for Hexa Framework - Code generation and project scaffolding

## Installation

```bash
npm install -g @hexa-framework/cli
```

## Usage

### Generate Resource

Generate complete resource files (entity, repository, service, controller, router, validation, mapper):

```bash
# Interactive mode
hexa generate

# With resource name
hexa generate post

# Shorthand
hexa g product
```

### Permission Commands

```bash
# Scan routers and generate permissions.json
hexa permission scan

# Verify permission coverage
hexa permission verify
```

### Info

```bash
hexa info
```

## What Gets Generated?

When you run `hexa generate <resource>`, the CLI creates:

1. **Entity** (`src/core/entities/<resource>/<resource>.ts`)
   - Type definitions
   - Request/Response types

2. **Repository Interface** (`src/core/repositories/<resource>.ts`)
   - Repository contract

3. **Repository Adapter** (`src/adapters/postgres/repositories/<Resource>Repository.ts`)
   - Prisma implementation

4. **Service** (`src/core/services/<Resource>Service.ts`)
   - Business logic layer

5. **Controller** (`src/transports/api/controllers/<Resource>Controller.ts`)
   - REST API controller

6. **Router** (`src/transports/api/routers/v1/<resource>.ts`)
   - Express routes with middleware

7. **Validation** (`src/transports/api/validations/<resource>.ts`)
   - Zod schemas

8. **Mapper** (`src/mappers/<resource>/mapper.ts`)
   - Entity/Response transformation

## Example

```bash
$ hexa generate post

🔷 Hexa Framework - Resource Generator

✔ Resource name: post
✔ Field name: title
✔ Field type: string
✔ Is this field required? yes
✔ Field name: content
✔ Field type: string
✔ Is this field required? yes
✔ Field name:  (empty to finish)

✔ Generate 5 files for 'post'? yes

✔ Files generated successfully!

✅ Generated files:
  - src/core/entities/post/post.ts
  - src/core/repositories/post.ts
  - src/adapters/postgres/repositories/PostRepository.ts
  - src/core/services/PostService.ts
  - src/transports/api/controllers/PostController.ts
  - src/transports/api/routers/v1/post.ts
  - src/transports/api/validations/post.ts
  - src/mappers/post/

📝 Next steps:
  1. Add router to src/transports/api/routers/v1/index.ts
  2. Update Prisma schema if needed
  3. Run: npm run build
  4. Test your endpoints!
```

## License

MIT © lutfian.rhdn
