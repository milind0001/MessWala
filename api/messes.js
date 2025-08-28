const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

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

// Main handler function
module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        await connectDB();
        
        if (req.method === 'GET') {
            // Get all active messes
            const currentTime = Date.now();
            const messes = await Mess.find({ 
                expiresAt: { $gt: currentTime } 
            }).sort({ uploadTime: -1 });
            
            // Add time remaining to each mess
            const messesWithTime = messes.map(mess => ({
                ...mess.toObject(),
                timeRemaining: getTimeRemaining(mess.expiresAt)
            }));
            
            res.status(200).json(messesWithTime);
            
        } else if (req.method === 'POST') {
            // Add new mess
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
            
        } else if (req.method === 'DELETE') {
            // Delete expired messes
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
            
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}; 