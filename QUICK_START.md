# Quick Start Guide - QuickCart WhatsApp Integration

## 🚀 Fast Setup (5 Minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Environment
Create `.env` file in root:
```env
MONGO_URI=mongodb://127.0.0.1:27017/quickcart
PORT=5000
NEXT_PUBLIC_CURRENCY=$
```

### Step 3: Start MongoDB
**Windows:** MongoDB should auto-start if installed as service
**Mac/Linux:** `sudo systemctl start mongod` or `brew services start mongodb-community`

### Step 4: Start Backend
```bash
node backend/app.js
```
**Scan QR Code** when it appears in terminal with your WhatsApp

### Step 5: Start Frontend (New Terminal)
```bash
npm run dev
```

### Step 6: Test
Open `http://localhost:3000` in browser

---

## 📱 Testing WhatsApp Integration

### Test Signup (Send OTP)
```bash
curl -X POST http://localhost:5000/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phoneNumber": "1234567890"
  }'
```
**Check WhatsApp** for OTP message

### Test Verify OTP
```bash
curl -X POST http://localhost:5000/api/users/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

---

## ✅ Verification Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] MongoDB running
- [ ] `.env` file created
- [ ] Backend started (`node backend/app.js`)
- [ ] QR Code scanned in WhatsApp
- [ ] "✅ WhatsApp Client is ready!" message appears
- [ ] Frontend started (`npm run dev`)
- [ ] Test signup sends WhatsApp OTP
- [ ] Test verify sends success message

---

## 🔧 Common Issues

**QR Code not appearing?**
- Delete `whatsapp-session` folder
- Restart backend server

**MongoDB connection error?**
- Check if MongoDB is running: `mongosh`
- Verify MONGO_URI in `.env`

**WhatsApp messages not sending?**
- Ensure "✅ WhatsApp Client is ready!" appears
- Check phone number format (digits only)
- Verify phone has WhatsApp account

---

For detailed instructions, see `SETUP_INSTRUCTIONS.md`
