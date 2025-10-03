# Polling System – Frontend (React)

Minimal React UI for the NestJS polling backend. This app focuses on showcasing backend capabilities: auth, role-based access, poll management, voting, and results.

## Tech
- React + Vite
- Axios (API)
- react-router-dom (routing)
- react-hot-toast (notifications)
- Utility-first classes for styling

## Key Screens
- Auth: Login, Register
- User:
  - All Polls (public + private where allowed)
  - Poll Details (vote, see results)
  - My Votes
- Admin:
  - Create Poll (public/private, duration, allow-list users)
  - Manage Polls (list, edit active, delete)

## How It Works with Backend
- JWT stored in `localStorage` (`token`, `user`)
- Axios interceptor adds `Authorization: Bearer <token>`
- Private polls: admin selects allowed users (searched by name/email), frontend sends their user IDs
- Vote counts are returned from backend and rendered dynamically

## 🚀 LIVE DEMO

**LINK:** poll-frontend-self.vercel.app

### 🔐 TESTING CREDENTIALS

**ADMIN ACCOUNT**
- **Email:** admin@gmail.com
- **Password:** test123

**USER ACCOUNTS**
- **User 1:** test@gmail.com / test123
- **User 2:** test2@gmail.com / test123

---

## Environment

Create a `.env` file in the root folder of the frontend and set the backend API URL, for example:
```
VITE_API_BASE_URL=http://localhost:3000
```
## Run Locally
```
npm install
npm run dev
```
Open the URL Vite prints (typically `http://localhost:5173`).

## Notes
- UI is intentionally lightweight.
- Toasters (react-hot-toast) are shown on login/register, create/edit/delete poll, and voting events.

## Notes on AI Assistance 
Some part of this project I utilized AI tools (ChatGPT/DeepSeek) to accelerate development through boilerplate code generation, debugging assistance, and architectural guidance. These tools helped quickly set up Nest.js/React foundations and resolve technical challenges like MongoDB index issues, while maintaining full code understanding and customization. The AI served as a development accelerator while all implementation decisions remained developer-driven.
