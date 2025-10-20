# HighFive
Congressional App Challenge
# Running HighFive Locally

# Clone the repo and enter project
git clone <YOUR_REPO_URL>
cd HighFive

# Backend
cd backend
npm install
# Create a .env file with your environment variables (example):
# PORT=5000
# OPENAI_API_KEY=<your-key>
npm start
# Backend runs at http://localhost:5000

# Frontend
cd ../frontend
npm install
npm run dev
# Frontend runs at http://localhost:5174
# You should see the Signup/Login page and "Loading backend..." message

# Notes
# Make sure Firebase Authentication is enabled for Email/Password login.
# Do not commit .env files or API keys.
# Restart frontend dev server if you add new components.
