const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 5000;

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary Storage Configuration
const cloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'pune-mess-menus',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto' }
        ]
    }
});

// Multer configuration for Cloudinary uploads
const upload = multer({ 
    storage: cloudinaryStorage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection with better error handling
const connectDB = async () => {
    try {
        let mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pune-mess-app';
        console.log('Attempting to connect to MongoDB...');
        
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            retryWrites: true,
            w: 'majority'
        };
        
        // Only add TLS options for Atlas connections
        if (mongoURI.includes('mongodb.net')) {
            options.tls = true;
            options.tlsAllowInvalidCertificates = true;
        }
        
        await mongoose.connect(mongoURI, options);
        console.log('✅ Connected to MongoDB successfully!');
        
    } catch (error) {
        console.error('❌ MongoDB Atlas connection failed:', error.message);
        console.log('\n🔄 Trying local MongoDB as fallback...');
        
        try {
            // Try local MongoDB as fallback
            await mongoose.connect('mongodb://localhost:27017/pune-mess-app', {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000
            });
            console.log('✅ Connected to local MongoDB successfully!');
        } catch (localError) {
            console.error('❌ Local MongoDB also failed:', localError.message);
            console.log('\n📋 Troubleshooting tips:');
            console.log('1. For MongoDB Atlas: Check your connection string and IP whitelist');
            console.log('2. For local MongoDB: Install and start MongoDB on your machine');
            console.log('3. The app will run without database (menus won\'t persist)');
            console.log('\nStarting server without database connection...');
        }
    }
};

// Initialize database connection
connectDB();

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Mess Schema
const messSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    phone: { type: String, required: true },
    menuType: { type: String, enum: ['veg', 'non-veg', 'budget'], default: null },
    menuText: { type: String, required: true },
    price: { type: String, default: null },
    image: { 
        url: { type: String, default: null },
        publicId: { type: String, default: null }
    },
    date: { type: String, required: true },
    uploadTime: { type: Number, required: true },
    expiresAt: { type: Number, required: true } // 5 hours from upload
}, { timestamps: true });

const Mess = mongoose.model('Mess', messSchema);

// Socket.IO Connection Handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Routes

// Get all messes
app.get('/api/messes', async (req, res) => {
    try {
        if (!mongoose.connection.readyState) {
            return res.json([]); // Return empty array if DB not connected
        }
        
        const currentTime = Date.now();
        const messes = await Mess.find({ 
            expiresAt: { $gt: currentTime } 
        }).sort({ uploadTime: -1 });
        
        res.json(messes);
    } catch (error) {
        console.error('Error fetching messes:', error);
        res.json([]); // Return empty array on error
    }
});

// Add new mess
app.post('/api/messes', upload.single('image'), async (req, res) => {
    try {
        if (!mongoose.connection.readyState) {
            return res.status(503).json({ error: 'Database not connected. Please try again later.' });
        }
        
        const currentTime = Date.now();
        const expiresAt = currentTime + (5 * 60 * 60 * 1000); // 5 hours from now
        
        const messData = {
            name: req.body.name,
            location: req.body.location,
            phone: req.body.phone,
            menuType: req.body.menuType || null,
            menuText: req.body.menuText,
            price: req.body.price || null,
            image: req.file ? {
                url: req.file.path,
                publicId: req.file.filename
            } : null,
            date: req.body.date,
            uploadTime: currentTime,
            expiresAt: expiresAt
        };

        const newMess = new Mess(messData);
        await newMess.save();
        
        // Emit real-time update to all connected clients
        io.emit('newMenuAdded', newMess);
        
        res.status(201).json(newMess);
    } catch (error) {
        console.error('Error adding mess:', error);
        res.status(500).json({ error: 'Error adding mess. Please try again.' });
    }
});

// Delete expired messes
app.delete('/api/messes/expired', async (req, res) => {
    try {
        const currentTime = Date.now();
        const expiredMesses = await Mess.find({ expiresAt: { $lt: currentTime } });
        
        // Delete images from Cloudinary
        for (const mess of expiredMesses) {
            if (mess.image && mess.image.publicId) {
                try {
                    await cloudinary.uploader.destroy(mess.image.publicId);
                } catch (cloudinaryError) {
                    console.error('Error deleting from Cloudinary:', cloudinaryError);
                }
            }
        }
        
        // Delete expired messes from database
        const deleteResult = await Mess.deleteMany({ expiresAt: { $lt: currentTime } });
        
        // Emit real-time update to all connected clients
        io.emit('menusExpired', { deletedCount: deleteResult.deletedCount });
        
        res.json({ 
            message: `Deleted ${deleteResult.deletedCount} expired messes`,
            deletedCount: deleteResult.deletedCount 
        });
    } catch (error) {
        console.error('Error deleting expired messes:', error);
        res.status(500).json({ error: 'Error deleting expired messes' });
    }
});

// Delete specific mess
app.delete('/api/messes/:id', async (req, res) => {
    try {
        const mess = await Mess.findById(req.params.id);
        if (!mess) {
            return res.status(404).json({ error: 'Mess not found' });
        }
        
        // Delete image from Cloudinary if exists
        if (mess.image && mess.image.publicId) {
            try {
                await cloudinary.uploader.destroy(mess.image.publicId);
            } catch (cloudinaryError) {
                console.error('Error deleting from Cloudinary:', cloudinaryError);
            }
        }
        
        await Mess.findByIdAndDelete(req.params.id);
        
        // Emit real-time update to all connected clients
        io.emit('menuDeleted', { id: req.params.id });
        
        res.json({ message: 'Mess deleted successfully' });
    } catch (error) {
        console.error('Error deleting mess:', error);
        res.status(500).json({ error: 'Error deleting mess' });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        }
    }
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
});

// Start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Clean up expired messes every 30 minutes
setInterval(async () => {
    try {
        if (!mongoose.connection.readyState) {
            console.log('Database not connected, skipping cleanup...');
            return;
        }
        
        const currentTime = Date.now();
        const expiredMesses = await Mess.find({ expiresAt: { $lt: currentTime } });
        
        if (expiredMesses.length > 0) {
            // Delete images from Cloudinary
            for (const mess of expiredMesses) {
                if (mess.image && mess.image.publicId) {
                    try {
                        await cloudinary.uploader.destroy(mess.image.publicId);
                    } catch (cloudinaryError) {
                        console.error('Error deleting from Cloudinary:', cloudinaryError);
                    }
                }
            }
            
            // Delete expired messes from database
            const deleteResult = await Mess.deleteMany({ expiresAt: { $lt: currentTime } });
            
            // Emit real-time update to all connected clients
            io.emit('menusExpired', { deletedCount: deleteResult.deletedCount });
            
            console.log(`Cleaned up ${deleteResult.deletedCount} expired messes`);
        }
    } catch (error) {
        console.error('Error cleaning up expired messes:', error);
    }
}, 30 * 60 * 1000); // Run every 30 minutes 