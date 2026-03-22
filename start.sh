#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_PORT="${BACKEND_PORT:-5000}"
VITE_PORT="${VITE_PORT:-5173}"

log() {
  printf "\n[%s] %s\n" "$(date +"%H:%M:%S")" "$1"
}

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

ensure_mysql_running() {
  log "Checking MySQL status..."

  if command_exists mysqladmin && mysqladmin ping -h "127.0.0.1" --silent >/dev/null 2>&1; then
    log "MySQL is already running."
    return
  fi

  if command_exists brew; then
    log "Starting MySQL via Homebrew services..."
    brew services start mysql >/dev/null 2>&1 || true
    sleep 2
  fi

  if command_exists mysql.server; then
    log "Attempting to start MySQL via mysql.server..."
    mysql.server start >/dev/null 2>&1 || true
    sleep 2
  fi

  if command_exists mysqladmin && mysqladmin ping -h "127.0.0.1" --silent >/dev/null 2>&1; then
    log "MySQL started successfully."
    return
  fi

  log "Warning: Could not confirm MySQL is running. Backend may fail to connect."
}

install_backend_dependencies() {
  log "Ensuring backend dependencies are installed..."
  cd "$BACKEND_DIR"

  npm install express cors dotenv jsonwebtoken bcryptjs sequelize mysql2
}

install_frontend_dependencies() {
  log "Ensuring frontend dependencies are installed..."
  cd "$FRONTEND_DIR"

  npm install axios react-router-dom

  if [[ -f "$FRONTEND_DIR/tailwind.config.js" ]] || [[ -f "$FRONTEND_DIR/postcss.config.js" ]]; then
    log "Tailwind configuration detected. Ensuring Tailwind dependencies are installed..."
    npm install -D tailwindcss postcss autoprefixer
  fi
}

start_services() {
  log "Starting backend on port $BACKEND_PORT..."
  (
    cd "$BACKEND_DIR"
    PORT="$BACKEND_PORT" npm run dev
  ) &
  BACKEND_PID=$!

  log "Starting frontend (Vite) on port $VITE_PORT..."
  (
    cd "$FRONTEND_DIR"
    npm run dev -- --port "$VITE_PORT"
  ) &
  FRONTEND_PID=$!

  cleanup() {
    log "Stopping services..."
    kill "$BACKEND_PID" "$FRONTEND_PID" >/dev/null 2>&1 || true
  }

  trap cleanup INT TERM EXIT

  log "Project is starting..."
  log "Backend: http://localhost:$BACKEND_PORT"
  log "Frontend: http://localhost:$VITE_PORT"

  wait -n "$BACKEND_PID" "$FRONTEND_PID"
}

main() {
  if [[ ! -d "$BACKEND_DIR" || ! -d "$FRONTEND_DIR" ]]; then
    echo "Expected backend/ and frontend/ directories under $ROOT_DIR"
    exit 1
  fi

  ensure_mysql_running
  install_backend_dependencies
  install_frontend_dependencies
  start_services
}

main "$@"
