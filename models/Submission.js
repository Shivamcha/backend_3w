const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  socialMediaHandle: {
    type: String,
    required: true,
  },
  images: {
    type: [String], // Change to an array to store multiple file paths or URLs
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model('Submission', SubmissionSchema ,'users_data');
