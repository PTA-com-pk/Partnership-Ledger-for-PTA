#!/bin/bash

echo "🚀 Deploying Next.js Partnership Ledger to Vercel..."

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Build the project
echo "Building Next.js project..."
npm run build

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

echo "✅ Next.js deployment complete!"
echo "Your modern partnership ledger is now live on Vercel!"
