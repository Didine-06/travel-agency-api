<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

API REST pour une agence de voyage construite avec NestJS, Prisma et PostgreSQL. Cette API fournit un système d'authentification JWT complet et une gestion des utilisateurs.

## Fonctionnalités

- ✅ Authentification JWT (register/login)
- ✅ Gestion des utilisateurs (CRUD)
- ✅ ORM Prisma avec PostgreSQL
- ✅ Variables d'environnement
- ✅ Validation des données (class-validator)
- ✅ Guards et décorateurs personnalisés
- ✅ Architecture modulaire (séparation des responsabilités)

## Prérequis

- Node.js (v18 ou supérieur)
- PostgreSQL (v13 ou supérieur)
- npm ou yarn

## Installation

### 1. Cloner le projet et installer les dépendances

```bash
npm install
```

### 2. Installer les dépendances manquantes

```bash
npm install @prisma/client prisma @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt class-validator class-transformer bcrypt
npm install -D @types/passport-jwt @types/bcrypt
```

### 3. Configurer les variables d'environnement

Copiez le fichier `.env.example` vers `.env` et modifiez les valeurs :

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/travel_agency?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Application
PORT=3000
NODE_ENV="development"
```

**Important:** Remplacez `username`, `password` et les autres valeurs par vos informations PostgreSQL.

### 4. Générer le client Prisma

```bash
npx prisma generate
```

### 5. Créer et exécuter les migrations

```bash
npx prisma migrate dev --name init
```

Cette commande va :
- Créer les tables dans votre base de données
- Générer le client Prisma
- Appliquer toutes les migrations

## Lancer l'application

```bash
# Mode développement
npm run start:dev

# Mode production
npm run build
npm run start:prod
```

L'API sera accessible sur `http://localhost:3000`

## Endpoints API

### Auth

#### Register (Inscription)
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login (Connexion)
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Réponse :
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Users (Protégé par JWT)

**Note:** Tous les endpoints `/users` nécessitent un token JWT dans le header :
```
Authorization: Bearer <votre_token>
```

#### Créer un utilisateur
```bash
POST /users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

#### Récupérer tous les utilisateurs
```bash
GET /users
Authorization: Bearer <token>
```

#### Récupérer un utilisateur par ID
```bash
GET /users/:id
Authorization: Bearer <token>
```

#### Mettre à jour un utilisateur
```bash
PUT /users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "UpdatedName",
  "email": "newemail@example.com"
}
```

#### Supprimer un utilisateur
```bash
DELETE /users/:id
Authorization: Bearer <token>
```

## Structure du projet

```
src/
├── database/
│   ├── database.module.ts      # Module global pour Prisma
│   └── prisma.service.ts       # Service Prisma
├── modules/
│   ├── auth/
│   │   ├── decorators/         # Decorators personnalisés
│   │   ├── dtos/               # DTOs pour auth
│   │   ├── guards/             # Guards JWT et Roles
│   │   ├── strategies/         # Stratégie JWT Passport
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   └── users/
│       ├── dtos/               # DTOs pour users
│       ├── repository/         # Repository pattern
│       ├── users.controller.ts
│       ├── users.module.ts
│       └── users.service.ts
├── app.module.ts               # Module racine
└── main.ts                     # Point d'entrée
prisma/
└── schema.prisma               # Schéma de base de données
```

## Commandes Prisma utiles

```bash
# Générer le client Prisma après modification du schema
npx prisma generate

# Créer une nouvelle migration
npx prisma migrate dev --name <nom_de_la_migration>

# Appliquer les migrations en production
npx prisma migrate deploy

# Ouvrir Prisma Studio (interface graphique)
npx prisma studio

# Réinitialiser la base de données (⚠️ supprime toutes les données)
npx prisma migrate reset
```

## Run tests

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
