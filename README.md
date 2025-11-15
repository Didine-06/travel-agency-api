# Travel Agency API

A REST API for a travel agency built with NestJS, Prisma, and PostgreSQL. Includes JWT authentication and user management.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Didine-06/travel-agency-api.git
cd travel-agency-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/travel_agency?schema=public"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
```

### 4. Setup database

```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Run the application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## License

[MIT licensed](LICENSE)
