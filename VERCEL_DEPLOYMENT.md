# Vercel Deployment Guide

This version of the Pune Mess Menu App is optimized for Vercel deployment with serverless functions.

## Features

- ✅ **Vercel-compatible** - Uses serverless functions instead of Express server
- ✅ **Image uploads work** - Direct upload to Cloudinary via base64
- ✅ **5-hour auto-expiration** - Menus automatically expire after 5 hours
- ✅ **Real-time updates** - Auto-refresh every 30 seconds
- ✅ **No server required** - Fully serverless architecture

## Deployment Steps

### 1. Prepare Your Environment Variables

Set these in your Vercel dashboard:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 2. Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Vercel optimized version"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect the configuration

3. **Set Environment Variables:**
   - In your Vercel project dashboard
   - Go to Settings → Environment Variables
   - Add all the variables from step 1

4. **Deploy:**
   - Vercel will automatically deploy when you push to GitHub
   - Or click "Deploy" in the Vercel dashboard

### 3. Test Your Deployment

- Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
- Test uploading a menu with an image
- Verify the 5-hour expiration works
- Check that auto-refresh updates the menu list

## How It Works

### File Structure
```
├── api/
│   ├── messes.js      # Handles menu CRUD operations
│   └── upload.js      # Handles image uploads to Cloudinary
├── public/
│   ├── index.html     # Frontend
│   ├── script.js      # Frontend JavaScript
│   └── styles.css     # Styling
├── vercel.json        # Vercel configuration
└── package.json       # Dependencies
```

### Key Differences from Express Version

1. **No Express Server** - Uses Vercel serverless functions
2. **No Socket.IO** - Uses polling (30-second refresh) instead
3. **Image Upload** - Converts to base64 and uploads directly to Cloudinary
4. **Auto-refresh** - Frontend polls for updates every 30 seconds

### API Endpoints

- `GET /api/messes` - Get all active menus
- `POST /api/messes` - Add new menu
- `DELETE /api/messes` - Delete expired menus
- `POST /api/upload` - Upload image to Cloudinary

## Troubleshooting

### Common Issues

1. **"Error uploading menu"**
   - Check your Cloudinary credentials in Vercel environment variables
   - Verify MongoDB connection string

2. **Images not uploading**
   - Ensure Cloudinary credentials are correct
   - Check browser console for errors

3. **Menus not appearing**
   - Verify MongoDB connection
   - Check if menus have expired (5-hour limit)

### Environment Variables Checklist

- [ ] `MONGODB_URI` - Your MongoDB Atlas connection string
- [ ] `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- [ ] `CLOUDINARY_API_KEY` - Your Cloudinary API key
- [ ] `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

## Performance Notes

- **Cold starts** - First request may be slower (serverless limitation)
- **Image size** - Large images are converted to base64, so keep them under 5MB
- **Auto-refresh** - Updates every 30 seconds (configurable in script.js)

## Local Development

To test locally:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env` file

3. Use Vercel CLI:
   ```bash
   npm i -g vercel
   vercel dev
   ```

## Success Indicators

✅ **Working deployment:**
- Menu uploads work with images
- Menus appear in student view
- 5-hour countdown displays correctly
- Auto-refresh updates the list
- No "Error uploading menu" messages

Your app is now fully compatible with Vercel and will work without any server management! 