# @hexa/transport-graphql

GraphQL transport layer for Hexa Framework using Apollo Server.

> ⚠️ **This package is a placeholder** - Full implementation coming in v2.0

## Planned Features

- Apollo Server 4 integration
- Auto-generate schema from entities
- BaseResolver class
- Authentication context
- DataLoader support for N+1 prevention

## Installation (Coming Soon)

```bash
npm install @hexa/transport-graphql @apollo/server graphql
```

## Planned Usage

```typescript
import { GraphQLTransport, BaseResolver } from '@hexa/transport-graphql';

class UserResolver extends BaseResolver<User> {
  async findAll({ page, limit }) {
    return this.userService.findAll(page, limit);
  }
  
  async findById(id) {
    return this.userService.findById(id);
  }
}
```

## Contributing

We welcome contributions! If you'd like to help implement this package:

1. Fork the repository
2. Check the issues for `transport-graphql` tasks
3. Submit a PR

Visit: https://github.com/lutfianrhdn/hexa-framework
