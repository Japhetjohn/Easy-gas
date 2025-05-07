#!/bin/bash

# EasyGas Project Cleanup Script
# This script helps you clean up unnecessary files and organize your project structure.

echo "🧹 EasyGas Project Cleanup"
echo "=========================="

# Create logs directory if it doesn't exist
if [ ! -d "./logs" ]; then
  echo "📁 Creating logs directory..."
  mkdir -p ./logs
fi

# Move all log files to logs directory
echo "📋 Moving log files to logs directory..."
find . -name "*.log" -type f -not -path "./logs/*" -not -path "./node_modules/*" -exec mv {} ./logs/ \;

# Clean up node_modules if requested
read -p "❓ Do you want to clean node_modules and reinstall dependencies? (y/n): " clean_node_modules
if [ "$clean_node_modules" = "y" ]; then
  echo "🗑️ Removing node_modules..."
  rm -rf ./node_modules
  echo "📦 Reinstalling dependencies..."
  npm install
fi

# Remove temporary files
echo "🗑️ Removing temporary files..."
find . -name "*.tmp" -type f -delete
find . -name ".DS_Store" -type f -delete
find . -name "Thumbs.db" -type f -delete

# Clean build artifacts
read -p "❓ Do you want to clean build artifacts? (y/n): " clean_build
if [ "$clean_build" = "y" ]; then
  echo "🗑️ Removing build artifacts..."
  rm -rf ./client/dist
  echo "🔨 Rebuilding the project..."
  npm run build
fi

# Organize documentation files
echo "📚 Organizing documentation files..."
if [ ! -d "./docs" ]; then
  mkdir -p ./docs
fi

# List of documentation files to move to docs directory
doc_files=("API_DOCUMENTATION.md" "CONTRIBUTING.md" "DEPLOYMENT.md")

for file in "${doc_files[@]}"; do
  if [ -f "./$file" ]; then
    echo "  - Moving $file to docs directory..."
    cp "./$file" "./docs/$file"
  fi
done

echo "✅ Project cleanup complete!"
echo ""
echo "Project structure has been organized. Documentation files have been"
echo "copied to the 'docs' directory for easy reference."
echo ""
echo "Next steps you might want to take:"
echo "1. Run 'npm run dev' to start the development server"
echo "2. Review the documentation in the 'docs' directory"
echo "3. Deploy your application following the steps in DEPLOYMENT.md"
echo ""