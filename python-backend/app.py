import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor
from flask_sqlalchemy import SQLAlchemy
import random
import time
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Database connection
def get_db_connection():
    conn = psycopg2.connect(
        host=os.getenv('PGHOST'),
        database=os.getenv('PGDATABASE'),
        user=os.getenv('PGUSER'),
        password=os.getenv('PGPASSWORD'),
        port=os.getenv('PGPORT')
    )
    conn.autocommit = True
    return conn

# API Routes
@app.route('/api/network-status', methods=['GET'])
def get_network_status():
    try:
        # In a real implementation, connect to Solana via RPC
        # For demo, we'll return simulated data
        congestion_percentage = random.randint(5, 40)
        
        # Status determination based on congestion
        congestion_status = "Low"
        if congestion_percentage > 30:
            congestion_status = "High"
        elif congestion_percentage > 15:
            congestion_status = "Medium"
            
        # Calculate estimated confirmation time
        confirmation_time = "~0.3s"
        if congestion_percentage > 30:
            confirmation_time = "~1.2s"
        elif congestion_percentage > 15:
            confirmation_time = "~0.6s"
            
        # Priority fee recommendation
        priority_fee = "0.000005"
        if congestion_percentage > 30:
            priority_fee = "0.000025"
        elif congestion_percentage > 15:
            priority_fee = "0.000010"
            
        # Status for priority fee
        priority_fee_status = "Standard"
        if congestion_percentage > 30:
            priority_fee_status = "High - Recommended"
        elif congestion_percentage > 15:
            priority_fee_status = "Medium"
        
        # Other network stats with random variations
        response = {
            "congestionPercentage": congestion_percentage,
            "congestionStatus": congestion_status,
            "avgConfirmationTime": confirmation_time,
            "confirmationStatus": "Normal" if congestion_percentage < 25 else "Delayed",
            "recommendedPriorityFee": priority_fee,
            "priorityFeeStatus": priority_fee_status,
            "blockTime": f"{random.randint(380, 420)}ms",
            "tps": random.randint(1500, 2500),
            "failedTxPercentage": random.randint(1, 5),
            "validatorCount": random.randint(1900, 2000),
            "blockTimeChange": random.uniform(-5, 5),
            "tpsChange": random.uniform(-10, 10),
            "failedTxChange": random.uniform(-2, 2),
            "validatorCountChange": random.uniform(-5, 5),
            "currentSlot": str(int(time.time() * 10))
        }
        
        # In a production app, save this data to the database
        # store_network_status(response)
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/historical-data', methods=['GET'])
def get_historical_data():
    timeframe = request.args.get('timeframe', 'week')
    
    # In a real implementation, this would query from the database
    # For demo, generate simulated data
    if timeframe == '24h':
        # Hourly data for last 24 hours
        data = [
            {"hour": f"{h}:00", "congestion": random.randint(5, 40)} 
            for h in range(24)
        ]
    elif timeframe == 'week':
        # Daily data for last week
        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        data = [
            {"day": day, "congestion": random.randint(5, 40)} 
            for day in days
        ]
    else:  # month
        # Weekly data for last month
        data = [
            {"week": f"Week {w}", "congestion": random.randint(5, 40)} 
            for w in range(1, 5)
        ]
    
    return jsonify({"timeframe": timeframe, "data": data})

@app.route('/api/priority-fee-recommendation', methods=['POST'])
def calculate_priority_fee():
    try:
        data = request.json
        transaction_type = data.get('transactionType', 'token-transfer')
        priority = data.get('priority', 'standard')
        user_priority_fee = data.get('priorityFee', '0.000')
        
        # Base fee is constant
        base_fee = "0.000005"
        
        # Calculate recommended priority fee based on type and priority
        priority_fee = "0.000005"  # default
        
        if priority == "urgent":
            priority_fee = "0.000020"
        elif priority == "fast":
            priority_fee = "0.000010"
            
        # Adjust for transaction type
        if transaction_type == "nft-purchase":
            priority_fee = str(float(priority_fee) * 1.5)
        elif transaction_type == "smart-contract":
            priority_fee = str(float(priority_fee) * 2)
            
        # If user specified their own fee and it's higher, use that
        try:
            if float(user_priority_fee) > float(priority_fee):
                priority_fee = user_priority_fee
        except ValueError:
            pass
            
        # Calculate total fee
        total_fee = str(float(base_fee) + float(priority_fee))
        
        # Estimate time based on fee
        if float(priority_fee) >= 0.000020:
            estimated_time = "~0.3s"
        elif float(priority_fee) >= 0.000010:
            estimated_time = "~0.6s"
        else:
            estimated_time = "~1.2s"
            
        response = {
            "baseFee": base_fee,
            "priorityFee": priority_fee,
            "totalFee": total_fee,
            "estimatedTime": estimated_time
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Helper functions for database operations
def store_network_status(status_data):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                # Insert network status data
                cur.execute("""
                    INSERT INTO network_status 
                    (congestion_percentage, tps, block_time, failed_tx_percentage, slot) 
                    VALUES (%s, %s, %s, %s, %s)
                """, 
                (
                    status_data['congestionPercentage'],
                    status_data['tps'],
                    int(status_data['blockTime'].replace('ms', '')),
                    status_data['failedTxPercentage'],
                    status_data['currentSlot']
                ))
    except Exception as e:
        print(f"Error storing network status: {e}")

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
