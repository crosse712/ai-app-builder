# API Security & Key Management

## How API Keys are Handled

This application is designed with security as a top priority. Here's how API keys are managed:

### 1. Local Storage Only
- **All API keys are stored locally in your browser's localStorage**
- Keys are never sent to our servers or stored in any backend database
- Keys are only transmitted directly to the respective service providers (Google AI, GitHub, Vercel)

### 2. Client-Side Processing
- The application sends your API key directly from your browser to the API providers
- The `/api/generate` endpoint receives the API key from the client and immediately uses it to call Google's Gemini API
- No server-side storage or logging of API keys occurs

### 3. Security Best Practices
- API keys are masked in the UI by default (password input type)
- Keys can be revealed temporarily using the eye icon
- Clear browser data to remove all stored keys
- Each user needs their own API keys

### 4. Getting Your API Keys

#### Google Gemini API Key (Required)
1. Visit https://aistudio.google.com/apikey
2. Sign in with your Google account (free)
3. Click "Get API Key" → "Create API Key"
4. Copy the key and paste it in Settings

**Free Tier Benefits:**
- 1,500 requests per day
- Access to Gemini 2.0 Flash model
- No credit card required

#### GitHub Token (Optional - for deployment)
1. Visit https://github.com/settings/tokens/new
2. Create a token with 'repo' scope
3. Copy and save in Settings

#### Vercel Token (Optional - for deployment)
1. Visit https://vercel.com/account/tokens
2. Create a new token
3. Copy and save in Settings

### 5. Error Handling
The application provides clear error messages when:
- No API key is configured
- An invalid API key is used
- API quota is exceeded
- Permission issues occur

### 6. Privacy Guarantee
- Your API keys remain in your browser
- Clearing browser data removes all keys
- No analytics or tracking of API usage
- Direct communication with service providers

## Troubleshooting

### "API key not valid" Error
- Ensure you've copied the complete API key
- Check that you're using the correct API key for each service
- Verify your API key hasn't expired or been revoked

### "API quota exceeded" Error
- Wait a moment and try again
- Check your usage at https://aistudio.google.com
- Consider upgrading if you need more requests

### Keys Not Saving
- Check if localStorage is enabled in your browser
- Try using a different browser or incognito mode
- Ensure cookies and site data are not blocked

## Security Recommendations
1. Never share your API keys with anyone
2. Regenerate keys if you suspect they've been compromised
3. Use different API keys for different projects
4. Monitor your API usage regularly
5. Clear browser data when using shared computers