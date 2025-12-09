const express = require('express');
const router = express.Router();
const {
  searchDoctors,
  getDoctorDetails,
} = require('../controllers/doctorController');

// Public routes
router.get('/search', searchDoctors);
router.get('/:id', getDoctorDetails);

module.exports = router;
