# Changelog

All notable changes to the Hexa Framework CLI will be documented in this file.

## [1.1.0] - 2024-01-XX

### 🎉 Major Update - Laravel Artisan-like Commands

This release brings powerful Laravel Artisan-inspired commands to the Hexa Framework CLI, making it significantly more capable and developer-friendly.

### Added

#### Make Commands (New!)
- **make:controller** - Create a new controller class
  - `hexa make:controller <name>` - Basic controller
  - `hexa make:controller <name> -r` - Resource controller with CRUD methods
- **make:service** - Create a new service class
- **make:repository** - Create a new repository class with Prisma integration
- **make:entity** - Create a new entity/model class
- **make:middleware** - Create a new middleware function
- **make:dto** - Create a new Data Transfer Object class

#### Database Commands (New!)
- **migrate** - Run database migrations with optional seeding
- **migrate:fresh** - Drop all tables and re-run migrations
- **migrate:reset** - Reset database and re-run all migrations
- **migrate:rollback** - Display rollback information (Prisma note)
- **migrate:status** - Show the status of each migration
- **db:seed** - Seed the database with records

#### Development Commands (New!)
- **serve** - Start development server with hot reload (nodemon)
  - Supports custom port and host configuration
  - Automatic file watching
- **build** - Build the project for production

#### List/Info Commands (New!)
- **route:list** - Display all registered routes in a formatted table
  - Shows HTTP methods with color coding
  - Displays route paths and handlers
- **controller:list** - List all controllers in the project
- **middleware:list** - List all middleware in the project

### Enhanced
- **info/about** command now displays categorized command list
- Better help documentation for all commands
- Improved error handling and user feedback with spinners

### Changed
- Updated CLI description to emphasize "Like Laravel Artisan for TypeScript"
- Reorganized command structure for better discoverability
- Enhanced command output with colored formatting

### Dependencies
- Added `cli-table3` for beautiful table formatting in list commands

### Developer Experience
All new commands follow Laravel Artisan conventions:
- Intuitive naming (make:*, migrate:*, route:list, etc.)
- Consistent option patterns
- Helpful command descriptions
- Smart code generation with proper naming conventions (PascalCase, camelCase, kebab-case)

## [1.0.2] - 2024-01-XX

### Fixed
- GitHub repository URL corrections
- Package metadata updates

## [1.0.1] - 2024-01-XX

### Added
- Initial CLI release
- Basic generate command for resource scaffolding
- Permission scanning and verification

## [1.0.0] - 2024-01-XX

### Added
- Initial release of Hexa Framework CLI
- Code generation capabilities
- Project scaffolding tools
