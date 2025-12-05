# Changelog

All notable changes to the Hexa Framework CLI will be documented in this file.

## [1.2.0] - 2024-12-05

### 🎉 Added - Adapter & Transport Layer Generation

This release adds powerful commands to generate adapters and transport layers following hexagonal architecture principles.

### Added

#### Adapter Commands (New!)
- **make:adapter** - Create adapter classes for external integrations
  - `hexa make:adapter <name>` - Default database adapter
  - `hexa make:adapter <name> --type database` - Database/Repository adapter with Prisma
  - `hexa make:adapter <name> --type cache` - Cache adapter with TTL support
  - `hexa make:adapter <name> --type messaging` - Message queue/pub-sub adapter
  - `hexa make:adapter <name> --type queue` - Queue adapter
  - Custom types supported for any external service

#### Transport Commands (New!)
- **make:transport** - Create transport layer for different protocols
  - `hexa make:transport <name>` - Default HTTP/REST transport with Express router
  - `hexa make:transport <name> --type http` - HTTP REST API transport
  - `hexa make:transport <name> --type rest` - REST API transport (alias)
  - `hexa make:transport <name> --type graphql` - GraphQL schema and resolvers
  - `hexa make:transport <name> --type grpc` - gRPC service implementation
  - `hexa make:transport <name> --type websocket` - WebSocket real-time transport

### Templates Included

#### Adapter Templates
1. **Database Adapter** - Full CRUD with Prisma client integration
2. **Cache Adapter** - In-memory cache with TTL and expiration
3. **Messaging Adapter** - Pub/sub pattern with subscribe/unsubscribe
4. **Generic Adapter** - Flexible template for any external service

#### Transport Templates
1. **HTTP/REST Transport** - Complete Express router with CRUD routes
2. **GraphQL Transport** - Type definitions, queries, and mutations
3. **gRPC Transport** - Service interface with RPC methods
4. **WebSocket Transport** - Real-time bidirectional communication
5. **Generic Transport** - Flexible template for custom protocols

### Enhanced
- Updated help command with new make:adapter and make:transport
- Improved command descriptions and examples
- Better type safety and error handling

### Architecture Benefits
- **Hexagonal Architecture** - Clean separation between core logic and external concerns
- **Port & Adapter Pattern** - Adapters implement ports (interfaces) for external systems
- **Transport Layer** - Independent communication protocols without core logic coupling
- **Testability** - Easy to mock adapters and transports for testing
- **Flexibility** - Switch implementations without changing core business logic

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
