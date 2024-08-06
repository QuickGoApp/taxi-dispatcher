const express = require('express');
const mongoose = require('mongoose');
const geolib = require('geolib');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const Driver = require('./models/driver.model');

const { ObjectId } = mongoose.Types;


app.post('/api/drivers/location', async (req, res) => {
    const { latitude, longitude, driverId } = req.body;

    try {
        const driver = await Driver.findOneAndUpdate(
            { _id: driverId },
            {
                location: { type: 'Point', coordinates: [longitude, latitude] },
                timestamp: Date.now()
            },
            { new: true, upsert: true }
        );

        res.json(driver);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error updating or creating driver location' });
    }
});


app.get('/api/drivers/search', async (req, res) => {
    const { latitude, longitude, radius } = req.query;

    console.log(latitude, longitude, radius);

    try {
        const center = { type: 'Point', coordinates: [longitude, latitude] };
        const distanceInMeters = radius * 1000; // Convert radius to meters
        
        const drivers = await Driver.find({
            location: {
                $nearSphere: {
                    $geometry: center,
                    $maxDistance: distanceInMeters
                }
            }
        });
        
        res.json(drivers);
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error searching for drivers' });
    }
});


app.get('/', (req, res) => {
    res.send(
        {
            message: "Hellow world"
        }
    );
});

mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.log('Error connecting to MongoDB');
        console.log(error);
    });

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
}
);