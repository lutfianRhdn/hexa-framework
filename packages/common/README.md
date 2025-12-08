# @hexa/common

Shared interfaces and types for the Hexa Framework ecosystem.

## Installation

```bash
npm install @hexa/common
```

## Usage

```typescript
import { 
  IRepository, 
  IDatabaseAdapter, 
  ITransport,
  IPlugin,
  IEventBus 
} from '@hexa/common';
```

## Interfaces

### Database Adapters
- `IDatabaseAdapter` - Base interface for all database adapters
- `DatabaseAdapterConfig` - Configuration options

### Repository
- `IRepository` - Generic repository interface
- `IBaseEntity` - Base entity type
- `PaginationResult` - Pagination response
- `QueryOptions` - Query parameters

### Transports
- `ITransport` - Base interface for all transports
- `RouteDefinition` - Route configuration
- `TransportOptions` - Transport configuration

### Plugins
- `IPlugin` - Base interface for all plugins
- `PluginConfig` - Plugin configuration
- `PluginMetadata` - Plugin information

### Events
- `IEventBus` - Event bus interface
- `IDomainEvent` - Domain event structure
- `EventHandler` - Event handler type

### Other
- `ILogger` - Logging interface
- `ICache` - Caching interface
- `ApiResponse` - Standard API response
