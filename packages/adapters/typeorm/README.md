# @hexa/adapter-typeorm

TypeORM database adapter for Hexa Framework.

## Installation

```bash
npm install @hexa/adapter-typeorm typeorm reflect-metadata
```

## Usage

### Setup Adapter

```typescript
import 'reflect-metadata';
import { TypeORMAdapter, createTypeORMAdapter } from '@hexa/adapter-typeorm';

const adapter = createTypeORMAdapter({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'mydb',
  username: 'user',
  password: 'pass',
  entities: ['src/entities/*.ts'],
  synchronize: false,
});

await adapter.connect();
const dataSource = adapter.getClient();
```

### Create Repository

```typescript
import { BaseTypeORMRepository } from '@hexa/adapter-typeorm';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ default: true })
  isActive: boolean;
}

class UserRepository extends BaseTypeORMRepository<User> {
  constructor(dataSource: DataSource) {
    super(dataSource, User);
  }
}
```
