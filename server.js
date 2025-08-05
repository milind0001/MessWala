const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pune-mess-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
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

// Mess Schema
const messSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    phone: { type: String, required: true },
    menuType: { type: String, enum: ['veg', 'non-veg', 'budget'], default: null },
    menuText: { type: String, required: true },
    price: { type: String, default: null },
    image: { type: String, default: null },
    date: { type: String, required: true },
    uploadTime: { type: Number, required: true }
}, { timestamps: true });

const Mess = mongoose.model('Mess', messSchema);

// Routes

// Get all messes
app.get('/api/messes', async (req, res) => {
    try {
        const messes = await Mess.find().sort({ uploadTime: -1 });
        res.json(messes);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching messes' });
    }
});

// Add new mess
app.post('/api/messes', upload.single('image'), async (req, res) => {
    try {
        const messData = {
            name: req.body.name,
            location: req.body.location,
            phone: req.body.phone,
            menuType: req.body.menuType || null,
            menuText: req.body.menuText,
            price: req.body.price || null,
            image: req.file ? `/uploads/${req.file.filename}` : null,
            date: req.body.date,
            uploadTime: Date.now()
        };

        const newMess = new Mess(messData);
        await newMess.save();
        
        res.status(201).json(newMess);
    } catch (error) {
        res.status(500).json({ error: 'Error adding mess' });
    }
});

// Delete expired messes (older than 5 hours)
app.delete('/api/messes/expired', async (req, res) => {
    try {
        const fiveHoursAgo = Date.now() - (5 * 60 * 60 * 1000);
        const expiredMesses = await Mess.find({ uploadTime: { $lt: fiveHoursAgo } });
        
        // Delete expired messes
        await Mess.deleteMany({ uploadTime: { $lt: fiveHoursAgo } });
        
        res.json({ 
            message: `Deleted ${expiredMesses.length} expired messes`,
            deletedCount: expiredMesses.length 
        });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting expired messes' });
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
            return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
    }
    res.status(500).json({ error: error.message });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Clean up expired messes every hour
setInterval(async () => {
    try {
        const fiveHoursAgo = Date.now() - (5 * 60 * 60 * 1000);
        const deletedCount = await Mess.deleteMany({ uploadTime: { $lt: fiveHoursAgo } });
        if (deletedCount.deletedCount > 0) {
            console.log(`Cleaned up ${deletedCount.deletedCount} expired messes`);
        }
    } catch (error) {
        console.error('Error cleaning up expired messes:', error);
    }
}, 60 * 60 * 1000); // Run every hour 