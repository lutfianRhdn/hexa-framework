# Changelog

All notable changes to the Hexa Framework CLI will be documented in this file.

## [1.3.0] - 2024-12-05

### 🧪 Added - Testing Commands & Test Generation

This release adds comprehensive testing support with Jest/Vitest integration and test file generation.

### Added

#### Test Commands (New!)
- **test** - Run all tests with coverage and watch options
  - `hexa test` - Run all tests
  - `hexa test --watch` - Run tests in watch mode
  - `hexa test --coverage` - Generate code coverage report
  - `hexa test --verbose` - Display individual test results
  - `hexa test --filter <pattern>` - Run tests matching pattern

- **test:unit** - Run unit tests only
  - `hexa test:unit` - Run all unit tests
  - `hexa test:unit --watch` - Watch mode for unit tests
  - `hexa test:unit --coverage` - Unit test coverage

- **test:integration** - Run integration tests only
  - `hexa test:integration` - Run all integration tests
  - `hexa test:integration --watch` - Watch mode for integration tests
  - `hexa test:integration --coverage` - Integration test coverage

- **test:e2e** - Run end-to-end tests only
  - `hexa test:e2e` - Run all E2E tests
  - `hexa test:e2e --watch` - Watch mode for E2E tests
  - `hexa test:e2e --coverage` - E2E test coverage

#### Make Test Command (New!)
- **make:test** - Generate test files for components
  - `hexa make:test <name>` - Generate test for service (default)
  - `hexa make:test <name> --type controller` - Generate controller test
  - `hexa make:test <name> --type service` - Generate service test
  - `hexa make:test <name> --type repository` - Generate repository test
  - `hexa make:test <name> --unit` - Generate unit test
  - `hexa make:test <name> --integration` - Generate integration test
  - `hexa make:test <name> --e2e` - Generate E2E test

### Features

#### Automatic Test Framework Setup
- Automatically detects and installs Jest if not present
- Creates `jest.config.js` with optimal TypeScript configuration
- Support for both Jest and Vitest test frameworks
- Configures test paths, coverage, and module mapping

#### Test Templates
1. **Unit Tests** - Isolated component testing
   - Service tests with business logic validation
   - Repository tests with database mocking
   - Controller tests with request/response mocking
   - Entity and DTO tests
   - Complete arrange-act-assert pattern

2. **Integration Tests** - Multi-component testing
   - End-to-end workflow testing
   - Database interaction testing
   - Transaction handling
   - External service integration
   - Error recovery scenarios

3. **E2E Tests** - Full application testing
   - HTTP endpoint testing with supertest
   - Authentication and authorization flows
   - CRUD operations validation
   - Error handling verification
   - Real API request/response testing

### Enhanced
- Updated CLI version to 1.3.0
- Added testing section to help command
- Improved command organization
- Better test discovery patterns
- Coverage reporting with text, lcov, and HTML formats

### Templates Included
- Comprehensive test templates for all component types
- Mock setup and teardown examples
- Best practices for test structure
- Proper TypeScript type definitions
- Jest matchers and assertions

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
