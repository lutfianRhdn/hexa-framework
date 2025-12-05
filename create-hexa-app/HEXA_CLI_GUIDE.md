# 🚀 Hexa CLI - Powerful Development Tools

The Hexa Framework now includes a powerful CLI similar to PHP Artisan, Laravel's command-line interface. This CLI provides code generation, database management, and development tools to accelerate your development workflow.

## 📦 Installation

The Hexa CLI is automatically included when you create a new project with `create-hexa-framework-app`:

```bash
npx create-hexa-framework-app my-project
cd my-project
```

## 🎯 Quick Start

### Interactive Mode

Run the CLI without arguments to enter interactive mode:

```bash
npm run hexa
```

This will show you a menu of available commands.

### Direct Commands

Run commands directly:

```bash
npm run hexa list                    # Show all commands
npm run hexa generate crud Product   # Generate complete CRUD
npm run hexa db migrate              # Run migrations
npm run hexa serve                   # Start dev server
```

## 📚 Available Commands

### 🏗️ Generate Commands

#### `hexa generate crud <name>` ⭐ **RECOMMENDED**

Generate a complete CRUD system including:
- Entity (TypeScript interface + DTOs)
- Repository interface
- Repository implementation (Prisma-based)
- Service layer (business logic)
- Controller (REST) or Resolver (GraphQL)
- Router
- Validation schemas (Zod)
- Prisma model

**Example:**

```bash
npm run hexa generate crud Product -- --fields "name:string,price:number,stock:number,description:string?"
```

**Options:**
- `--fields <fields>` - Comma-separated fields with types (e.g., name:string,age:number)
- `--transport <type>` - rest, graphql, or websocket
- `--database <type>` - postgresql, mysql, mongodb, or sqlite

**Generated Files:**
1. `src/core/entities/<name>/<Name>.ts` - Entity + DTOs
2. `src/core/interfaces/I<Name>Repository.ts` - Repository interface
3. `src/adapters/repositories/<Name>Repository.ts` - Repository implementation
4. `src/core/services/<Name>Service.ts` - Business logic
5. `src/transports/api/controllers/<Name>Controller.ts` - Controller
6. `src/transports/api/routers/<name>.router.ts` - Router
7. `src/transports/api/validations/<name>.schema.ts` - Zod schemas
8. `prisma/schema.prisma` - Prisma model appended

**Field Types:**
- `string` - Text field
- `number` - Integer field
- `float` - Decimal field
- `boolean` - True/false field
- `date` - DateTime field
- Add `?` after type for optional fields (e.g., `description:string?`)

#### `hexa generate controller <name>`

Generate only a controller:

```bash
npm run hexa g c ProductController
npm run hexa g c ProductController -- --template graphql
```

**Aliases:** `g c`

#### Other Generate Commands

```bash
npm run hexa g service <name>        # Generate service
npm run hexa g repository <name>     # Generate repository
npm run hexa g entity <name>         # Generate entity
npm run hexa g middleware <name>     # Generate middleware
npm run hexa g dto <name>            # Generate DTOs
```

**Note:** These are placeholder commands. Use `generate crud` for complete code generation.

### 🗄️ Database Commands

#### `hexa db migrate`

Run database migrations:

```bash
npm run hexa db migrate
npm run hexa db migrate -- --name add_products_table
```

Equivalent to: `npx prisma generate && npx prisma migrate dev`

#### `hexa db migrate:fresh`

Drop all tables and re-run migrations (⚠️ **WARNING: Destroys all data**):

```bash
npm run hexa db migrate:fresh
```

Equivalent to: `npx prisma migrate reset --force`

#### `hexa db migrate:reset`

Rollback and re-run all migrations:

```bash
npm run hexa db migrate:reset
```

#### `hexa db seed`

Seed the database:

```bash
npm run hexa db seed
```

**Note:** Make sure you have a seed script configured in `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

### ⚙️ Development Commands

#### `hexa serve`

Start development server with hot reload:

```bash
npm run hexa serve
npm run hexa serve -- --port 4000
```

**Options:**
- `--port <port>` - Port number (default: 3000)
- `--watch` - Watch for file changes (default: true)

**Alias:** `hexa dev`

#### `hexa build`

Build the application for production:

```bash
npm run hexa build
npm run hexa build -- --clean
```

**Options:**
- `--clean` - Clean dist folder before build

#### `hexa test`

Run tests:

```bash
npm run hexa test
npm run hexa test -- --watch
npm run hexa test -- --coverage
```

**Options:**
- `--watch` - Watch mode
- `--coverage` - Generate coverage report

#### `hexa list`

Show all available commands:

```bash
npm run hexa list
```

## 💡 Usage Tips

### 1. Use Shortcuts

The CLI supports command aliases:

```bash
npm run hexa g c Product        # generate controller
npm run hexa g s Product        # generate service
npm run hexa g repo Product     # generate repository
npm run hexa g e Product        # generate entity
npm run hexa g m Auth           # generate middleware
npm run hexa g d Product        # generate dto
npm run hexa g crud Product     # generate complete CRUD
```

### 2. Field Type Syntax

When generating CRUD, use this syntax for fields:

```bash
# Basic types
--fields "name:string,age:number,active:boolean"

# Optional fields (add ?)
--fields "name:string,bio:string?,email:string"

# Multiple word field names (use camelCase)
--fields "firstName:string,lastName:string,phoneNumber:string"

# Dates
--fields "name:string,birthDate:date,createdAt:date"

# Numbers
--fields "price:number,quantity:number,rating:float"
```

### 3. Complete CRUD Workflow

Here's a complete workflow for creating a new resource:

```bash
# 1. Generate CRUD
npm run hexa g crud Product -- --fields "name:string,price:number,stock:number,description:string?"

# 2. Generate Prisma client
npx prisma generate

# 3. Run migration
npx prisma migrate dev --name add_product

# 4. Register router (manually in src/transports/api/routers/index.ts)
# Add: import productRouter from './product.router';
# Add: router.use('/products', productRouter);

# 5. Build and run
npm run build
npm run dev

# 6. Test your endpoints
curl http://localhost:3000/api/products
```

### 4. Database Migration Workflow

```bash
# After modifying Prisma schema
npm run hexa db migrate -- --name your_migration_name

# If you need a fresh start (development only!)
npm run hexa db migrate:fresh

# Seed your database
npm run hexa db seed
```

### 5. Development Workflow

```bash
# Start development server
npm run hexa serve

# In another terminal, run tests
npm run hexa test -- --watch

# When ready for production
npm run hexa build
```

## 📁 Project Structure After Generation

When you generate a CRUD with `hexa generate crud Product`, here's what gets created:

```
your-project/
├── src/
│   ├── core/
│   │   ├── entities/
│   │   │   └── product/
│   │   │       ├── Product.ts           # ✅ Entity + DTOs
│   │   │       └── index.ts
│   │   ├── interfaces/
│   │   │   └── IProductRepository.ts    # ✅ Repository interface
│   │   └── services/
│   │       └── ProductService.ts        # ✅ Service layer
│   ├── adapters/
│   │   └── repositories/
│   │       └── ProductRepository.ts     # ✅ Repository implementation
│   └── transports/
│       └── api/
│           ├── controllers/
│           │   └── ProductController.ts # ✅ Controller
│           ├── routers/
│           │   └── product.router.ts    # ✅ Router
│           └── validations/
│               └── product.schema.ts    # ✅ Zod schemas
└── prisma/
    └── schema.prisma                    # ✅ Model added

✅ 7 files + 1 Prisma model generated!
```

## 🎨 Customization

### Adding Custom Commands

You can extend the CLI by adding new commands in the `cli/commands` directory:

1. Create your command file: `cli/commands/my-command.ts`
2. Export the command function
3. Import and register it in `cli/hexa-cli.ts`

### Modifying Templates

The CLI uses templates from `cli/templates/`. You can customize these templates to match your coding style.

## 🔧 Troubleshooting

### CLI Not Found

If `npm run hexa` doesn't work:

1. Make sure you're in the project directory
2. Check if `cli/hexa-cli.ts` exists
3. Run `npm install` to ensure dependencies are installed

### TypeScript Errors

If you get TypeScript errors when generating code:

1. Make sure all dependencies are installed: `npm install`
2. Generate Prisma client: `npx prisma generate`
3. Check your `tsconfig.json` is properly configured

### Generated Files Not Compiling

1. Run `npm run build` to see specific errors
2. Make sure imported paths match your project structure
3. Update path aliases in `tsconfig.json` if needed

## 📖 Comparison with PHP Artisan

| Feature | PHP Artisan | Hexa CLI |
|---------|-------------|----------|
| Generate CRUD | `php artisan make:model Product -mcr` | `npm run hexa g crud Product` |
| Generate Controller | `php artisan make:controller` | `npm run hexa g controller` |
| Run Migrations | `php artisan migrate` | `npm run hexa db migrate` |
| Fresh Database | `php artisan migrate:fresh` | `npm run hexa db migrate:fresh` |
| Seed Database | `php artisan db:seed` | `npm run hexa db seed` |
| Dev Server | `php artisan serve` | `npm run hexa serve` |
| List Commands | `php artisan list` | `npm run hexa list` |

## 🚀 Advanced Usage

### Generate Multiple Resources

```bash
npm run hexa g crud Product -- --fields "name:string,price:number"
npm run hexa g crud Category -- --fields "name:string,description:string?"
npm run hexa g crud Order -- --fields "userId:number,total:number,status:string"
```

### Custom Database Types

```bash
# MongoDB (uses string IDs)
npm run hexa g crud User -- --database mongodb

# PostgreSQL (uses integer IDs)
npm run hexa g crud User -- --database postgresql

# MySQL
npm run hexa g crud User -- --database mysql

# SQLite
npm run hexa g crud User -- --database sqlite
```

### GraphQL Instead of REST

```bash
npm run hexa g crud Product -- --transport graphql --fields "name:string,price:number"
```

This will generate a GraphQL resolver instead of a REST controller.

## 🎓 Examples

### E-commerce Product System

```bash
npm run hexa g crud Product -- --fields "name:string,description:string?,price:number,stock:number,categoryId:number,imageUrl:string?,isActive:boolean"
npm run hexa db migrate -- --name add_products
```

### Blog Post System

```bash
npm run hexa g crud Post -- --fields "title:string,content:string,excerpt:string?,authorId:number,published:boolean,publishedAt:date?"
npm run hexa db migrate -- --name add_posts
```

### User Management

```bash
npm run hexa g crud User -- --fields "email:string,name:string,bio:string?,avatar:string?,isVerified:boolean"
npm run hexa db migrate -- --name add_users
```

## 📝 Best Practices

1. **Always run migrations after generating CRUD:**
   ```bash
   npm run hexa g crud Product
   npx prisma migrate dev --name add_product
   ```

2. **Use descriptive field names:**
   ```bash
   # Good
   --fields "productName:string,unitPrice:number"
   
   # Avoid
   --fields "name:string,price:number"
   ```

3. **Mark optional fields:**
   ```bash
   --fields "name:string,description:string?,tags:string?"
   ```

4. **Test generated code:**
   ```bash
   npm run build
   npm run hexa test
   ```

5. **Use version control:**
   ```bash
   git add .
   git commit -m "Generated Product CRUD"
   ```

## 🎉 Conclusion

The Hexa CLI makes development with Hexa Framework as productive as Laravel's Artisan. Generate complete CRUD systems in seconds, manage your database with ease, and focus on building features instead of boilerplate code.

**Happy coding with Hexa Framework! 🚀**
