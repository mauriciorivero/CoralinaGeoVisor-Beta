const express = require('express');
const router = express.Router();
const mapController = require('../controllers/map.controller');

// Get all piezometers
router.get('/markers', mapController.getMarkers);

// Get specific piezometer
router.get('/location/:id', mapController.getLocationById);

// Add new piezometer
router.post('/markers', mapController.addMarker);

// Update piezometer
router.put('/markers/:id', mapController.updateMarker);

// Delete piezometer
router.delete('/markers/:id', mapController.deleteMarker);

module.exports = router; 