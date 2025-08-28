const express = require('express');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// MongoDB Connection
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pune-mess-app';
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            retryWrites: true,
            w: 'majority'
        });
        console.log('✅ Connected to MongoDB successfully!');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        throw error;
    }
};

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
    expiresAt: { type: Number, required: true }
}, { timestamps: true });

const Mess = mongoose.model('Mess', messSchema);

// Helper function to get time remaining
function getTimeRemaining(expiresAt) {
    const now = Date.now();
    const timeLeft = expiresAt - now;
    
    if (timeLeft <= 0) {
        return { text: 'Expired', urgent: true };
    }
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
        return { text: `${hours}h ${minutes}m left`, urgent: hours < 1 };
    } else {
        return { text: `${minutes}m left`, urgent: true };
    }
}

// Routes
app.get('/api/messes', async (req, res) => {
    try {
        const currentTime = Date.now();
        const messes = await Mess.find({ 
            expiresAt: { $gt: currentTime } 
        }).sort({ uploadTime: -1 });
        
        // Add time remaining to each mess
        const messesWithTime = messes.map(mess => ({
            ...mess.toObject(),
            timeRemaining: getTimeRemaining(mess.expiresAt)
        }));
        
        res.json(messesWithTime);
    } catch (error) {
        console.error('Error fetching messes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/messes', async (req, res) => {
    try {
        const currentTime = Date.now();
        const expiresAt = currentTime + (5 * 60 * 60 * 1000); // 5 hours from now
        
        const messData = {
            name: req.body.name,
            location: req.body.location,
            phone: req.body.phone,
            menuType: req.body.menuType || null,
            menuText: req.body.menuText,
            price: req.body.price || null,
            image: req.body.image || null,
            date: req.body.date,
            uploadTime: currentTime,
            expiresAt: expiresAt
        };

        const newMess = new Mess(messData);
        await newMess.save();
        
        // Add time remaining
        const messWithTime = {
            ...newMess.toObject(),
            timeRemaining: getTimeRemaining(newMess.expiresAt)
        };
        
        res.status(201).json(messWithTime);
    } catch (error) {
        console.error('Error creating mess:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/upload', async (req, res) => {
    try {
        const { imageData } = req.body;
        
        if (!imageData) {
            return res.status(400).json({ error: 'No image data provided' });
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(imageData, {
            folder: 'pune-mess-menus',
            transformation: [
                { width: 800, height: 600, crop: 'limit' },
                { quality: 'auto' }
            ]
        });

        res.json({
            url: result.secure_url,
            publicId: result.public_id
        });
        
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

app.delete('/api/messes', async (req, res) => {
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
        
        res.json({ 
            message: `Deleted ${deleteResult.deletedCount} expired messes`,
            deletedCount: deleteResult.deletedCount 
        });
    } catch (error) {
        console.error('Error deleting expired messes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Cleanup expired messes every 30 minutes
setInterval(async () => {
    try {
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
            console.log(`🧹 Cleaned up ${deleteResult.deletedCount} expired messes`);
        }
    } catch (error) {
        console.error('Error in cleanup:', error);
    }
}, 30 * 60 * 1000); // 30 minutes

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📱 Student View: http://localhost:${PORT}`);
            console.log(`👨‍🍳 Mess Owner View: http://localhost:${PORT} (switch to Mess Owner tab)`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer(); 