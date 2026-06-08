#!/bin/bash
set -e
echo "=== Client build ==="
cd client
npm install
npm run build
cd ..
echo "=== Server install ==="
cd server
npm install
cd ..
echo "=== Build complete ==="
