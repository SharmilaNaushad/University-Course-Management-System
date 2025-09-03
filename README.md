# University Course Management System

A full-stack web application for managing university courses, users, and enrollments. Built with React (frontend) and Express/Sequelize (backend).

## Features

- User authentication (admin, instructor, student roles)
- Course creation, editing, and enrollment
- Responsive UI with Material-UI
- RESTful API with JWT authentication
- Print-friendly pages for reports and course lists

## Project Structure

```
backend/
  ├── .env.example
  ├── package.json
  ├── server.js
  ├── src/
  │   ├── config/
  │   ├── controllers/
  │   ├── middleware/
  │   ├── models/
  │   ├── routes/
  │   ├── services/
  │   └── utils/
frontend/
  ├── package.json
  ├── index.html
  ├── src/
  │   ├── App.jsx
  │   ├── components/
  │   ├── contexts/
  │   ├── pages/
  │   ├── utils/
  │   ├── App.css
  │   ├── index.css
  │   ├── print.css
  │   └── responsive.css
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Backend Setup

1. Copy `.env.example` to `.env` and fill in your environment variables.
2. Install dependencies:

   ```sh
   cd backend
   npm install
   ```

3. Start the backend server:

   ```sh
   npm run dev
   ```

### Frontend Setup

1. Install dependencies:

   ```sh
   cd frontend
   npm install
   ```

2. Start the frontend development server:

   ```sh
   npm run dev
   ```

3. Visit [http://localhost:5173](http://localhost:5173) in your browser.

## Environment Variables

See [`backend/.env.example`](backend/.env.example) for required backend environment variables.

## Scripts

- **Backend**
  - `npm run dev` — Start backend with hot reload
  - `npm start` — Start backend in production mode

- **Frontend**
  - `npm run dev` — Start frontend dev server
  - `npm run build` — Build frontend for production
  - `npm run preview` — Preview production build

## License

MIT

---

For more details, see the code in [backend](backend) and [frontend](frontend).
