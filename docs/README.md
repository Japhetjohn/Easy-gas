# EasyGas - Solana Transaction Optimizer

![EasyGas Logo](./attached_assets/WhatsApp%20Image%202025-05-06%20at%2010.53.23_96e13e1a.jpg)

EasyGas is a powerful dashboard application that helps users optimize Solana blockchain transactions by tracking network congestion and recommending appropriate priority fees. This tool provides real-time metrics and historical data to help you make informed decisions about when to execute transactions and what fee levels to set.

## Features

- **Real-time Network Statistics**: Monitor current Solana network congestion, TPS, and other key metrics
- **Transaction Fee Optimizer**: Get personalized fee recommendations based on transaction type and priority
- **Historical Data Analysis**: View network congestion trends to plan your transactions
- **Transaction Tracking**: Monitor your on-chain transactions in one place
- **Customizable Settings**: Adjust your preferences for network nodes, theme, and more
- **Notifications**: Stay informed about network conditions and transaction status

## Technology Stack

- **Frontend**: React.js, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Express.js (with Python optional backend)
- **Database**: PostgreSQL
- **Blockchain**: Solana Web3.js

## Getting Started

### Prerequisites

- Node.js v18+ 
- PostgreSQL database
- Solana RPC endpoint (for live data)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/easygas.git
   cd easygas
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/easygas
   VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   ```

4. Create and migrate the database
   ```
   npm run db:push
   ```

5. Start the development server
   ```
   npm run dev
   ```

6. Open your browser to `http://localhost:5000`

## Database Configuration

The application uses PostgreSQL as its database. If you need to set up a different database or modify the schema:

1. Update the database connection details in the `.env` file
2. The schema is defined in `shared/schema.ts`
3. Use `npm run db:push` to update your database with any schema changes

The database stores the following information:
- User accounts and wallet addresses
- Historical network status data
- Transaction records and priority fees
- User alerts and notification preferences

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|--------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | None |
| `VITE_SOLANA_RPC_URL` | Solana RPC endpoint URL | Yes | https://api.mainnet-beta.solana.com |
| `PORT` | Port for the server to listen on | No | 5000 |

## API Requirements

For full functionality, you will need access to the following APIs:

1. **Solana RPC Node**: For real-time blockchain data
   - Either use a public endpoint like https://api.mainnet-beta.solana.com (rate limited)
   - Or use a dedicated service like QuickNode, Alchemy, or run your own RPC node

2. **Historical Data API** (optional): For enhanced historical metrics
   - Services like Solana Beach, Solscan, or your own aggregation service

## API Reference for Developers

EasyGas provides a comprehensive API for developers building their own applications on top of our service. All API endpoints return JSON data.

### Network Status Endpoints

#### GET `/api/network-status`

Returns current Solana network status and congestion metrics.

**Response:**
```json
{
  "congestionPercentage": 64,
  "congestionStatus": "Medium",
  "avgConfirmationTime": "0.9",
  "confirmationStatus": "Normal",
  "recommendedPriorityFee": "0.00008",
  "priorityFeeStatus": "Medium priority fee recommended",
  "blockTime": "400ms",
  "tps": 4200,
  "failedTxPercentage": 1.2,
  "validatorCount": 5840,
  "blockTimeChange": -2.4,
  "tpsChange": 185.6,
  "failedTxChange": 0.3,
  "validatorCountChange": 195.8,
  "currentSlot": "338,391,621"
}
```

#### GET `/api/historical-data?timeframe={timeframe}`

Returns historical network congestion data for analysis.

**Parameters:**
- `timeframe`: (Optional) One of: `24h`, `week`, `month`. Defaults to `week`.

**Response:**
```json
{
  "timeframe": "week",
  "data": [
    {
      "day": "Monday",
      "avgCongestion": 45,
      "avgTps": 3800,
      "avgFee": "0.00005",
      "peak": 72
    },
    ...
  ]
}
```

### Transaction Optimization Endpoints

#### POST `/api/priority-fee`

Calculates recommended priority fee based on transaction type and network conditions.

**Request Body:**
```json
{
  "transactionType": "token_transfer", 
  "priority": "normal",
  "deadline": 60
}
```

**Parameters:**
- `transactionType`: Type of transaction (`token_transfer`, `nft_mint`, `swap`, etc.)
- `priority`: Desired priority level (`low`, `normal`, `high`, `urgent`)
- `deadline`: (Optional) Maximum confirmation time in seconds

**Response:**
```json
{
  "recommendedPriorityFee": "0.00012",
  "estimatedConfirmationTime": "2.5",
  "networkCongestion": 68,
  "success": true
}
```

### WebSocket Real-time Updates

Connect to `/ws` endpoint to receive real-time network updates:

**Subscribe Message:**
```json
{
  "type": "subscribe",
  "channel": "network"
}
```

**Server Message (Sent periodically):**
```json
{
  "type": "network_update",
  "data": {
    "congestionPercentage": 71,
    "congestionStatus": "High",
    ...
  }
}
```

## Deployment

### Production Deployment

1. Build the production assets
   ```
   npm run build
   ```

2. Start the production server
   ```
   npm start
   ```

### Docker Deployment

```bash
# Build the Docker image
docker build -t easygas .

# Run the container
docker run -p 5000:5000 --env-file .env easygas
```

## Using Python Backend (Optional)

If you prefer to use Python for backend processing:

1. Navigate to the `python-backend` directory
2. Install requirements: `pip install -r requirements.txt`
3. Set up environment variables in `.env`
4. Run the Python server: `python app.py`
5. Configure the frontend to connect to Python API endpoints

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Created with ❤️ for Solana developers and users
