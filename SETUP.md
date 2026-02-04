# AI Setup Guide

This app uses OpenAI for AI-powered tour generation.

## Quick Setup

1. **Clone the repository**:
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Get your OpenAI API Key**:
   - Visit https://platform.openai.com/api-keys
   - Sign in or create an account
   - Click "Create new secret key"
   - Copy your API key (starts with `sk-`)

4. **Configure environment variables**:
   - Open the `.env` file in the project root
   - Replace `your_openai_api_key_here` with your actual API key:
     ```
     OPENAI_API_KEY=sk-your-actual-openai-api-key-here
     ```

5. **Start the development server**:
   ```bash
   bun run start
   ```

## Important Notes

- **Never commit your .env file** - It's already in `.gitignore`
- **Keep your API key secure** - Don't share it publicly
- **Restart the server** after changing the `.env` file
- The AI features will only work after you add a valid OpenAI API key

## Testing AI Features

Once configured, you can test the AI tour generator:

1. Open the app
2. Go to the Tours tab
3. Click the "+" button
4. Select "AI Tour Generator"
5. Chat with the AI to create a custom tour

## Troubleshooting

**AI not responding?**
- Check that your API key is correct in `.env`
- Restart the development server
- Check the console for error messages

**Still having issues?**
- Verify your OpenAI account has credits
- Check your API key permissions at https://platform.openai.com/api-keys
