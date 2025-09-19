import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Example of a more secure API handling approach
// This is a demonstration - implement based on your needs

// Simple in-memory rate limiting (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limiting middleware
function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const limit = 10; // 10 requests
  const window = 60000; // per minute
  
  const userLimit = rateLimitMap.get(identifier);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + window
    });
    return true;
  }
  
  if (userLimit.count >= limit) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

// Simple encryption for demonstration (use proper KMS in production)
function encryptData(text: string, password: string): string {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(password, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

function decryptData(encryptedText: string, password: string): string {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(password, 'salt', 32);
  
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Hash IP for privacy-preserving rate limiting
function hashIdentifier(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    // 1. Get client identifier (IP or session ID)
    const clientIp = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const identifier = hashIdentifier(clientIp);
    
    // 2. Check rate limit
    if (!checkRateLimit(identifier)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }
    
    // 3. Validate request
    const body = await req.json();
    if (!body.action || !body.data) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    // 4. Log request (audit trail)
    console.log(`[AUDIT] ${new Date().toISOString()} - Client: ${identifier} - Action: ${body.action}`);
    
    // 5. Example: Secure key handling
    // In production, keys would be in environment variables or KMS
    const serverSideKey = process.env.MASTER_API_KEY;
    
    // 6. Process request based on action
    switch (body.action) {
      case 'encrypt':
        // Example: Encrypt user data before storage
        const encrypted = encryptData(
          body.data,
          process.env.ENCRYPTION_KEY || 'demo-key'
        );
        return NextResponse.json({ encrypted });
        
      case 'proxy':
        // Example: Proxy API call with server-side key
        // This way, client never sees the actual API key
        if (!serverSideKey) {
          return NextResponse.json(
            { error: 'Server not configured properly' },
            { status: 500 }
          );
        }
        
        // Make actual API call here with serverSideKey
        // const result = await callExternalAPI(serverSideKey, body.data);
        
        return NextResponse.json({ 
          message: 'This would proxy to external API with server key',
          // result 
        });
        
      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    // Log error securely (don't expose internals to client)
    console.error('[ERROR]', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Security headers middleware
export async function middleware(req: NextRequest) {
  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );
  
  return response;
}