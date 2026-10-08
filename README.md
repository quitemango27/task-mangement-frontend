# TaskFlow frontend (React + Vite + Tailwind)

## Run it
1. Start your FastAPI backend (it must be running at http://127.0.0.1:8000).
2. In this folder:
   ```
   npm install
   npm run dev
   ```
3. Open http://localhost:5173

## Your backend needs CORS (in main.py)
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Where things are
- `src/api/`         every call to your backend (axios.js adds the login token automatically)
- `src/context/`     AuthContext: who is logged in, login(), logout()
- `src/pages/`       Login, Register, Dashboard (one file per screen)
- `src/components/`  reusable pieces: TaskCard, TaskModal, ConfirmDialog, Sidebar
- `src/index.css`    your Stitch colors and fonts
- `.env`             backend address (VITE_API_URL). Change it when you deploy.
