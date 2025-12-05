# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.1] - 2025-01-XX

### Fixed
- Added `cli-templates` directory to npm package files to ensure CLI templates are included in published package

## [2.1.0] - 2025-01-XX

### Added 🎉
- **Hexa CLI** - Powerful command-line interface similar to Laravel Artisan!
  - **Generator Commands:**
    - `hexa generate crud <name>` - Generate complete CRUD system (⭐ Star Feature!)
      - Creates 7 files: Entity, Repository Interface, Repository Implementation, Service, Controller, Router, Validation Schemas
      - Automatically updates Prisma schema with new model
      - Supports field definitions: `--fields "name:string,price:number,stock:number"`
      - Supports optional fields: `description:string?`
    - `hexa generate controller <name>` - Generate REST or GraphQL controller
    - `hexa generate service <name>` - Generate service layer
    - `hexa generate repository <name>` - Generate repository
    - `hexa generate entity <name>` - Generate entity
    - `hexa generate middleware <name>` - Generate middleware
    - `hexa generate dto <name>` - Generate DTOs
  - **Database Commands:**
    - `hexa db migrate` - Run database migrations
    - `hexa db migrate:fresh` - Drop all tables and re-run migrations
    - `hexa db migrate:reset` - Rollback and re-run migrations
    - `hexa db seed` - Seed the database
  - **Development Commands:**
    - `hexa serve` - Start development server
    - `hexa build` - Build for production
    - `hexa test` - Run tests
    - `hexa list` - Show all available commands
  - **Features:**
    - Interactive mode when run without arguments
    - Command shortcuts (e.g., `hexa g c` = `hexa generate controller`)
    - Smart project detection (auto-detects template, database, transports)
    - Type-safe code generation with proper TypeScript interfaces
    - Hexagonal architecture pattern enforcement
    - Colored console output with spinners
- **CLI Documentation:**
  - Added comprehensive `HEXA_CLI_GUIDE.md` with examples
  - Updated main README with CLI highlights
  - Included CLI usage in generated project README

### Changed
- Updated project generator to automatically include CLI in all new projects
- Modified package.json generator to add CLI scripts and bin entry
- Enhanced README generation to include CLI documentation section

### Technical Details
- CLI built with Commander.js for command parsing
- Uses Inquirer.js for interactive prompts
- Chalk for colored output
- Ora for loading spinners
- 16+ TypeScript files in modular architecture
- Separate TypeScript compilation for CLI (`cli/tsconfig.json`)

## [2.0.0] - 2025-01-XX

### Added
- **Template System:**
  - Full Auth template (JWT + Refresh Token)
  - Basic Auth template (Simple JWT)
  - Empty template (Blank Hexa project)
- **Database Support:**
  - PostgreSQL
  - MySQL
  - MongoDB
  - SQLite
- **Transport Layers:**
  - REST API (Express)
  - GraphQL (TypeGraphQL + Apollo)
  - WebSocket (Socket.io)
- **Project Generator:**
  - Interactive mode with inquirer prompts
  - CLI mode with command-line flags
  - Automatic dependency installation
  - Project structure scaffolding
  - README generation with usage instructions

### Changed
- Complete rewrite of project generator
- Improved error handling
- Better TypeScript type safety
- Enhanced project structure

## [1.0.0] - Initial Release

### Added
- Basic project scaffolding
- TypeScript support
- Express.js integration
- Prisma ORM setup
- Basic hexagonal architecture structure

---

## Legend

- 🎉 **Major Feature** - Significant new functionality
- ⭐ **Star Feature** - Highlighted feature
- 🐛 **Bug Fix** - Bug fixes
- 📝 **Documentation** - Documentation changes
- 🔧 **Maintenance** - Code maintenance and refactoring

