import fs from 'fs-extra';
import path from 'path';
import { GeneratorContext } from '../types';

export async function generateReadme(ctx: GeneratorContext): Promise<void> {
  const { projectPath, config } = ctx;
  const { name: projectName, template, adapters, transports } = config;

  const readme = `# ${projectName}

A ${template} project built with Hexa Framework.

## 🛠️ Tech Stack

- **Framework**: Hexa Framework (Hexagonal Architecture)
- **Language**: TypeScript
- **Adapters**: ${adapters.map(a => a.toUpperCase()).join(', ')}${transports.length > 0 ? `
- **Transport Layers**: ${transports.map(t => t.toUpperCase()).join(', ')}` : ''}${template !== 'empty' ? `
- **Authentication**: JWT` : ''}${template === 'full-auth' ? `
- **Authorization**: RBAC (Role-Based Access Control)` : ''}

## 📦 Installation

\`\`\`bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Edit .env file with your database credentials
# nano .env
\`\`\`

## 🗄️ Database Setup

\`\`\`bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio
npx prisma studio
\`\`\`

${template === 'full-auth' ? `### Seed Initial Data (Full Auth)

For full authentication setup, you may want to create initial roles and permissions:

\`\`\`typescript
// Create admin role
POST /api/roles
{
  "name": "admin",
  "description": "Administrator role with full permissions"
}

// Create permissions for the admin role
POST /api/permissions
{
  "name": "manage_users",
  "resource": "user",
  "action": "manage",
  "roleId": 1
}
\`\`\`

` : ''}## 🚀 Running the Application

\`\`\`bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start
\`\`\`

## 🔧 Hexa CLI - Powerful Development Tools

This project includes a powerful CLI similar to PHP Artisan:

\`\`\`bash
# Interactive mode
npm run hexa

# Generate complete CRUD (Entity, Repository, Service, Controller, Router, DTOs, Validation)
npm run hexa generate crud Product -- --fields name:string,price:number,stock:number

# Other generate commands
npm run hexa g controller ProductController
npm run hexa g service ProductService
npm run hexa g repository ProductRepository

# Database commands
npm run hexa db migrate                # Run migrations
npm run hexa db migrate:fresh          # Fresh database
npm run hexa db seed                   # Seed database

# Development commands
npm run hexa serve                     # Start dev server
npm run hexa build                     # Build project
npm run hexa test                      # Run tests

# List all commands
npm run hexa list
\`\`\`

The server will start on \`http://localhost:3000\`

${transports.includes('rest') ? `## 📡 REST API Endpoints

### Health Check
- \`GET /api/health\` - Server health status

${template !== 'empty' ? `### Authentication
- \`POST /api/auth/login\` - Login with email and password
- \`GET /api/auth/me\` - Get current user (requires auth)

### Users
- \`POST /api/users\` - Create new user
- \`GET /api/users\` - Get all users (paginated, requires auth)
- \`GET /api/users/:id\` - Get user by ID (requires auth)
- \`PUT /api/users/:id\` - Update user (requires auth)
- \`DELETE /api/users/:id\` - Delete user (requires auth)

${template === 'full-auth' ? `### Roles
- \`POST /api/roles\` - Create role (requires permission)
- \`GET /api/roles\` - Get all roles (requires permission)
- \`GET /api/roles/:id\` - Get role by ID (requires permission)
- \`PUT /api/roles/:id\` - Update role (requires permission)
- \`DELETE /api/roles/:id\` - Delete role (requires permission)

### Permissions
- \`POST /api/permissions\` - Create permission (requires permission)
- \`GET /api/permissions\` - Get all permissions (requires permission)
- \`GET /api/permissions/:id\` - Get permission by ID (requires permission)
- \`GET /api/permissions/role/:roleId\` - Get permissions by role (requires permission)
- \`PUT /api/permissions/:id\` - Update permission (requires permission)
- \`DELETE /api/permissions/:id\` - Delete permission (requires permission)

` : ''}### Example Usage

\`\`\`bash
# Create a user
curl -X POST http://localhost:3000/api/users \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "username": "johndoe",
    "name": "John Doe"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Get current user (use token from login)
curl -X GET http://localhost:3000/api/auth/me \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
\`\`\`
` : ''}
` : ''}${transports.includes('graphql') ? `## 🔮 GraphQL API

GraphQL Playground is available at: \`http://localhost:3000/graphql\`

${template !== 'empty' ? `### Example Queries

\`\`\`graphql
# Login
mutation {
  login(data: {
    email: "user@example.com"
    password: "password123"
  }) {
    token
    user {
      id
      email
      username
      name
    }
  }
}

# Get current user
query {
  me {
    id
    email
    username
    name
    isActive
  }
}

# Get all users
query {
  users(page: 1, limit: 10) {
    id
    email
    username
    name
  }
}

# Create user
mutation {
  createUser(data: {
    email: "newuser@example.com"
    password: "password123"
    username: "newuser"
    name: "New User"
  }) {
    id
    email
    username
  }
}
\`\`\`

${template === 'full-auth' ? `### Role & Permission Queries

\`\`\`graphql
# Create role
mutation {
  createRole(data: {
    name: "moderator"
    description: "Moderator role"
  }) {
    id
    name
    description
  }
}

# Get all roles
query {
  roles {
    id
    name
    description
  }
}

# Create permission
mutation {
  createPermission(data: {
    name: "edit_posts"
    resource: "post"
    action: "edit"
    roleId: 1
  }) {
    id
    name
    resource
    action
  }
}
\`\`\`

` : ''}**Note**: Add your JWT token in the HTTP Headers:
\`\`\`json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
\`\`\`
` : ''}
` : ''}${transports.includes('websocket') ? `## 🔌 WebSocket Events

WebSocket server is available at: \`ws://localhost:3000\`

${template !== 'empty' ? `### Authentication

Connect with JWT token:
\`\`\`javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});
\`\`\`

` : ''}### Available Events

#### Connection Events
- \`ping\` - Health check ping
- \`join-room\` - Join a specific room
- \`leave-room\` - Leave a room
- \`broadcast-to-room\` - Send message to room

#### Example Events
- \`echo\` - Echo back the message
- \`broadcast\` - Broadcast to all clients
- \`private-message\` - Send to specific socket
- \`typing-start / typing-stop\` - Typing indicators
- \`get-clients-count\` - Get connected clients
- \`get-rooms\` - Get list of rooms

### Example Client Code

\`\`\`javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000'${template !== 'empty' ? `, {
  auth: { token: 'YOUR_JWT_TOKEN' }
}` : ''});

// Connection
socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

// Join room
socket.emit('join-room', 'chat-room');

// Listen for room broadcasts
socket.on('room-broadcast', (data) => {
  console.log('Message:', data.message);
});

// Send message to room
socket.emit('broadcast-to-room', {
  room: 'chat-room',
  message: 'Hello everyone!'
});
\`\`\`

See \`src/transports/websocket/events/EVENTS.md\` for full documentation.

` : ''}## 📁 Project Structure

\`\`\`
${projectName}/
├── prisma/
│   └── schema.prisma         # Database schema
├── src/
│   ├── adapters/            # External adapters (DB repositories)
│   ├── configs/             # Configuration files
│   ├── core/
│   │   ├── entities/        # Domain entities${template !== 'empty' ? `
│   │   ├── repositories/    # Repository interfaces
│   │   └── services/        # Business logic` : ''}
│   ├── mappers/             # Data mappers
│   ├── policies/            # Middlewares & policies
│   ├── transports/          # Transport layers${transports.includes('rest') ? `
│   │   ├── api/            # REST API` : ''}${transports.includes('graphql') ? `
│   │   ├── graphql/        # GraphQL` : ''}${transports.includes('websocket') ? `
│   │   └── websocket/      # WebSocket` : ''}
│   └── index.ts            # Main entry point
├── .env.example            # Environment template
├── tsconfig.json          # TypeScript config
└── package.json           # Dependencies
\`\`\`

## 🏗️ Architecture

This project follows **Hexagonal Architecture** (Ports & Adapters):

- **Core Layer**: Business logic, entities, and use cases
- **Adapters Layer**: External dependencies (database, external APIs)
- **Transport Layer**: API interfaces (REST, GraphQL, WebSocket)

### Benefits
- ✅ **Testability**: Business logic isolated from frameworks
- ✅ **Flexibility**: Easy to swap databases or transport layers
- ✅ **Maintainability**: Clear separation of concerns
- ✅ **Scalability**: Independent layer scaling

## 🔒 Environment Variables

\`\`\`env
# Server
PORT=3000
NODE_ENV=development

# Database
${adapters.includes('prisma') ? `DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
` : ''}${adapters.includes('typeorm') ? `DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=hexa_db
` : ''}${adapters.includes('mongoose') ? `MONGODB_URI="mongodb://localhost:27017/hexa_db"
` : ''}${adapters.includes('redis') ? `REDIS_URL="redis://localhost:6379"
` : ''}

${template !== 'empty' ? `# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
` : ''}\`\`\`

${template !== 'empty' ? `## 🔐 Security Notes

- Change \`JWT_SECRET\` to a strong random string in production
- Use HTTPS in production
- Implement rate limiting for production
- Review and adjust CORS settings
- Keep dependencies updated

` : ''}## 📚 Learn More

- [Hexa Framework Documentation](https://github.com/hexa-framework/hexa-framework-core)
- [Prisma Documentation](https://www.prisma.io/docs)${transports.includes('graphql') ? `
- [GraphQL Documentation](https://graphql.org/learn/)
- [TypeGraphQL Documentation](https://typegraphql.com/)` : ''}${transports.includes('websocket') ? `
- [Socket.IO Documentation](https://socket.io/docs/)` : ''}

## 📝 License

MIT

---

Built with ❤️ using [create-hexa-app](https://www.npmjs.com/package/create-hexa-app)
`;

  await fs.writeFile(path.join(projectPath, 'README.md'), readme);
  console.log('  ✅ README.md generated');
}
