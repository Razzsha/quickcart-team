const Order = require('../models/Order');
const User = require('../models/User');
const { sendWhatsAppMessage, isPlaceholderNumber } = require('../web');

// Create Order
exports.createOrder = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;

        // Validate required fields
        if (!userId || !items || !amount || !address) {
            return res.status(400).json({ error: 'All fields are required (userId, items, amount, address)' });
        }

        // Validate userId is a valid MongoDB ObjectId (24 hex chars)
        if (!/^[a-fA-F0-9]{24}$/.test(userId)) {
            return res.status(400).json({ error: 'Invalid user. Please sign in again.' });
        }

        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Create order
        const order = await Order.create({
            userId,
            items,
            amount,
            address,
            status: 'Pending'
        });

        // Send WhatsApp notification - use user's real number if address has placeholder
        try {
            let phoneNumber = address.phoneNumber || user.phoneNumber;
            if (isPlaceholderNumber(phoneNumber)) {
                phoneNumber = user.phoneNumber;
            }
            if (phoneNumber) {
                const message = `Your QuickCart order is Pending\n\nOrder Amount: $${amount.toFixed(2)}\nOrder ID: ${order._id}`;
                await sendWhatsAppMessage(phoneNumber, message);
            }
        } catch (whatsappError) {
            console.error('WhatsApp order notification failed:', whatsappError);
            // Continue even if WhatsApp fails
        }

        res.status(201).json({
            message: 'Order created successfully',
            order
        });
    } catch (err) {
        console.error('Create order error:', err.message);
        res.status(400).json({ error: err.message || 'Failed to create order' });
    }
};

// Get User Orders
exports.getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get All Orders (for seller)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }).populate('userId', 'name email');
        res.status(200).json(orders);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update Order Status (Sends WhatsApp notification for all status changes)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await Order.findById(orderId).populate('userId', 'name email phoneNumber');
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const oldStatus = order.status;
        order.status = status;
        await order.save();

        // Send WhatsApp notification for all status changes
        if (status !== oldStatus) {
            try {
                // Use user's real number if address has placeholder - never skip sending
                let phoneNumber = order.address?.phoneNumber || (order.userId && order.userId.phoneNumber);
                if (isPlaceholderNumber(phoneNumber)) {
                    phoneNumber = order.userId?.phoneNumber;
                }
                if (phoneNumber) {
                    let message = '';
                    
                    switch (status) {
                        case 'Pending':
                            message = `Your QuickCart order status has been updated to Pending\n\nOrder ID: ${order._id}\nAmount: $${order.amount.toFixed(2)}\n\nWe are processing your order.`;
                            break;
                        case 'Processing':
                            message = `Your QuickCart order is now Processing\n\nOrder ID: ${order._id}\nAmount: $${order.amount.toFixed(2)}\n\nYour order is being prepared for shipment.`;
                            break;
                        case 'Completed':
                            message = `Your QuickCart order is Completed!\n\nOrder ID: ${order._id}\nAmount: $${order.amount.toFixed(2)}\n\nThank you for shopping with us!`;
                            break;
                        case 'Cancelled':
                            message = `Your QuickCart order has been Cancelled\n\nOrder ID: ${order._id}\nAmount: $${order.amount.toFixed(2)}\n\nIf you have any questions, please contact us.`;
                            break;
                        default:
                            message = `Your QuickCart order status has been updated to ${status}\n\nOrder ID: ${order._id}\nAmount: $${order.amount.toFixed(2)}`;
                    }
                    
                    await sendWhatsAppMessage(phoneNumber, message);
                    console.log(`✅ WhatsApp notification sent for order ${order._id} - Status: ${status}`);
                }
            } catch (whatsappError) {
                console.error(`❌ WhatsApp notification failed for order ${order._id}:`, whatsappError.message);
                // Continue even if WhatsApp fails
            }
        }

        res.status(200).json({
            message: 'Order status updated successfully',
            order
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
