# Contributing to EasyGas

Thank you for your interest in contributing to EasyGas! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with the following information:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Screenshots if applicable
- Environment information (browser, OS, etc.)

### Suggesting Features

Feature requests are welcome! Please create an issue with:

- A clear, descriptive title
- Detailed description of the proposed feature
- Any relevant examples or mockups
- Explanation of why this feature would be useful

### Pull Requests

1. Fork the repository
2. Create a new branch from the `main` branch
3. Make your changes
4. Test your changes thoroughly
5. Submit a pull request

#### Pull Request Guidelines

- Follow the existing code style
- Write clear, descriptive commit messages
- Include tests for new features or bug fixes
- Update documentation as needed
- Link the PR to any related issues

## Development Setup

### Prerequisites

- Node.js v18+
- PostgreSQL database

### Installation

1. Clone your fork of the repository
   ```bash
   git clone https://github.com/your-username/easygas.git
   cd easygas
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   # Create a .env file with the following:
   DATABASE_URL=postgresql://username:password@localhost:5432/easygas
   VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

## Project Structure

- `/client` - Frontend React application
- `/server` - Backend Express server
- `/shared` - Shared types and utilities
- `/python-backend` - Optional Python backend services

## Testing

Before submitting a PR, please ensure your code passes all tests:

```bash
npm test
```

## Documentation

When adding new features, please update relevant documentation in:

- Code comments
- README.md
- API documentation

## Database Migrations

When making changes to the database schema in `shared/schema.ts`, you need to ensure the changes are properly migrated:

```bash
npm run db:push
```

## Get Help

If you have questions about contributing, please:

- Open an issue with your question
- Reach out to the maintainers

## Thank You

Your contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.
