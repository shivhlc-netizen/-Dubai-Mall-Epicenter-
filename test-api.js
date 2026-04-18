const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.join(__dirname, '.env');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && !k.startsWith('#') && v.length) {
      env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
}

async function verify() {
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.includes('your_')) {
    console.error('✗ ANTHROPIC_API_KEY is not set properly.');
    process.exit(1);
  }

  console.log('Verifying Anthropic API Key...');
  const client = new Anthropic({ apiKey });
  
  try {
    // Smallest possible call to verify key
    await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'Hi' }],
    });
    console.log('✓ Anthropic API Key is valid.');
  } catch (err) {
    console.error('✗ Anthropic API Key verification failed:', err.message);
    process.exit(1);
  }
}

verify();
