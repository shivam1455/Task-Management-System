@echo off
echo Starting Task Manager Project...

echo.
echo [1/2] Starting Backend...
start "Backend Server" cmd /k "cd backend && npm start"

echo.
echo [2/2] Starting Frontend...
start "Frontend (Vite)" cmd /k "cd frontend && npm run dev"

echo.
echo Project is launching!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo The 'database' folder will update automatically as you use the website.
pause
