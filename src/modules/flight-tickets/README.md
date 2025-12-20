# Module Flight Tickets

Ce module gère les billets d'avion dans l'application Travel Agency.

## Structure

```
flight-tickets/
├── dtos/                               # Data Transfer Objects
│   ├── create-flight-ticket.dto.ts
│   ├── create-my-flight-ticket.dto.ts
│   ├── update-flight-ticket.dto.ts
│   ├── update-my-flight-ticket.dto.ts
│   ├── flight-ticket-response.dto.ts
│   ├── flight-ticket-list-response.dto.ts
│   ├── flight-ticket-detail-response.dto.ts
│   ├── cancel-flight-ticket.dto.ts
│   ├── delete-flight-tickets.dto.ts
│   └── index.ts
├── enums/                              # Enumerations
│   ├── flight-ticket-errors.enum.ts
│   └── index.ts
├── repository/                         # Data Access Layer
│   └── flight-tickets.repository.ts
├── flight-tickets.controller.ts        # Routes Handler
├── flight-tickets.service.ts           # Business Logic
└── flight-tickets.module.ts            # Module Definition
```

## Modèle de données

### FlightTicket

```prisma
model FlightTicket {
  id                 String        @id @default(uuid())
  bookingId          String
  customerId         String
  departureDateTime  DateTime
  arrivalDateTime    DateTime
  seatClass          SeatClass
  ticketPrice        Decimal       @db.Decimal(10, 2)
  status             TicketStatus  @default(RESERVED)
  issuedAt           DateTime?
  cancelledAt        DateTime?
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt
  updatedBy          String?
}
```

### Enums

- **TicketStatus**: `RESERVED`, `PAID`, `CANCELLED`
- **SeatClass**: `ECONOMY`, `BUSINESS`, `FIRST`

## Règles métier

### Réservation de billet

- Créé avec statut `RESERVED`
- Doit être lié à une réservation valide
- La date d'arrivée doit être après la date de départ

### Paiement

- Uniquement pour les billets avec statut `RESERVED`
- Après validation: `status` → `PAID`, `issuedAt` → `now()`

### Annulation

- Uniquement pour les billets avec statut `RESERVED`
- Après annulation: `status` → `CANCELLED`, `cancelledAt` → `now()`

## API Endpoints

### Admin/Agent

#### POST /flight-tickets
Créer un nouveau billet d'avion
- **Rôles**: ADMIN, AGENT
- **Body**: `CreateFlightTicketDto`

#### GET /flight-tickets
Récupérer tous les billets
- **Rôles**: ADMIN, AGENT

#### GET /flight-tickets/:id
Récupérer un billet par ID
- **Rôles**: ADMIN, AGENT

#### PATCH /flight-tickets/:id
Mettre à jour un billet
- **Rôles**: ADMIN, AGENT
- **Body**: `UpdateFlightTicketDto`
- **Monitoring**: Enregistre l'utilisateur qui a effectué la modification

#### DELETE /flight-tickets/:id
Supprimer un billet
- **Rôles**: ADMIN, AGENT
- **Monitoring**: Action tracée

#### DELETE /flight-tickets
Supprimer plusieurs billets
- **Rôles**: ADMIN, AGENT
- **Body**: `DeleteFlightTicketsDto`

#### PATCH /flight-tickets/:id/cancel
Annuler un billet
- **Rôles**: ADMIN, AGENT
- **Body**: `CancelFlightTicketDto`
- **Monitoring**: Action tracée avec raison

#### PATCH /flight-tickets/:id/mark-as-paid
Marquer un billet comme payé
- **Rôles**: ADMIN, AGENT
- **Monitoring**: Action tracée

### Client

#### GET /flight-tickets/my-tickets
Récupérer tous mes billets
- **Rôles**: CLIENT
- **Sécurité**: Accès uniquement aux billets du client connecté

#### GET /flight-tickets/my-tickets/:id
Récupérer un de mes billets
- **Rôles**: CLIENT
- **Sécurité**: Vérification de propriété

#### POST /flight-tickets/my-tickets
Créer mon billet
- **Rôles**: CLIENT
- **Body**: `CreateMyFlightTicketDto`
- **Sécurité**: Le client ne peut créer des billets que pour ses propres réservations

#### PATCH /flight-tickets/my-tickets/:id
Mettre à jour mon billet
- **Rôles**: CLIENT
- **Body**: `UpdateMyFlightTicketDto`
- **Sécurité**: Uniquement pour les billets RESERVED du client
- **Monitoring**: Action tracée

#### DELETE /flight-tickets/my-tickets/:id
Supprimer mon billet
- **Rôles**: CLIENT
- **Sécurité**: Uniquement pour les billets RESERVED

#### DELETE /flight-tickets/my-tickets
Supprimer plusieurs de mes billets
- **Rôles**: CLIENT
- **Body**: `DeleteFlightTicketsDto`
- **Sécurité**: Uniquement pour les billets RESERVED

#### PATCH /flight-tickets/my-tickets/:id/cancel
Annuler mon billet
- **Rôles**: CLIENT
- **Body**: `CancelFlightTicketDto`
- **Sécurité**: Uniquement pour les billets RESERVED
- **Monitoring**: Action tracée

## Sécurité

### Contrôle d'accès

- **Admin/Agent**: Accès complet à tous les billets
- **Client**: Accès uniquement à ses propres billets

### Vérifications

1. **Propriété**: Les clients ne peuvent accéder qu'à leurs billets
2. **État**: Certaines actions nécessitent un statut spécifique
3. **Dates**: Validation de la cohérence des dates (arrivée > départ)

## Monitoring

Toutes les modifications (update, delete, cancel) sont tracées via le champ `updatedBy` qui enregistre le nom complet de l'utilisateur qui a effectué l'action.

## Erreurs

Le module utilise l'enum `FlightTicketErrors` pour une gestion cohérente des erreurs:

- `TICKET_NOT_FOUND`
- `INVALID_TICKET_DATA`
- `TICKET_CREATION_FAILED`
- `TICKET_UPDATE_FAILED`
- `TICKET_DELETE_FAILED`
- `BOOKING_NOT_FOUND`
- `CUSTOMER_NOT_FOUND`
- `INVALID_TICKET_STATUS`
- `CANNOT_CANCEL_TICKET`
- `UNAUTHORIZED_ACCESS`
- `TICKET_ALREADY_CANCELLED`
- `TICKET_ALREADY_PAID`
- `INVALID_TICKET_STATUS_FOR_CANCELLATION`
- `INVALID_TICKET_STATUS_FOR_PAYMENT`
- `INVALID_DATETIME`
- `ARRIVAL_BEFORE_DEPARTURE`

Toutes les erreurs sont traduites en français et anglais via le service i18n.
