#!/usr/bin/env bash
# Start the Volvo XC60 T8 Maintenance Tracker
# Usage: ./start.sh [--prod]

set -e

if [ "$1" = "--prod" ]; then
  echo "Building client..."
  cd client && npm run build && cd ..
  echo "Starting production server on http://localhost:3001"
  node server/index.js
else
  echo "Starting dev server..."
  echo "  Backend: http://localhost:3001"
  echo "  Frontend: http://localhost:5173"
  node server/index.js &
  SERVER_PID=$!
  cd client && npm run dev
  kill $SERVER_PID 2>/dev/null
fi
