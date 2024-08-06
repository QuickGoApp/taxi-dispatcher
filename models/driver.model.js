const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [longitude, latitude]
  },
  timestamp: { type: Date, default: Date.now }
});

driverSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Driver', driverSchema);
