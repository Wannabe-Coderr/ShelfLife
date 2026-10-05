# ShelfLife

ShelfLife is a college library management platform consisting of a Node.js + Express backend, a React + TypeScript frontend, and supporting system design documentation.

## Features

- Manage library books with ISBN validation, total copies, and available copies tracking.
- Register members and maintain unique email/membership IDs.
- Issue books with atomic stock updates and due dates.
- Return books and update available copy counts.
- JWT-based librarian authentication.
- Browse books from the React frontend.

## Demo librarian credentials

The backend reads credentials from environment variables, with defaults configured for local assignment use:

- Email: librarian@shelflife.com
- Password: librarian123

## Backend setup

```bash
cd backend
cp .env.example .env
npm install
npm start
```

The server uses an in-memory MongoDB instance automatically when `USE_MEMORY_DB=true` or no `MONGODB_URI` is provided.

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 after starting the frontend.

## API quick reference

### Auth
- POST `/api/auth/login`

### Books
- POST `/api/books`
- GET `/api/books?page=1&limit=10&genre=Fiction&search=Harry`

### Members
- POST `/api/members`
- GET `/api/members/:id/history`

### Borrow flow
- POST `/api/borrow` (protected)
- POST `/api/return/:borrowId` (protected)

## System design

See [docs/SYSTEM_DESIGN.md](./docs/SYSTEM_DESIGN.md).
