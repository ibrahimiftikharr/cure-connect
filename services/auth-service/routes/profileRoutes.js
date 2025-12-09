const express = require('express');
const router = express.Router();
const {
  getProfile,
  createOrUpdateProfile,
  deleteProfile,
  uploadProfilePicture,
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All profile routes require authentication
router.use(protect);

// Profile routes
router.route('/')
  .get(getProfile)
  .post(createOrUpdateProfile)
  .put(createOrUpdateProfile)
  .delete(deleteProfile);

// Profile picture upload
router.post('/upload-picture', upload.single('profilePicture'), uploadProfilePicture);

module.exports = router;
