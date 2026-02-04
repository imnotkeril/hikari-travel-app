# Local Development Setup Guide

This guide explains how to run the app locally on your PC after cloning from GitHub.

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

3. **Configure environment variables**:
   - Open the `.env` file in the project root
   - Make sure it's configured for local development:
     ```
     EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:8081
     OPENAI_API_KEY=your_openai_api_key_here
     ```

4. **Get your OpenAI API Key** (for AI features):
   - Visit https://platform.openai.com/api-keys
   - Sign in or create an account
   - Click "Create new secret key"
   - Copy your API key (starts with `sk-`)
   - Add it to `.env` file

5. **Start the development server**:
   ```bash
   bun run start
   ```
   
   The backend server will start automatically on port 8081.
   The database will be initialized with all attractions, cafes, events, and tours.

6. **Open the app**:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator  
   - Press `w` for web browser
   - Or scan QR code with Expo Go app on your phone

## Important Notes

- **Backend runs automatically** - The backend API server starts when you run `bun run start`
- **Database is in-memory** - Data resets when you restart the server (this is normal for development)
- **Never commit your .env file** - It's already in `.gitignore`
- **Keep your API key secure** - Don't share it publicly
- **Restart the server** after changing the `.env` file
- The AI features will only work after you add a valid OpenAI API key

## Switching Between Rork Cloud and Local

**To use Rork cloud backend** (when working in Rork):
```
EXPO_PUBLIC_RORK_API_BASE_URL=https://dev-3ytgo9wmrfbgudvblt0ko.rorktest.dev
```

**To use local backend** (when developing on your PC):
```
EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:8081
```

## Testing AI Features

Once configured, you can test the AI tour generator:

1. Open the app
2. Go to the Tours tab
3. Click the "+" button
4. Select "AI Tour Generator"
5. Chat with the AI to create a custom tour

## Troubleshooting

**App shows no data (attractions, cafes, events are empty)?**
- Make sure `EXPO_PUBLIC_RORK_API_BASE_URL` is set to `http://localhost:8081` in `.env`
- Restart the development server completely
- Check the console - you should see "Database seeded successfully"
- The backend server runs on port 8081 and initializes automatically

**AI not responding?**
- Check that your API key is correct in `.env`
- Restart the development server
- Check the console for error messages

**Backend not starting?**
- Make sure port 8081 is not in use by another app
- Try running with: `bun run start --clear` to clear cache
- Check if you have `app/+api.ts` file - this is where backend starts

**Still having issues?**
- Verify your OpenAI account has credits
- Check your API key permissions at https://platform.openai.com/api-keys
- Delete `node_modules` and run `bun install` again
