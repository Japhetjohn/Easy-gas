# EasyGas Deployment Guide

This guide provides step-by-step instructions for deploying EasyGas to various environments.

## Prerequisites

Before deployment, ensure you have:

- Node.js v18+ installed
- Access to a PostgreSQL database
- Solana RPC endpoint URL (for live network data)

## Environment Variables

EasyGas requires the following environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `VITE_SOLANA_RPC_URL` | Solana RPC endpoint URL | Yes |
| `PORT` | Server port (default: 5000) | No |

## Deployment Options

### Option 1: Standard Server Deployment

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/easygas.git
   cd easygas
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file with your environment variables
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/easygas
   VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   PORT=5000
   ```

4. Build the production assets
   ```bash
   npm run build
   ```

5. Initialize the database
   ```bash
   npm run db:push
   ```

6. Start the production server
   ```bash
   npm start
   ```

### Option 2: Docker Deployment

1. Create a `.env` file with your environment variables as shown above

2. Build and run using Docker
   ```bash
   docker build -t easygas .
   docker run -p 5000:5000 --env-file .env easygas
   ```



### Option 3: Vercel Deployment

EasyGas is optimized for deployment on Vercel with a pre-configured `vercel.json` file.

1. Push your code to a GitHub repository
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click "Add New" > "Project"

3. Import your GitHub repository and configure as follows:
   - **Framework Preset**: Keep as auto-detected (Vite)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `client/dist` (should be auto-detected)

4. Add the following environment variables in the Vercel dashboard:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SOLANA_RPC_URL`: Your Solana RPC endpoint URL

5. Under "Deployments" settings, ensure that:
   - The WebSocket protocol is enabled (should be by default)
   - Serverless functions are enabled (should be by default)

6. Click "Deploy" and wait for the build to complete

7. Once deployed, your application will be available at `https://your-project-name.vercel.app`

8. For custom domains, go to the "Domains" tab in your project settings and add your domain

9. For database initialization, you may need to:
   - Connect to your production database
   - Run `npm run db:push` locally, pointing to your production database

## Database Initialization

The first time you deploy, you need to initialize the database:

```bash
npm run db:push
```

This will create all necessary tables based on the schema defined in `shared/schema.ts`.

## Maintaining Your Deployment

### Updates

To update your deployment:

1. Pull the latest changes
   ```bash
   git pull
   ```

2. Install any new dependencies
   ```bash
   npm install
   ```

3. Rebuild the application
   ```bash
   npm run build
   ```

4. Update the database if needed
   ```bash
   npm run db:push
   ```

5. Restart the server
   ```bash
   npm start
   ```

### Monitoring

For production deployments, we recommend setting up monitoring with tools like:

- PM2 for process management
- Grafana/Prometheus for metrics
- Sentry for error tracking

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify your DATABASE_URL is correct
   - Ensure the database exists and is accessible from your deployment environment
   - Check firewall rules if connecting to a remote database

2. **Solana RPC Issues**
   - If using a public RPC, you may encounter rate limiting
   - Consider using a dedicated RPC service like QuickNode for production deployments

3. **Build Failures**
   - Clear the build cache: `rm -rf dist`
   - Ensure all dependencies are installed: `npm install`

### Getting Help

If you encounter issues deploying EasyGas, please:

1. Check the logs for specific error messages
2. Search existing issues on GitHub
3. Open a new issue with details about your deployment environment and the error

---

For any questions or concerns, please contact the EasyGas team or open an issue on GitHub.
