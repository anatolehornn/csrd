# ESG Reporting Tool

A web application for companies to comply with CSRD (Corporate Sustainability Reporting Directive) requirements.

## Features

- Tree-based taxonomy structure for ESG reporting
- Topic and sub-topic based navigation
- Interactive form for answering questions
- TypeScript-based full-stack implementation

## Project Structure

```
.
├── server/         # Express backend
├── client/         # React frontend
└── shared/         # Shared TypeScript types
```

## Setup

1. Install backend dependencies:
```bash
cd server && npm install
```

2. Start the development server:
```bash
npm run start --debug
```

3. Install frontend dependencies
```bash
cd client && npm install --force
```

4. Start the frontend:
```bash
npm run start --debug
```

5. build the backend:
```bash
npm run build
```

6. run the built backend:
```bash
npm run start --debug
```

7. build the frontend:
```bash
npm run build
```

8. run the built frontend:
```bash
serve -s build
```

## Links

- Backend Taxonomy: [http://localhost:3001/api/taxonomy](http://localhost:3001/api/taxonomy)
- Backend Topics: [http://localhost:3001/api/topics](http://localhost:3001/api/topics)
- Frontend: [http://localhost:3000/](http://localhost:3000/)

## Technology Stack

- Backend: Node.js, Express, TypeScript
- Frontend: React, TypeScript
- Data Format: CSV for taxonomy data

## Development

The application uses a monorepo structure with three main components:
- Backend API for serving the taxonomy and handling responses
- Frontend for the user interface
- Shared types for type safety across the stack
