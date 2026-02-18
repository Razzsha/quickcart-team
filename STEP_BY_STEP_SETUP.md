# Step-by-Step Setup Guide - QuickCart WhatsApp Integration

## 🎯 Complete Setup Instructions

Follow these steps **in order** to get your project fully working.

---

## STEP 1: Verify Prerequisites ✅

Before starting, ensure you have:

- [ ] **Node.js** installed (v16+)
  - Check: `node --version`
  - Download: https://nodejs.org/

- [ ] **MongoDB** installed and running
  - Check: `mongosh` or `mongo --version`
  - Download: https://www.mongodb.com/try/download/community

- [ ] **WhatsApp** account (for scanning QR code)

- [ ] **Terminal/Command Prompt** access

---

## STEP 2: Install Dependencies 📦

Open terminal in project root directory:

```bash
npm install
```

**Expected Output:**
```
added 250 packages in 30s
```

**If errors occur:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## STEP 3: Setup MongoDB 🗄️

### Option A: Local MongoDB

**Windows:**
- MongoDB usually runs as a service
- Check: Open Services → MongoDB
- If not running: Start MongoDB service

**Mac:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Verify MongoDB is running:**
```bash
mongosh
# Should connect successfully
```

### Option B: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create new cluster
4. Get connection string
5. Use in Step 4

---

## STEP 4: Create Environment File 🔧

Create `.env` file in **root directory**:

**Windows (Command Prompt):**
```cmd
type nul > .env
```

**Mac/Linux:**
```bash
touch .env
```

**Add this content to `.env`:**
```env
MONGO_URI=mongodb://127.0.0.1:27017/quickcart
PORT=5000
NEXT_PUBLIC_CURRENCY=$
```

**For MongoDB Atlas, use:**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/quickcart
PORT=5000
NEXT_PUBLIC_CURRENCY=$
```

**Save the file.**

---

## STEP 5: Start Backend Server 🚀

Open terminal in project root:

```bash
node backend/app.js
```

**Expected Output:**
```
✅ MongoDB Connected
📱 WhatsApp QR Code - Scan with your phone:

[QR CODE APPEARS HERE]

✅ WhatsApp Client is ready!
🚀 Server running on port 5000
```

**If you see errors:**
- MongoDB not running → Go back to Step 3
- Port 5000 in use → Change PORT in .env
- Module not found → Run `npm install` again

---

## STEP 6: Scan WhatsApp QR Code 📱

**When QR code appears:**

1. Open **WhatsApp** on your phone
2. Go to **Settings** (⚙️)
3. Tap **Linked Devices**
4. Tap **Link a Device**
5. **Scan the QR code** from terminal
6. Wait for "✅ WhatsApp Client is ready!" message

**Important:**
- Keep terminal open (don't close)
- QR code only appears first time
- Session saved in `whatsapp-session` folder

---

## STEP 7: Start Frontend (New Terminal) 🌐

Open a **NEW terminal window** (keep backend running):

```bash
npm run dev
```

**Expected Output:**
```
  ▲ Next.js 15.1.6
  - Local:        http://localhost:3000
  - Ready in 2.5s
```

**Open browser:** http://localhost:3000

---

## STEP 8: Test WhatsApp Integration 🧪

### Test 1: Signup (Send OTP)

**Using Postman or cURL:**

**POST** `http://localhost:5000/api/users/signup`

**Body (JSON):**
```json
{
  "name": "Test User",
  "email": "test@example.com",
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

**Check WhatsApp:** You should receive OTP message!

---

### Test 2: Verify OTP

**POST** `http://localhost:5000/api/users/verify-otp`

**Body (JSON):**
```json
{
  "email": "test@example.com",
  "otp": "123456"
}
```

**Check WhatsApp:** You should receive success message!

---

### Test 3: Create Order

**POST** `http://localhost:5000/api/orders`

**Body (JSON):**
```json
{
  "userId": "USER_ID_FROM_SIGNUP",
  "items": [{
    "product": {
      "_id": "test123",
      "name": "Test Product",
      "price": 100,
      "offerPrice": 80,
      "image": ["https://example.com/image.jpg"],
      "category": "Electronics"
    },
    "quantity": 1
  }],
  "amount": 80,
  "address": {
    "fullName": "Test User",
    "phoneNumber": "1234567890",
    "pincode": "12345",
    "area": "123 Main St",
    "city": "New York",
    "state": "NY"
  }
}
```

**Check WhatsApp:** You should receive order pending notification!

---

### Test 4: Complete Order

**PATCH** `http://localhost:5000/api/orders/ORDER_ID/status`

**Body (JSON):**
```json
{
  "status": "Completed"
}
```

**Check WhatsApp:** You should receive completion notification!

---

## STEP 9: Verify Everything Works ✅

**Checklist:**

- [ ] Backend server running (port 5000)
- [ ] Frontend running (port 3000)
- [ ] MongoDB connected
- [ ] WhatsApp QR code scanned
- [ ] "✅ WhatsApp Client is ready!" message
- [ ] Signup sends OTP via WhatsApp
- [ ] Verify OTP sends success message
- [ ] Order creation sends notification
- [ ] Order completion sends notification

---

## Troubleshooting 🔧

### Problem: QR Code Not Appearing

**Solution:**
```bash
# Delete session folder
rm -rf whatsapp-session
# Or on Windows:
rmdir /s whatsapp-session

# Restart backend
node backend/app.js
```

---

### Problem: MongoDB Connection Error

**Solution:**
1. Check MongoDB is running: `mongosh`
2. Verify MONGO_URI in `.env`
3. For Atlas: Check IP whitelist and credentials

---

### Problem: WhatsApp Messages Not Sending

**Solution:**
1. Ensure "✅ WhatsApp Client is ready!" appears
2. Check phone number format (digits only)
3. Verify phone has WhatsApp account
4. Check terminal for error messages

---

### Problem: Port Already in Use

**Solution:**
```bash
# Change PORT in .env
PORT=5001

# Or kill process using port
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill
```

---

### Problem: Module Not Found Errors

**Solution:**
```bash
npm install
# If still fails:
rm -rf node_modules package-lock.json
npm install
```

---

## Project Structure 📁

```
quickcart-team/
├── backend/
│   ├── app.js              ← Main server (START HERE)
│   ├── web.js              ← WhatsApp client
│   ├── controllers/        ← Business logic
│   ├── models/            ← Database schemas
│   └── routes/            ← API endpoints
├── app/                   ← Next.js frontend
├── components/            ← React components
├── .env                   ← Environment variables (CREATE THIS)
├── package.json           ← Dependencies
└── whatsapp-session/     ← WhatsApp session (AUTO CREATED)
```

---

## Quick Reference Commands 📝

```bash
# Install dependencies
npm install

# Start backend
node backend/app.js

# Start frontend (new terminal)
npm run dev

# Check MongoDB
mongosh

# Delete WhatsApp session (to re-authenticate)
rm -rf whatsapp-session
```

---

## API Endpoints Reference 🔗

**Base URL:** `http://localhost:5000/api`

- `POST /users/signup` - Signup with OTP
- `POST /users/verify-otp` - Verify OTP
- `POST /orders` - Create order
- `GET /orders/user/:userId` - Get user orders
- `GET /orders/all` - Get all orders
- `PATCH /orders/:orderId/status` - Update order status

---

## Success Indicators ✅

You'll know everything is working when:

1. ✅ Backend shows: "✅ MongoDB Connected"
2. ✅ Backend shows: "✅ WhatsApp Client is ready!"
3. ✅ Backend shows: "🚀 Server running on port 5000"
4. ✅ Frontend shows: "Ready in X.Xs" and opens in browser
5. ✅ WhatsApp messages are received
6. ✅ API endpoints return success responses

---

## Next Steps 🚀

After setup is complete:

1. Integrate frontend forms with backend APIs
2. Add authentication middleware
3. Implement password hashing
4. Add input validation
5. Deploy to production

---

## Support 📞

If you encounter issues:

1. Check terminal logs for errors
2. Verify all prerequisites are installed
3. Check MongoDB is running
4. Verify WhatsApp QR code is scanned
5. Review SETUP_INSTRUCTIONS.md for detailed help

---

**🎉 Setup Complete!**

Your QuickCart WhatsApp integration is now fully functional!
