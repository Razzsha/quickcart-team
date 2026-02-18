const User = require('../models/User');
const { sendWhatsAppMessage } = require('../web');

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Signup - Send OTP via WhatsApp
exports.signup = async (req, res) => {
    try {
        const { name, email, password, phoneNumber } = req.body;

        // Validate required fields
        if (!name || !email || !password || !phoneNumber) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        // If user exists but is NOT verified, re-send OTP instead of blocking signup
        if (existingUser && !existingUser.isVerified) {
            const otp = generateOTP();
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            existingUser.name = name;
            existingUser.password = password;
            existingUser.phoneNumber = phoneNumber;
            existingUser.otp = otp;
            existingUser.otpExpiry = otpExpiry;
            await existingUser.save();

            try {
                const message = `Your QuickCart OTP is ${otp}`;
                await sendWhatsAppMessage(phoneNumber, message);
            } catch (whatsappError) {
                console.error('WhatsApp OTP re-send failed:', whatsappError);
            }

            return res.status(200).json({
                message: 'OTP re-sent to your WhatsApp number',
                userId: existingUser._id
            });
        }

        // If user exists and is already verified, block signup
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Create user with OTP
        const user = await User.create({
            name,
            email,
            password,
            phoneNumber,
            otp,
            otpExpiry,
            isVerified: false
        });

        // Send OTP via WhatsApp
        try {
            const message = `Your QuickCart OTP is ${otp}`;
            await sendWhatsAppMessage(phoneNumber, message);
        } catch (whatsappError) {
            console.error('WhatsApp OTP send failed:', whatsappError);
            // Continue even if WhatsApp fails - user can still verify via other means
        }

        res.status(201).json({
            message: 'OTP sent to your WhatsApp number',
            userId: user._id
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if OTP is valid
        if (user.otp !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // Check if OTP is expired
        if (new Date() > user.otpExpiry) {
            return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
        }

        // Verify user
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        // Send success message via WhatsApp
        try {
            const message = 'Your QuickCart account created successfully';
            await sendWhatsAppMessage(user.phoneNumber, message);
        } catch (whatsappError) {
            console.error('WhatsApp success message send failed:', whatsappError);
        }

        res.status(200).json({
            message: 'Account verified successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                isVerified: user.isVerified
            }
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Sign In
exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check if user is verified
        if (!user.isVerified) {
            return res.status(401).json({ error: 'Please verify your account first. Check your WhatsApp for OTP.' });
        }

        // Check password (simple comparison - in production, use bcrypt)
        if (user.password !== password) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        res.status(200).json({
            message: 'Sign in successful',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                isVerified: user.isVerified
            }
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
