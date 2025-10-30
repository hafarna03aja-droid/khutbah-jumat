<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1ES6d9rFkL7BYYl8afsGMGwII5kVX2J7O

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Vercel

### Quick Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/hafarna03aja-droid/khutbah-jumat)

### Manual Deploy Steps

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with your GitHub account
   - Click "New Project"
   - Import your `khutbah-jumat` repository

3. **Configure Environment Variables**:
   - In Vercel dashboard, go to your project settings
   - Navigate to "Environment Variables"
   - Add: `GEMINI_API_KEY` = `your_actual_api_key`

4. **Deploy**:
   - Vercel will automatically detect it's a Vite app
   - Click "Deploy"
   - Your app will be live at `https://your-project-name.vercel.app`

### Auto-Deploy
- Any push to `main` branch will automatically trigger a new deployment
- Pull request previews are automatically generated

## Project Structure
```
├── components/          # React components
├── services/           # API services (Gemini AI)
├── utils/             # Utility functions
├── vercel.json        # Vercel configuration
└── vite.config.ts     # Vite configuration
```
