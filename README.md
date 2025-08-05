# Pune Mess Menu App

A web application for Pune bachelors to easily find daily mess menus. The app has two main interfaces: one for mess owners to upload menus (text or image) and another for students to view them.

## Features

### For Students:
- **Browse Mess Menus**: View all uploaded mess menus with details
- **Search & Filter**: Search by mess name, location, or menu items
- **Filter Options**: Filter by menu type (Veg, Non-Veg, Budget)
- **Contact Mess Owners**: Direct call and WhatsApp integration
- **Mobile-Friendly**: Responsive design for all devices

### For Mess Owners:
- **Upload Menus**: Add text descriptions and images
- **Optional Fields**: Menu type and price range (optional)
- **Auto-Expiration**: Menus automatically delete after 5 hours
- **Easy Interface**: Simple form with drag-and-drop image upload

## Technical Stack

### Backend:
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MongoDB** - Database for storing mess data
- **Mongoose** - MongoDB object modeling
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

### Frontend:
- **HTML5** - Structure
- **CSS3** - Styling with responsive design
- **Vanilla JavaScript** - Client-side functionality
- **Font Awesome** - Icons
- **Google Fonts** - Typography (Poppins)

## Setup Instructions

### Prerequisites:
- Node.js (v14 or higher)
- MongoDB (local or cloud)

### Installation:

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd pune-mess-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```
   MONGODB_URI=mongodb://localhost:27017/pune-mess-app
   PORT=5000
   ```

4. **Create uploads directory:**
   ```bash
   mkdir uploads
   ```

5. **Start the server:**
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

6. **Access the application:**
   Open your browser and go to `http://localhost:5000`

## MongoDB Setup

### Local MongoDB:
1. Install MongoDB on your system
2. Start MongoDB service
3. The app will automatically create the database

### MongoDB Atlas (Cloud):
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update the `MONGODB_URI` in your `.env` file

## API Endpoints

### GET `/api/messes`
- Returns all mess data sorted by upload time

### POST `/api/messes`
- Upload new mess data with optional image
- Accepts multipart/form-data

### DELETE `/api/messes/expired`
- Manually trigger deletion of expired menus (older than 5 hours)

## File Structure

```
pune-mess-app/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── uploads/          # Image uploads directory
├── server.js         # Main server file
├── package.json
├── .env              # Environment variables
└── README.md
```

## Deployment

### Vercel Deployment:
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel`
3. Set environment variables in Vercel dashboard
4. Configure MongoDB Atlas connection

### Other Platforms:
- **Heroku**: Add MongoDB addon
- **Railway**: Connect MongoDB database
- **Render**: Set up MongoDB service

## Features

### Data Persistence:
- **MongoDB Storage**: All data stored in MongoDB
- **Image Uploads**: Images stored on server filesystem
- **Auto-Cleanup**: Expired menus automatically removed

### Security:
- **File Validation**: Only image files accepted
- **Size Limits**: 5MB maximum file size
- **CORS Enabled**: Cross-origin requests allowed

### Performance:
- **Optimized Images**: Automatic file naming and organization
- **Efficient Queries**: MongoDB indexing for fast retrieval
- **Background Cleanup**: Automatic expired data removal

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- User authentication for mess owners
- Real-time notifications
- Advanced search filters
- Menu scheduling
- Rating and review system
- Payment integration
- Push notifications

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details 