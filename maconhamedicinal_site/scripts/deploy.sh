#!/bin/bash

# Deployment script for Maconha Medicinal platform
# This script helps deploy to Cloudflare Pages using Wrangler

set -e

echo "🚀 Maconha Medicinal - Deployment Script"
echo "=========================================="

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler is not installed."
    echo "Install it with: npm install -g wrangler"
    exit 1
fi

# Check if logged in to Cloudflare
if ! wrangler whoami &> /dev/null; then
    echo "❌ Not logged in to Cloudflare."
    echo "Run: wrangler login"
    exit 1
fi

# Navigate to project directory
cd "$(dirname "$0")/.."

echo ""
echo "📦 Installing dependencies..."
npm ci

echo ""
echo "🧪 Running tests..."
npm run test

echo ""
echo "🔨 Building project..."
npm run build

echo ""
echo "📤 Deploying to Cloudflare Pages..."

# Check if this is a production deployment
if [ "$1" == "production" ] || [ "$1" == "prod" ]; then
    echo "🌟 Deploying to PRODUCTION..."
    wrangler pages deploy out --project-name=maconhamedicinal-site --branch=main
else
    echo "🔍 Deploying to PREVIEW..."
    wrangler pages deploy out --project-name=maconhamedicinal-site
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your site is available at:"
echo "   https://maconhamedicinal-site.pages.dev"
echo ""
