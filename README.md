# Pune Mess Menu App

A real-time mess menu sharing application for students and mess owners in Pune. Built with Node.js, MongoDB, Cloudinary for image storage, and Socket.IO for real-time updates.

## Features

- **Real-time Menu Sharing**: Mess owners can upload menus that appear instantly for all students
- **Cloud Image Storage**: Images are stored securely on Cloudinary and accessible globally
- **Auto-expiration**: Menus automatically expire after 5 hours
- **Real-time Updates**: Students see new menus and deletions in real-time
- **Search & Filter**: Students can search and filter menus by type
- **Contact Integration**: Direct call and WhatsApp integration
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Cloudinary account

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Messy
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:
```bash
cp env.example .env
```

Edit the `.env` file with your configuration:
```env
MONGODB_URI=mongodb://localhost:27017/pune-mess-app
PORT=5000

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Cloudinary Setup

1. Sign up for a free account at [Cloudinary](https://cloudinary.com/)
2. Get your credentials from the dashboard:
   - Cloud Name
   - API Key
   - API Secret
3. Update the `.env` file with your Cloudinary credentials

### 5. MongoDB Setup

#### Option A: Local MongoDB
1. Install MongoDB on your system
2. Start MongoDB service
3. The app will automatically create the database

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env`

### 6. Run the Application

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The application will be available at `http://localhost:5000`

## Usage

### For Mess Owners
1. Click on "Mess Owner" tab
2. Fill in the form with:
   - Mess name
   - Location
   - Contact number
   - Menu details
   - Optional: Upload menu image
   - Optional: Select menu type and price range
3. Click "Upload Menu"
4. Menu will be visible to all students immediately

### For Students
1. Click on "Student View" tab
2. Browse available menus
3. Use search to find specific messes
4. Filter by menu type (Veg, Non-Veg, Budget)
5. Click "View Details" to see full menu
6. Use "Call Now" or "WhatsApp" to contact mess owners

## API Endpoints

- `GET /api/messes` - Get all active menus
- `POST /api/messes` - Upload new menu
- `DELETE /api/messes/expired` - Delete expired menus
- `DELETE /api/messes/:id` - Delete specific menu

## Real-time Events

- `newMenuAdded` - Emitted when a new menu is uploaded
- `menuDeleted` - Emitted when a menu is deleted
- `menusExpired` - Emitted when expired menus are cleaned up

## File Structure

```
Messy/
├── public/
│   ├── index.html      # Main application page
│   ├── script.js       # Frontend JavaScript
│   └── styles.css      # Application styles
├── server.js           # Backend server
├── package.json        # Dependencies
├── env.example         # Environment variables template
└── README.md          # This file
```

## Technologies Used

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Real-time**: Socket.IO
- **Image Storage**: Cloudinary
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with responsive design

## Features in Detail

### Real-time Updates
- New menus appear instantly for all connected users
- Deleted menus are removed in real-time
- Expired menus are automatically cleaned up

### Image Management
- Images are optimized and stored on Cloudinary
- Automatic image transformation (resize, quality optimization)
- Secure cloud storage with global CDN

### Auto-expiration System
- Menus automatically expire after 5 hours
- Expired menus are removed from the database
- Associated images are deleted from Cloudinary
- Real-time notifications when menus expire

### Search and Filter
- Search by mess name, location, or menu text
- Filter by menu type (Veg, Non-Veg, Budget)
- Real-time search results

### Contact Integration
- Direct phone call integration
- WhatsApp messaging with pre-filled message
- Contact information displayed prominently

## Deployment

### Render Deployment  
1. Create a Render account  
2. Click New + → Web Service  
3. Connect your GitHub repository  
4. Set Environment to Node  
5. Add environment variables in Settings → Environment  
   - MONGODB_URI  
   - PORT (optional, Render auto-assigns one)  
   - CLOUDINARY_CLOUD_NAME  
   - CLOUDINARY_API_KEY  
   - CLOUDINARY_API_SECRET  
6. Configure build and start commands  
   - Build Command: npm install  
   - Start Command: npm start  
7. Click Deploy  
8. Your app will be live at https://your-app-name.onrender.com  


## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `PORT` | Server port (default: 5000) | No |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## Changelog

### v1.0.0
- Initial release with Cloudinary integration
- Real-time menu sharing
- Auto-expiration system
- Search and filter functionality
- Responsive design 
