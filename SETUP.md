# Setup Guide - Pune Mess Menu App

This guide will help you set up the Pune Mess Menu App with Cloudinary integration and real-time functionality.

## Prerequisites

Before starting, ensure you have:
- Node.js (v14 or higher) installed
- A MongoDB database (local or cloud)
- A Cloudinary account

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Express.js (web framework)
- MongoDB/Mongoose (database)
- Cloudinary (image storage)
- Socket.IO (real-time communication)
- Multer (file uploads)
- CORS (cross-origin requests)

### 2. Environment Configuration

1. **Copy the environment template:**
   ```bash
   cp env.example .env
   ```

2. **Edit the `.env` file** with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/pune-mess-app
   PORT=5000
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

### 3. Cloudinary Setup

1. **Create a Cloudinary account:**
   - Go to [Cloudinary](https://cloudinary.com/)
   - Sign up for a free account
   - Verify your email

2. **Get your credentials:**
   - Log in to your Cloudinary dashboard
   - Go to "Dashboard" → "Account Details"
   - Copy your:
     - Cloud Name
     - API Key
     - API Secret

3. **Update your `.env` file** with the credentials

4. **Test Cloudinary connection:**
   ```bash
   node test-cloudinary.js
   ```

### 4. MongoDB Setup

#### Option A: Local MongoDB

1. **Install MongoDB:**
   - Download from [MongoDB website](https://www.mongodb.com/try/download/community)
   - Follow installation instructions for your OS

2. **Start MongoDB service:**
   - Windows: MongoDB runs as a service automatically
   - macOS: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

#### Option B: MongoDB Atlas (Recommended for production)

1. **Create MongoDB Atlas account:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account

2. **Create a cluster:**
   - Click "Build a Database"
   - Choose "FREE" tier
   - Select your preferred provider and region
   - Click "Create"

3. **Set up database access:**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Create a username and password
   - Select "Read and write to any database"
   - Click "Add User"

4. **Set up network access:**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

5. **Get connection string:**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Update `MONGODB_URI` in your `.env` file

### 5. Test the Setup

1. **Test Cloudinary:**
   ```bash
   node test-cloudinary.js
   ```

2. **Start the server:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Open your browser
   - Go to `http://localhost:5000`
   - You should see the mess menu application

### 6. Verify Functionality

1. **Test Mess Owner Upload:**
   - Click "Mess Owner" tab
   - Fill in the form with test data
   - Upload an image
   - Click "Upload Menu"
   - Menu should appear immediately

2. **Test Student View:**
   - Click "Student View" tab
   - You should see the uploaded menu
   - Test search and filter functionality
   - Click "View Details" to see full menu

3. **Test Real-time Updates:**
   - Open the app in two browser tabs
   - Upload a menu in one tab
   - Watch it appear instantly in the other tab

## Troubleshooting

### Common Issues

1. **"Cloudinary connection failed"**
   - Check your `.env` file has correct credentials
   - Verify your Cloudinary account is active
   - Run `node test-cloudinary.js` to test

2. **"MongoDB connection error"**
   - Ensure MongoDB is running
   - Check your connection string in `.env`
   - For Atlas, ensure IP is whitelisted

3. **"Port already in use"**
   - Change PORT in `.env` file
   - Or kill the process using the port

4. **"Module not found"**
   - Run `npm install` again
   - Check `package.json` for missing dependencies

### Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/pune-mess-app` |
| `PORT` | Server port | `5000` |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | `mycloud` |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret | `abcdefghijklmnop` |

## Production Deployment

### Heroku Deployment

1. **Create Heroku app:**
   ```bash
   heroku create your-app-name
   ```

2. **Add MongoDB Atlas addon:**
   ```bash
   heroku addons:create mongolab:sandbox
   ```

3. **Set environment variables:**
   ```bash
   heroku config:set CLOUDINARY_CLOUD_NAME=your_cloud_name
   heroku config:set CLOUDINARY_API_KEY=your_api_key
   heroku config:set CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Deploy:**
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push heroku main
   ```

### Vercel Deployment

1. **Connect GitHub repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically**

## Security Considerations

1. **Environment Variables:**
   - Never commit `.env` file to version control
   - Use strong, unique passwords for database
   - Rotate API keys regularly

2. **File Uploads:**
   - Only image files are accepted
   - File size is limited to 10MB
   - Images are automatically optimized

3. **Database:**
   - Use strong database passwords
   - Enable MongoDB authentication
   - Restrict network access in production

## Performance Optimization

1. **Image Optimization:**
   - Cloudinary automatically optimizes images
   - Images are resized to 800x600 maximum
   - Quality is automatically adjusted

2. **Database:**
   - Indexes are created automatically
   - Expired data is cleaned up every 30 minutes

3. **Real-time Updates:**
   - Socket.IO handles real-time communication
   - Efficient event-based updates

## Monitoring and Maintenance

1. **Logs:**
   - Check server logs for errors
   - Monitor Cloudinary usage
   - Track database performance

2. **Backup:**
   - Regular database backups
   - Cloudinary images are automatically backed up

3. **Updates:**
   - Keep dependencies updated
   - Monitor for security patches

## Support

If you encounter issues:

1. **Check the logs:**
   - Server console output
   - Browser developer tools
   - Network tab for API calls

2. **Verify configuration:**
   - Run `node test-cloudinary.js`
   - Check MongoDB connection
   - Verify environment variables

3. **Common solutions:**
   - Restart the server
   - Clear browser cache
   - Check network connectivity

## Next Steps

After successful setup:

1. **Customize the application:**
   - Modify colors and styling
   - Add your own branding
   - Customize menu types and filters

2. **Add features:**
   - User authentication
   - Menu scheduling
   - Rating system
   - Push notifications

3. **Scale the application:**
   - Add more mess owners
   - Implement advanced search
   - Add analytics tracking 