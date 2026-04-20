require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const https   = require('https');

const app        = express();
const PORT       = process.env.PORT || 5000;
const APIFY_TOKEN = process.env.APIFY_TOKEN || '';

app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────
//  Helper: extract username from Instagram URL
// ─────────────────────────────────────────────
function extractUsername(rawUrl) {
  try {
    const withProto = rawUrl.startsWith('http') ? rawUrl : 'https://' + rawUrl;
    const parsed    = new URL(withProto);
    const segments  = parsed.pathname.split('/').filter(Boolean);
    return segments[0]?.replace('@', '') || null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
//  Apify Instagram Profile Scraper
//  Free: $5 credit/month ≈ 50 scrapes, no credit card
//  Setup: https://apify.com → Settings → Integrations → API Token
// ─────────────────────────────────────────────
async function scrapeViaApify(username) {
  if (!APIFY_TOKEN) return null;

  console.log(`[Apify] Scraping @${username}...`);
  const bodyStr = JSON.stringify({ usernames: [username], resultsLimit: 1 });

  const result = await new Promise((resolve) => {
    const options = {
      hostname: 'api.apify.com',
      path: `/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}&timeout=60`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
      },
      timeout: 75000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        console.log(`[Apify] HTTP status: ${res.statusCode}`);
        console.log(`[Apify] Raw response (first 600 chars):`, data.slice(0, 600));
        try { resolve({ status: res.statusCode, json: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, json: null, raw: data.slice(0, 300) }); }
      });
    });
    req.on('error', (e) => { console.error('[Apify] error:', e.message); resolve(null); });
    req.on('timeout', () => { req.destroy(); resolve(null); });
    req.write(bodyStr);
    req.end();
  });

  if (!result) { console.log('[Apify] No response (network error)'); return null; }

  // Accept any 2xx status
  if (result.status < 200 || result.status >= 300) {
    console.log(`[Apify] Non-2xx status: ${result.status}`, result.json || result.raw);
    return null;
  }

  // Response can be an array or a wrapped object
  let items = result.json;
  if (!Array.isArray(items)) {
    // Some Apify endpoints wrap in { items: [...] }
    items = result.json?.items || result.json?.data || [];
  }

  console.log(`[Apify] Items count: ${items.length}`);
  if (items.length === 0) { console.log('[Apify] Empty result — profile may be private or not found'); return null; }

  const p = items[0];
  console.log(`[Apify] First item keys:`, Object.keys(p || {}).join(', '));

  if (!p) return null;

  // The actor returns camelCase fields — map all known variants
  const resolved = {
    username:      p.username      || p.userName    || username,
    followers:     p.followersCount ?? p.followers   ?? 0,
    following:     p.followsCount   ?? p.following   ?? p.followingCount ?? 0,
    bio:           p.biography      || p.bio         || '',
    hasProfilePic: p.hasProfilePicture ?? (!!p.profilePicUrl || !!p.profilePictureUrl),
    fullName:      p.fullName       || p.full_name   || '',
    isPrivate:     p.isPrivate      || false,
    isVerified:    p.isVerified     || p.verified    || false,
    postsCount:    p.postsCount     ?? p.mediaCount  ?? null,
  };

  console.log(`[Apify] ✅ Parsed profile:`, JSON.stringify(resolved));
  return resolved;
}

// ─────────────────────────────────────────────
//  Instagram Mobile API (no-auth attempt)
//  Rarely works now but kept as free fallback
// ─────────────────────────────────────────────
function scrapeViaMobileAPI(username) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'i.instagram.com',
      path: `/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Instagram 219.0.0.12.117 Android',
        'Accept': 'application/json',
        'x-ig-app-id': '936619743392459',
      },
      timeout: 8000,
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          const user = json?.data?.user;
          if (!user) return resolve(null);
          resolve({
            username:      user.username,
            followers:     user.edge_followed_by?.count ?? 0,
            following:     user.edge_follow?.count      ?? 0,
            bio:           user.biography || '',
            hasProfilePic: !!user.profile_pic_url_hd || !!user.profile_pic_url,
            fullName:      user.full_name || '',
            isPrivate:     user.is_private  || false,
            isVerified:    user.is_verified || false,
            postsCount:    user.edge_owner_to_timeline_media?.count ?? null,
          });
        } catch {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
    req.end();
  });
}

// ─────────────────────────────────────────────
//  Fake-profile ML logic (heuristic model)
// ─────────────────────────────────────────────
function predictFakeProfile({ followers, following, bio, hasProfilePic, isVerified, postsCount }) {
  const f  = Number(followers);
  const fg = Number(following);
  const reasons = [];
  let score = 0;

  if (isVerified) {
    return { prediction: 'Real Account', confidence: 5, reasons: ['Account is verified by Instagram ✓'] };
  }

  const ratio = fg > 0 ? f / fg : 0;
  if (ratio < 0.1 && f < 100) {
    score += 30;
    reasons.push('Very low follower-to-following ratio (typical of bot accounts)');
  } else if (ratio < 0.5 && f < 500) {
    score += 15;
    reasons.push('Low follower-to-following ratio compared to average users');
  }

  if (!hasProfilePic) {
    score += 25;
    reasons.push('No profile picture detected (common trait of fake accounts)');
  }

  const spamKeywords = ['click', 'link', 'dm', 'follow back', 'f4f', 'gain', 'free', 'win', 'giveaway', 'promo'];
  if (!bio || bio.trim().length === 0) {
    score += 20;
    reasons.push('Empty bio — real users typically write something about themselves');
  } else {
    const hits = spamKeywords.filter(kw => bio.toLowerCase().includes(kw));
    if (hits.length >= 2) {
      score += 20;
      reasons.push(`Suspicious bio keywords detected: ${hits.join(', ')}`);
    }
  }

  if (fg > 2000 && f < 200) {
    score += 15;
    reasons.push('Following too many accounts relative to followers — mass-follow tactic');
  }

  if (f < 20) {
    score += 10;
    reasons.push('Extremely low follower count suggests a newly created or inactive account');
  }

  if (postsCount !== null && postsCount === 0) {
    score += 10;
    reasons.push('No posts published — inactive or placeholder account');
  }

  const confidence = Math.min(score, 97);
  return {
    prediction: confidence >= 45 ? 'Fake Account' : 'Real Account',
    confidence,
    reasons: reasons.slice(0, 3),
  };
}

// ─────────────────────────────────────────────
//  POST /analyze-profile
//  Priority: Apify → Mobile API → Mock → Manual
// ─────────────────────────────────────────────
app.post('/analyze-profile', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const username = extractUsername(url);
  if (!username) return res.status(400).json({ error: 'Could not extract username from URL' });

  console.log(`\n[analyze-profile] ▶  Username: "${username}" | Apify: ${!!APIFY_TOKEN}`);

  // 1️⃣ Apify — best free scraper (~50 scrapes/month free)
  if (APIFY_TOKEN) {
    console.log('[analyze-profile] → Trying Apify...');
    const result = await scrapeViaApify(username);
    if (result) return res.json({ success: true, scraped: true, source: 'apify', profile: result });
    console.log('[analyze-profile] ✗ Apify failed');
  }

  // 2️⃣ Instagram mobile API (free, rarely works)
  console.log('[analyze-profile] → Trying Instagram mobile API...');
  const mobileResult = await scrapeViaMobileAPI(username);
  if (mobileResult) {
    return res.json({ success: true, scraped: true, source: 'mobile-api', profile: mobileResult });
  }
  console.log('[analyze-profile] ✗ Mobile API blocked');

  // 3️⃣ Built-in demo profiles
  const mockProfiles = {
    realuser: {
      username: 'realuser', followers: 1240, following: 380,
      bio: 'Software engineer. Coffee lover. Building cool stuff.',
      hasProfilePic: true, isVerified: false, postsCount: 48,
    },
    fakebot99: {
      username: 'fakebot99', followers: 12, following: 3800,
      bio: 'DM for follow back! Free giveaway link in bio',
      hasProfilePic: false, isVerified: false, postsCount: 0,
    },
  };

  if (mockProfiles[username]) {
    console.log(`[analyze-profile] ✅ Using demo data for @${username}`);
    return res.json({ success: true, scraped: true, source: 'mock', profile: mockProfiles[username] });
  }

  // 4️⃣ Manual fallback
  console.log('[analyze-profile] ⚠️  All methods failed — prompting manual input.');
  return res.json({
    success: true,
    scraped: false,
    partial: true,
    profile: { username, followers: null, following: null, bio: null, hasProfilePic: null },
    message: APIFY_TOKEN
      ? `Apify returned no data for @${username}. The account may be private or doesn't exist.`
      : `Add a free Apify token to .env (APIFY_TOKEN) to enable auto-scraping for any public profile.`,
    needsApiKey: !APIFY_TOKEN,
  });
});

// ─────────────────────────────────────────────
//  POST /predict-fake-profile
// ─────────────────────────────────────────────
app.post('/predict-fake-profile', (req, res) => {
  const { followers, following, bio, hasProfilePic, username, isVerified, postsCount } = req.body;
  if (followers === undefined || following === undefined) {
    return res.status(400).json({ error: 'followers and following are required' });
  }
  const result = predictFakeProfile({ followers, following, bio, hasProfilePic, isVerified, postsCount });
  res.json({ ...result, username });
});

// ─────────────────────────────────────────────
//  POST /detect-spam
// ─────────────────────────────────────────────
app.post('/detect-spam', (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'message is required' });

  const spamIndicators = [
    'win', 'winner', 'prize', 'free', 'click here', 'limited time',
    'act now', 'urgent', 'congratulations', 'selected', 'claim',
    'offer expires', '100% free', 'risk-free', 'no credit card',
    'earn money', 'make money', 'work from home', 'extra income',
    'cheap', 'buy now', 'order now', 'subscribe', 'unsubscribe',
    'nigerian', 'inheritance', 'lottery', 'loan', 'bitcoin',
  ];

  const msgLower = message.toLowerCase();
  const hits = spamIndicators.filter(kw => msgLower.includes(kw));
  const score = Math.min((hits.length / spamIndicators.length) * 100 * 6, 98);
  const isSpam = hits.length >= 2 || score >= 40;

  res.json({
    prediction: isSpam ? 'Spam' : 'Not Spam',
    confidence: isSpam ? Math.max(score, 72) : Math.max(100 - score, 78),
    matchedKeywords: hits.slice(0, 5),
  });
});

// ─────────────────────────────────────────────
//  POST /detect-phishing
// ─────────────────────────────────────────────
app.post('/detect-phishing', (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const phishingIndicators = [
    { pattern: /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/, label: 'IP address used instead of domain name' },
    { pattern: /paypal|amazon|apple|microsoft|google|facebook|instagram|netflix|bank/i, label: 'Brand name in suspicious URL' },
    { pattern: /login|signin|verify|account|secure|update|confirm/i, label: 'Suspicious authentication keyword in URL' },
    { pattern: /\.tk$|\.ml$|\.ga$|\.cf$|\.gq$/i, label: 'Free/suspicious TLD detected' },
    { pattern: /https?:\/\/(?!www\.)[^/]{30,}/, label: 'Unusually long subdomain or hostname' },
    { pattern: /--/, label: 'Double hyphens detected in domain' },
    { pattern: /@/, label: '@ symbol used in URL (redirection trick)' },
    { pattern: /bit\.ly|tinyurl|goo\.gl|t\.co|ow\.ly/i, label: 'URL shortener detected' },
  ];

  const flags = phishingIndicators.filter(ind => ind.pattern.test(url));
  const isPhishing = flags.length >= 2;
  const confidence = Math.min(flags.length * 20 + 40, 97);

  let domain = '';
  try { domain = new URL(url).hostname; } catch { domain = url; }

  res.json({
    prediction: isPhishing ? 'Phishing' : 'Safe',
    confidence: isPhishing ? confidence : Math.max(100 - confidence, 75),
    flags: flags.map(f => f.label).slice(0, 4),
    domain,
  });
});

// ─────────────────────────────────────────────
//  GET /health
// ─────────────────────────────────────────────
app.get('/health', (req, res) => res.json({
  status: 'ok',
  apifyConfigured: !!APIFY_TOKEN,
  timestamp: new Date().toISOString(),
}));

app.listen(PORT, () => {
  console.log(`\n🛡️  CyberShield API running on http://localhost:${PORT}`);
  console.log(`📡  Apify: ${APIFY_TOKEN ? '✅ Configured — auto-scraping ENABLED' : '⚠️  Not configured — add APIFY_TOKEN to .env'}`);
  if (!APIFY_TOKEN) {
    console.log(`    → Sign up free at: https://apify.com`);
    console.log(`    → Settings → Integrations → copy API token → paste as APIFY_TOKEN in .env\n`);
  }
});
