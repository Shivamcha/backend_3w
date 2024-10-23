// backend/routes/submission.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const Submission = require('../models/Submission');

const router = express.Router();

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        // Sanitize the original filename by removing backslashes
        const sanitizedName = file.originalname.replace(/\\/g, '-');
        cb(null, `${Date.now()}-${sanitizedName}`);
    },
});

const upload = multer({ storage: storage });

const getImageUrl = (req, imagePath) => {
    // Ensure the path uses forward slashes and strip any leading slash
    const normalizedPath = imagePath.replace(/\\/g, '/').replace(/^\/+/, '');
    return `${req.protocol}://${req.get('host')}/${normalizedPath}`;
};

router.post('/submit', upload.array('images'), async (req, res) => {
    try {
        const { name, socialMediaHandle, date } = req.body;
        const images = req.files.map(file => 
            `uploads/${file.filename}`.replace(/\\/g, '/')
        );

        const newSubmission = new Submission({
            name,
            socialMediaHandle,
            date,
            images,
        });

        await newSubmission.save();
        
        const submissionWithUrls = {
            ...newSubmission._doc,
            images: images.map(img => getImageUrl(req, img))
        };
        
        res.status(200).json(submissionWithUrls);
    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).json({ error: 'Server error during submission' });
    }
});

router.get('/submissions', async (req, res) => {
    try {
        const submissions = await Submission.find().sort({ createdAt: -1 });
        
        const submissionsWithUrls = submissions.map(submission => ({
            ...submission._doc,
            images: submission.images.map(img => {
                const normalizedPath = img.replace(/\\/g, '/');
                return getImageUrl(req, normalizedPath);
            })
        }));
        
        res.status(200).json(submissionsWithUrls);
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ error: 'Error fetching submissions' });
    }
});

module.exports = router;