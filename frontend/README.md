# Training Calendar Frontend

This is a React frontend for the Training Calendar app, featuring authentication and a professional green-based theme.

## Features
- Login and registration pages
- Authenticated training calendar view
- Clickable days with Jira-style modal pop-up
- Add multiple sessions per day, classify sessions (e.g., 'track work', 'gym')
- Add multiple exercises per session, specify sets and reps
- Professional green-based color scheme using Material UI

## Setup

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

2. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

The app will be available at `http://localhost:3000`.

## Project Structure
- `src/pages/` — Main pages (Login, Register, Calendar)
- `src/auth/` — Authentication context
- `src/App.jsx` — Main app and routing

## Notes
- Authentication is currently mocked in the frontend. Integrate with your backend for real authentication.
- Calendar and session data are stored in component state for demo purposes. 