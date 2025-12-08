# @hexa/transport-rest

REST transport layer for Hexa Framework using Express.js.

## Installation

```bash
npm install @hexa/transport-rest express
```

## Usage

### Setup Transport

```typescript
import express from 'express';
import { RestTransport, createRestTransport } from '@hexa/transport-rest';

const app = express();
app.use(express.json());

const rest = createRestTransport();
await rest.init(app, { prefix: '/api', version: 'v1' });

app.listen(3000);
```

### Create Controller

```typescript
import { BaseController, AuthRequest } from '@hexa/transport-rest';
import { Request, Response } from 'express';

class UserController extends BaseController {
  getAll = this.asyncHandler(async (req: Request, res: Response) => {
    const users = await this.userService.findAll();
    return this.success(res, users, 'Users retrieved');
  });

  create = this.asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.create(req.body);
    return this.created(res, user);
  });
}
```

### Authentication Middleware

```typescript
import { createAuthMiddleware } from '@hexa/transport-rest';

const authMiddleware = createAuthMiddleware({
  jwtSecret: process.env.JWT_SECRET!,
  getUserDetails: async (payload) => {
    // Fetch additional user details
    return { permissions: ['user:read', 'user:write'] };
  },
});

router.get('/protected', authMiddleware, handler);
```

### Validation Middleware

```typescript
import { validateBody } from '@hexa/transport-rest';
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post('/users', validateBody(createUserSchema), controller.create);
```
