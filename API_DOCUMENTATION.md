# EasyGas API Documentation for Builders

This document provides comprehensive documentation for developers integrating with the EasyGas API. The API allows developers to access real-time Solana network data, optimize transaction fees, and get historical analysis.

## Authentication

Currently, the API endpoints are publicly accessible without authentication. Rate limiting may apply to prevent abuse.

## Base URL

When deployed, the base URL will be your deployment URL. In local development, it's `http://localhost:5000`.

## API Endpoints

### Network Status

#### GET `/api/network-status`

Returns current Solana network status and congestion metrics.

**Request:**
```http
GET /api/network-status
```

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

### Historical Data

#### GET `/api/historical-data`

Returns historical network congestion data for analysis.

**Parameters:**
- `timeframe`: (Optional) One of: `24h`, `week`, `month`. Defaults to `week`.

**Request:**
```http
GET /api/historical-data?timeframe=week
```

**Response:**
```json
{
  "timeframe": "week",
  "data": [
    {
      "day": "Mon", 
      "congestion": 65,
      "tps": 3654,
      "blockTime": 423,
      "fee": 0.000075
    },
    {
      "day": "Tue", 
      "congestion": 48,
      "tps": 2896,
      "blockTime": 412,
      "fee": 0.00004
    },
    ...
  ],
  "avgCongestion": 62.5,
  "peakCongestion": 87,
  "lowCongestion": 32
}
```

### Transaction Fee Optimization

#### POST `/api/priority-fee-recommendation`

Calculates the recommended priority fee based on transaction type, priority level, and network conditions.

**Request:**
```http
POST /api/priority-fee-recommendation
Content-Type: application/json

{
  "transactionType": "token-transfer",
  "priority": "fast",
  "priorityFee": "0.0001" // Optional custom fee
}
```

**Parameters:**
- `transactionType`: Type of transaction (`token-transfer`, `nft-purchase`, `swap`, `smart-contract`)
- `priority`: Desired speed (`standard`, `fast`, `urgent`)
- `priorityFee`: (Optional) Custom fee to analyze

**Response:**
```json
{
  "baseFee": "0.000005",
  "priorityFee": "0.00015",
  "totalFee": "0.000155",
  "estimatedTime": "~0.8s"
}
```

### Wallet Transactions

#### GET `/api/wallet/transactions`

Retrieves recent transactions for a specified wallet address.

**Parameters:**
- `address`: Solana wallet public key (required)

**Request:**
```http
GET /api/wallet/transactions?address=BhXYv5XwdCgqdfNrJQKz3sPyQS8BrNzuDotJnuQpwrgB
```

**Response:**
```json
[
  {
    "signature": "4Eag8qfAnJz5xzYFBYkGZPJqhaXghKPxZPoqP5Y8hhCj5UyHqvAkrGSm7hsHCTQFCLX5d2CzP8mhzBDCRDwfZgVc",
    "type": "SOL Transfer",
    "amount": "1.5000",
    "date": "5/6/2025, 3:45:23 PM",
    "status": "Success"
  },
  ...
]
```

## WebSocket API

EasyGas provides real-time network updates via WebSocket connection.

### Connection

Connect to the WebSocket endpoint at `/ws`:
```javascript
const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const wsUrl = `${protocol}//${window.location.host}/ws`;
const socket = new WebSocket(wsUrl);
```

### Subscribe to Updates

Send a subscription message to start receiving real-time data:
```javascript
socket.onopen = () => {
  socket.send(JSON.stringify({
    type: "subscribe",
    channel: "network"
  }));
};
```

### Receive Updates

Listen for incoming messages:
```javascript
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === "network-update") {
    console.log("Real-time network update:", data.data);
    // Update your UI with the new data
  }
};
```

## WebSocket Message Format

### Network Update Message

```json
{
  "type": "network-update",
  "data": {
    "congestionPercentage": 72,
    "congestionStatus": "High",
    "avgConfirmationTime": "1.2",
    "confirmationStatus": "Slower than usual",
    "recommendedPriorityFee": "0.0001",
    "priorityFeeStatus": "Medium priority fee recommended",
    "blockTime": "402ms",
    "tps": 4356,
    "failedTxPercentage": 1.4,
    "validatorCount": 5844,
    "blockTimeChange": -1.8,
    "tpsChange": 190.4,
    "failedTxChange": 0.5,
    "validatorCountChange": 199.6,
    "currentSlot": "338,391,802"
  },
  "timestamp": "2025-05-07T08:32:24.123Z"
}
```

## Error Handling

API responses will include appropriate HTTP status codes:

- `200 OK`: Request successful
- `400 Bad Request`: Invalid parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: RPC connection error

Error responses will follow this format:
```json
{
  "message": "Error message description",
  "error": "Detailed error information",
  "isRpcError": true // Indicates if the error is related to RPC connection
}
```

## Rate Limiting

To ensure service stability, the API implements rate limiting:
- WebSocket connections: 10 connections per IP address
- REST API: 60 requests per minute per IP address

Rate limit exceeded responses return HTTP status code `429 Too Many Requests`.