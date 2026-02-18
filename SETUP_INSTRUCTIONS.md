# QuickCart WhatsApp Integration - Complete Setup Guide

## Prerequisites

Before starting, ensure you have:
- Node.js (v16 or higher) installed
- MongoDB installed and running locally OR MongoDB Atlas account
- WhatsApp account (for scanning QR code)
- Git (optional, for version control)

---

## Step 1: Install Dependencies

Open your terminal in the project root directory and run:

```bash
npm install
```

This will install all required dependencies including:
- Next.js and React (frontend)
- Express, Mongoose (backend)
- whatsapp-web.js (WhatsApp integration)
- qrcode-terminal (QR code display)

---

## Step 2: Setup MongoDB

### Option A: Local MongoDB

1. Make sure MongoDB is installed and running on your system
2. MongoDB should be running on `mongodb://127.0.0.1:27017` (default)

### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `.env` file (see Step 3)

---

## Step 3: Configure Environment Variables

Create a `.env` file in the root directory (if it doesn't exist):

```env
# MongoDB Connection
MONGO_URI=mongodb://127.0.0.1:27017/quickcart

# Server Port (optional, defaults to 5000)
PORT=5000

# Frontend Currency (optional)
NEXT_PUBLIC_CURRENCY=$
```

**For MongoDB Atlas**, use:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/quickcart
```

---

## Step 4: Start MongoDB (if using local)

### Windows:
```bash
# If MongoDB is installed as a service, it should start automatically
# Or start manually:
mongod
```

### macOS:
```bash
brew services start mongodb-community
```

### Linux:
```bash
sudo systemctl start mongod
```

---

## Step 5: Start the Backend Server

Open a terminal and run:

```bash
node backend/app.js
```

**Expected Output:**
```
✅ MongoDB Connected
📱 WhatsApp QR Code - Scan with your phone:
[QR Code will appear here]
✅ WhatsApp Client is ready!
🚀 Server running on port 5000
```

### First Time Setup:
1. **QR Code will appear** in the terminal
2. **Open WhatsApp** on your phone
3. **Go to Settings > Linked Devices**
4. **Tap "Link a Device"**
5. **Scan the QR code** from the terminal
6. Wait for "✅ WhatsApp Client is ready!" message

**Note:** After first scan, the session is saved. You won't need to scan again unless you delete the `whatsapp-session` folder.

---

## Step 6: Start the Frontend (Next.js)

Open a **NEW terminal** window (keep backend running) and run:

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

---

## Step 7: Test the Integration

### Test 1: User Signup with WhatsApp OTP

**Endpoint:** `POST http://localhost:5000/api/users/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phoneNumber": "1234567890"
}
```

**Expected Response:**
```json
{
  "message": "OTP sent to your WhatsApp number",
  "userId": "..."
}
```

**Check WhatsApp:** You should receive: "Your QuickCart OTP is 123456"

### Test 2: Verify OTP

**Endpoint:** `POST http://localhost:5000/api/users/verify-otp`

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Expected Response:**
```json
{
  "message": "Account verified successfully",
  "user": { ... }
}
```

**Check WhatsApp:** You should receive: "Your QuickCart account created successfully"

### Test 3: Create Order

**Endpoint:** `POST http://localhost:5000/api/orders`

**Request Body:**
```json
{
  "userId": "USER_ID_FROM_SIGNUP",
  "items": [
    {
      "product": {
        "_id": "product_id",
        "name": "Test Product",
        "price": 100,
        "offerPrice": 80,
        "image": ["image_url"],
        "category": "Electronics"
      },
      "quantity": 2
    }
  ],
  "amount": 160,
  "address": {
    "fullName": "John Doe",
    "phoneNumber": "1234567890",
    "pincode": "12345",
    "area": "Main Street",
    "city": "New York",
    "state": "NY"
  }
}
```

**Check WhatsApp:** You should receive: "Your QuickCart order is Pending\n\nOrder Amount: $160.00\nOrder ID: ..."

### Test 4: Complete Order

**Endpoint:** `PATCH http://localhost:5000/api/orders/ORDER_ID/status`

**Request Body:**
```json
{
  "status": "Completed"
}
```

**Check WhatsApp:** You should receive: "Your QuickCart order is Completed\n\nOrder ID: ...\nAmount: $160.00"

---

## Step 8: Using Postman or cURL for Testing

### Signup:
```bash
curl -X POST http://localhost:5000/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phoneNumber": "1234567890"
  }'
```

### Verify OTP:
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456"
  }'
```

---

## Troubleshooting

### Issue 1: QR Code Not Appearing
- **Solution:** Make sure no other WhatsApp Web session is active
- Delete `whatsapp-session` folder and restart server

### Issue 2: MongoDB Connection Error
- **Solution:** 
  - Check if MongoDB is running: `mongosh` or `mongo`
  - Verify MONGO_URI in `.env` file
  - For Atlas: Check IP whitelist and credentials

### Issue 3: WhatsApp Messages Not Sending
- **Solution:**
  - Ensure WhatsApp client is ready (check terminal for "✅ WhatsApp Client is ready!")
  - Verify phone number format (should be digits only, e.g., "1234567890")
  - Check if phone number has WhatsApp account

### Issue 4: Port Already in Use
- **Solution:** Change PORT in `.env` file or kill the process using port 5000

### Issue 5: Dependencies Installation Fails
- **Solution:**
  ```bash
  npm cache clean --force
  rm -rf node_modules package-lock.json
  npm install
  ```

---

## Project Structure

```
quickcart-team/
├── backend/
│   ├── app.js                 # Main server file
│   ├── web.js                 # WhatsApp client setup
│   ├── controllers/
│   │   ├── userController.js  # User signup & OTP verification
│   │   └── orderController.js # Order management
│   ├── models/
│   │   ├── User.js           # User schema
│   │   └── Order.js           # Order schema
│   └── routes/
│       ├── user.js            # User routes
│       └── order.js           # Order routes
├── app/                       # Next.js frontend pages
├── components/               # React components
├── package.json              # Dependencies
└── .env                      # Environment variables
```

---

## API Endpoints Summary

### User Endpoints
- `POST /api/users/signup` - Signup and receive OTP via WhatsApp
- `POST /api/users/verify-otp` - Verify OTP and complete signup

### Order Endpoints
- `POST /api/orders` - Create order (sends WhatsApp notification)
- `GET /api/orders/user/:userId` - Get user's orders
- `GET /api/orders/all` - Get all orders (seller)
- `PATCH /api/orders/:orderId/status` - Update order status (sends completion notification)

---

## Important Notes

1. **Phone Number Format:** Use digits only (e.g., "1234567890"). Country code is optional but recommended.

2. **WhatsApp Session:** The session is saved in `./whatsapp-session` folder. Don't delete it unless you want to re-authenticate.

3. **OTP Expiry:** OTP expires after 10 minutes.

4. **Auto-Reconnect:** WhatsApp client automatically reconnects if disconnected.

5. **Error Handling:** If WhatsApp fails, the API still works (order/user creation succeeds, but notification fails).

---

## Next Steps

1. Integrate frontend forms with backend APIs
2. Add authentication middleware
3. Implement password hashing (bcrypt)
4. Add input validation
5. Set up error logging
6. Deploy to production

---

## Support

If you encounter any issues:
1. Check terminal logs for error messages
2. Verify all dependencies are installed
3. Ensure MongoDB is running
4. Verify WhatsApp QR code is scanned
5. Check phone number format

---

**Setup Complete! 🎉**

Your QuickCart WhatsApp integration is now ready to use!
