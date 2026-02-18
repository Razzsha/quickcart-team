# API Testing Guide

## Prerequisites
- Backend server running on `http://localhost:5000`
- WhatsApp QR code scanned and client ready
- MongoDB running

---

## Test 1: User Signup (WhatsApp OTP)

**Endpoint:** `POST http://localhost:5000/api/users/signup`

**Request:**
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
  "userId": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

**WhatsApp Message:** "Your QuickCart OTP is 123456"

---

## Test 2: Verify OTP

**Endpoint:** `POST http://localhost:5000/api/users/verify-otp`

**Request:**
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
  "user": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "isVerified": true
  }
}
```

**WhatsApp Message:** "Your QuickCart account created successfully"

---

## Test 3: Create Order

**Endpoint:** `POST http://localhost:5000/api/orders`

**Request:**
```json
{
  "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "items": [
    {
      "product": {
        "_id": "67a1f4e43f34a77b6dde9144",
        "name": "Apple AirPods Pro 2nd gen",
        "description": "Premium wireless earbuds",
        "price": 499.99,
        "offerPrice": 399.99,
        "image": ["https://example.com/image.jpg"],
        "category": "Earphone"
      },
      "quantity": 1
    }
  ],
  "amount": 399.99,
  "address": {
    "fullName": "John Doe",
    "phoneNumber": "1234567890",
    "pincode": "12345",
    "area": "123 Main Street",
    "city": "New York",
    "state": "NY"
  }
}
```

**Expected Response:**
```json
{
  "message": "Order created successfully",
  "order": {
    "_id": "...",
    "userId": "...",
    "items": [...],
    "amount": 399.99,
    "status": "Pending",
    ...
  }
}
```

**WhatsApp Message:** 
```
Your QuickCart order is Pending

Order Amount: $399.99
Order ID: 65a1b2c3d4e5f6g7h8i9j0k1
```

---

## Test 4: Get User Orders

**Endpoint:** `GET http://localhost:5000/api/orders/user/USER_ID`

**Expected Response:**
```json
[
  {
    "_id": "...",
    "userId": "...",
    "items": [...],
    "amount": 399.99,
    "status": "Pending",
    ...
  }
]
```

---

## Test 5: Get All Orders (Seller)

**Endpoint:** `GET http://localhost:5000/api/orders/all`

**Expected Response:**
```json
[
  {
    "_id": "...",
    "userId": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "items": [...],
    "amount": 399.99,
    "status": "Pending",
    ...
  }
]
```

---

## Test 6: Update Order Status (Complete Order)

**Endpoint:** `PATCH http://localhost:5000/api/orders/ORDER_ID/status`

**Request:**
```json
{
  "status": "Completed"
}
```

**Expected Response:**
```json
{
  "message": "Order status updated successfully",
  "order": {
    "_id": "...",
    "status": "Completed",
    ...
  }
}
```

**WhatsApp Message:**
```
Your QuickCart order is Completed

Order ID: 65a1b2c3d4e5f6g7h8i9j0k1
Amount: $399.99
```

---

## Using Postman

1. Create a new collection "QuickCart API"
2. Add all endpoints above
3. Set base URL: `http://localhost:5000`
4. Test each endpoint in sequence

---

## Using cURL Commands

### Signup
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

### Verify OTP
```bash
curl -X POST http://localhost:5000/api/users/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456"
  }'
```

### Create Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID_HERE",
    "items": [{
      "product": {
        "_id": "67a1f4e43f34a77b6dde9144",
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
      "fullName": "John Doe",
      "phoneNumber": "1234567890",
      "pincode": "12345",
      "area": "123 Main St",
      "city": "New York",
      "state": "NY"
    }
  }'
```

### Complete Order
```bash
curl -X PATCH http://localhost:5000/api/orders/ORDER_ID_HERE/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Completed"
  }'
```

---

## Expected Behavior

✅ **Signup:** Creates user, generates OTP, sends WhatsApp message
✅ **Verify OTP:** Verifies user, sends success WhatsApp message
✅ **Create Order:** Creates order, sends pending WhatsApp notification
✅ **Complete Order:** Updates status, sends completion WhatsApp notification

---

## Error Responses

### Invalid OTP
```json
{
  "error": "Invalid OTP"
}
```

### OTP Expired
```json
{
  "error": "OTP expired. Please request a new one."
}
```

### User Already Exists
```json
{
  "error": "User already exists"
}
```

### Missing Fields
```json
{
  "error": "All fields are required"
}
```

---

## Phone Number Format

- Use digits only: `1234567890`
- Include country code: `11234567890` (for US)
- WhatsApp will format automatically
- Example: `1234567890` → `1234567890@c.us`

**Important:** Phone number must have an active WhatsApp account.
