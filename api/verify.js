
const rateLimit = new Map();

const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 10;

function checkRateLimit(ip) {
    const now = Date.now();
    const record = rateLimit.get(ip);

    if (!record || now - record.start > RATE_LIMIT_WINDOW) {
        rateLimit.set(ip, { start: now, count: 1 });
        return true;
    }

    if (record.count >= RATE_LIMIT_MAX) return false;

    record.count++;
    return true;
}

setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimit.entries()) {
        if (now - record.start > RATE_LIMIT_WINDOW * 2) {
            rateLimit.delete(ip);
        }
    }
}, RATE_LIMIT_WINDOW);

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://c0d-digital.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
        || req.headers['x-real-ip']
        || req.socket?.remoteAddress
        || 'unknown';

    if (!checkRateLimit(ip)) {
        return res.status(429).json({ error: 'Too many requests. Try again later.' });
    }

    const { turnstileToken } = req.body || {};

    if (!turnstileToken || typeof turnstileToken !== 'string' || turnstileToken.length > 2048) {
        return res.status(400).json({ error: 'Invalid token' });
    }

    const secret = process.env.TURNSTILE_SECRET;

    if (!secret) {
        console.error('TURNSTILE_SECRET not set');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const params = new URLSearchParams({
            secret: secret,
            response: turnstileToken,
            remoteip: ip,
        });

        const cfResponse = await fetch(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString(),
            }
        );

        const cfResult = await cfResponse.json();

        if (!cfResult.success) {
            console.warn('Turnstile failed:', cfResult['error-codes']);
            return res.status(403).json({ success: false, error: 'Verification failed' });
        }

        return res.status(200).json({ success: true });

    } catch (err) {
        console.error('Turnstile error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
