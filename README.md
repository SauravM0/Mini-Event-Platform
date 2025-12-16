# Mini Event Platform

A full-stack MERN application for managing events, RSVPs, and user authentication. This project demonstrates a production-ready architecture with secure authentication, concurrency handling, and responsive design.

## Live Application
**URL:** [Insert Deployment URL Here]

---

## 🚀 Tech Stack

### Backend
- **Node.js & Express**: RESTful API architecture.
- **MongoDB & Mongoose**: NoSQL database with schema modeling.
- **JWT (JSON Web Tokens)**: Secure stateless authentication.
- **Bcrypt**: Password hashing.
- **Cors & Helmet**: Security middleware.

### Frontend
- **React (Vite)**: Modern, fast frontend build tool.
- **React Router DOM**: Client-side routing.
- **Context API**: Global state management (Auth).
- **CSS Modules / Vanilla CSS**: Responsive styling.

---

## 🛠 Features

- **User Authentication**: Register, Login, Logout with JWT.
- **Event Management**: Create, Read, Update, Delete events.
- **RSVP System**: Users can join/leave events.
- **Capacity Enforcement**: Strict server-side checks prevent overbooking.
- **Dashboard**: personalized view of created and joined events.
- **Responsive Design**: Works on mobile and desktop.

---

## ⚙️ Technical Highlights

### Concurrency & Capacity Handling
To prevent overbooking (race conditions) when multiple users try to RSVP simultaneously:
1. **Atomic Updates**: We use MongoDB's atomic operators (e.g., `$inc`, `$addToSet`) where possible.
2. **Transaction / Logic Check**: Before adding an RSVP, the backend explicitly checks:
   ```javascript
   if (event.attendees.length >= event.capacity) {
       return res.status(400).json({ message: 'Event is full' });
   }
   ```
   *Note: In a high-scale distributed system, we would utilize MongoDB Transactions or optimistic concurrency control (versioning) to strictly guarantee consistency.*

### Security
- **Environment Variables**: All sensitive keys (Mongo URI, JWT Secret) are stored in `.env` and never committed.
- **Password Hashing**: Passwords are hashed using bcrypt before storage.
- **Input Validation**: usage of `express-validator` (if applicable) or strict schema validation.

---

## 📦 Setup & Local Development

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas Account or Local MongoDB

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd mini-event-platform
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Update .env with your MongoDB URI and JWT_SECRET
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd client
   npm install
   cp .env.example .env
   # Update .env if your backend runs on a port other than 5000
   npm run dev
   ```

---

## 📂 Project Structure

```
mini-event-platform/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Auth Context
│   │   ├── pages/          # Page views
│   │   └── services/       # API integration
├── server/                 # Express Backend
│   ├── config/             # DB connection
│   ├── controllers/        # Route logic
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   └── middleware/         # Auth & Error middlewares
```

## 📝 License
MIT
