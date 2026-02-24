const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const puppeteer = require('puppeteer');

let whatsappClient = null;
let isReady = false;

// Initialize WhatsApp Client
const initializeWhatsApp = () => {
    if (whatsappClient) {
        return whatsappClient;
    }

    whatsappClient = new Client({
        authStrategy: new LocalAuth({
            dataPath: './whatsapp-session'
        }),
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ]
        }
    });

    // QR Code generation
    whatsappClient.on('qr', (qr) => {
        console.log('\n📱 WhatsApp QR Code - Scan with your phone:\n');
        qrcode.generate(qr, { small: true });
        console.log('\n');
    });

    // Ready event
    whatsappClient.on('ready', () => {
        console.log('✅ WhatsApp Client is ready!');
        isReady = true;
    });

    // Authentication failure
    whatsappClient.on('auth_failure', (msg) => {
        console.error('❌ WhatsApp Authentication failed:', msg);
        isReady = false;
    });

    // Disconnected event - Auto reconnect
    whatsappClient.on('disconnected', (reason) => {
        console.log('⚠️ WhatsApp Client disconnected:', reason);
        isReady = false;
        
        // Reset client and attempt to reconnect after 5 seconds
        setTimeout(() => {
            console.log('🔄 Attempting to reconnect WhatsApp...');
            whatsappClient = null;
            initializeWhatsApp();
        }, 5000);
    });

    // Error handling
    whatsappClient.on('error', (error) => {
        console.error('❌ WhatsApp Client error:', error);
    });

    // Initialize the client
    whatsappClient.initialize().catch(err => {
        console.error('❌ Failed to initialize WhatsApp Client:', err);
    });

    return whatsappClient;
};

// Known placeholder/test numbers - use user's real number instead
const PLACEHOLDER_NUMBERS = ['0123456789', '1234567890', '123456789', '01234567890'];

function isPlaceholderNumber(number) {
    if (!number) return false;
    const raw = String(number).replace(/[^0-9]/g, '').trim();
    return PLACEHOLDER_NUMBERS.includes(raw) || PLACEHOLDER_NUMBERS.includes(number.trim());
}

function formatPhoneNumber(number) {
    if (!number) throw new Error("Phone number required");

    // Remove spaces, +, -, ()
    number = number.replace(/[^\d]/g, '');

    // Remove 00 prefix
    if (number.startsWith('00')) {
        number = number.slice(2);
    }

    // INDIA
    if (number.startsWith('91')) {
        let local = number.slice(2);
        if (local.startsWith('0')) {
            local = local.slice(1);
        }
        if (local.length !== 10) {
            throw new Error("Invalid Indian number");
        }
        return '91' + local;
    }

    // NEPAL
    if (number.startsWith('977')) {
        let local = number.slice(3);
        if (local.startsWith('0')) {
            local = local.slice(1);
        }
        if (local.length !== 10) {
            throw new Error("Invalid Nepali number");
        }
        return '977' + local;
    }

    // If starts with 0 → remove 0 and treat as Nepal
    if (number.startsWith('0')) {
        let local = number.slice(1);
        if (local.length === 9 || local.length === 10) {
            return '977' + local;
        }
    }

    // If 10 digit and no code → default Nepal
    if (number.length === 10) {
        return '977' + number;
    }

    throw new Error("Invalid phone number format");
}

// Send WhatsApp Message
const sendWhatsAppMessage = async (number, message) => {
    try {
        // Ensure client is initialized
        if (!whatsappClient) {
            whatsappClient = initializeWhatsApp();
        }

        // Wait for client to be ready (max 30 seconds)
        let attempts = 0;
        while (!isReady && attempts < 30) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
        }

        if (!isReady) {
            throw new Error('WhatsApp client is not ready. Please scan QR code first.');
        }

        let formattedNumber;
        let phoneNumber;

        // If already includes @c.us, extract raw number
        if (number.includes('@c.us')) {
            const rawNumber = number.replace('@c.us', '').replace(/[^0-9]/g, '');
            formattedNumber = formatPhoneNumber(number);
            phoneNumber = `${formattedNumber}@c.us`;
        } else {
            formattedNumber = formatPhoneNumber(number);
            phoneNumber = `${formattedNumber}@c.us`;
        }

        // Verify number exists on WhatsApp before sending (prevents cryptic "t: t" errors)
        const numberId = await whatsappClient.getNumberId(phoneNumber);
        if (!numberId) {
            const msg = `Number ${number} is not registered on WhatsApp. Use a real WhatsApp number.`;
            console.warn(`⚠️ ${msg}`);
            throw new Error(msg);
        }

        // Use the verified chat ID from getNumberId
        const chatId = numberId._serialized;
        console.log(`ℹ️ Sending WhatsApp message to ${number}`);

        // Send message
        const result = await whatsappClient.sendMessage(chatId, message);
        console.log(`✅ WhatsApp message sent to ${number}`);
        return { success: true, messageId: result.id._serialized };
    } catch (error) {
        // Improve cryptic "t: t" / "a" style minified errors from puppeteer/whatsapp-web.js
        const errMsg = String(error?.message || error);
        if (errMsg.length <= 10 && (/^[a-z]:\s*[a-z]$/i.test(errMsg) || /^[a-z]$/i.test(errMsg.trim()))) {
            console.error(`❌ Failed to send WhatsApp to ${number}: Invalid number or not registered on WhatsApp. Use a real phone number in international format (e.g., 201234567890).`);
            throw new Error(`Invalid WhatsApp number. Use a real phone number in international format.`);
        }
        console.error(`❌ Failed to send WhatsApp message to ${number}:`, error);
        throw error;
    }
};

// Initialize on module load
initializeWhatsApp();

module.exports = {
    sendWhatsAppMessage,
    initializeWhatsApp,
    isPlaceholderNumber,
    getClient: () => whatsappClient,
    isReady: () => isReady
};
