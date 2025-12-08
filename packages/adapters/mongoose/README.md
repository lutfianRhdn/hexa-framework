# @hexa/adapter-mongoose

Mongoose database adapter for Hexa Framework (MongoDB).

## Installation

```bash
npm install @hexa/adapter-mongoose mongoose
```

## Usage

### Setup Adapter

```typescript
import { MongooseAdapter, createMongooseAdapter } from '@hexa/adapter-mongoose';

const adapter = createMongooseAdapter({
  uri: 'mongodb://localhost:27017/mydb',
});

await adapter.connect();
```

### Create Repository

```typescript
import { BaseMongooseRepository, createBaseSchema } from '@hexa/adapter-mongoose';
import mongoose from 'mongoose';

// Define schema
const userSchema = createBaseSchema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
});

const UserModel = mongoose.model('User', userSchema);

// Create repository
class UserRepository extends BaseMongooseRepository<User> {
  constructor() {
    super(UserModel);
  }

  async findByEmail(email: string) {
    return this.model.findOne({ email, isActive: true }).exec();
  }
}
```
