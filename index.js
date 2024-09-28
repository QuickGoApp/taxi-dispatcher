const express = require('express');
const mongoose = require('mongoose');
const geolib = require('geolib');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use(cors({
    origin: 'http://localhost:4200',  
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  
    allowedHeaders: ['Content-Type', 'Authorization']  
}));

const Driver = require('./models/driver.model');

const { ObjectId } = mongoose.Types;


app.post('/api/drivers/location', async (req, res) => {
    const { latitude, longitude, driverId, type } = req.body;

    try {
        const driver = await Driver.findOneAndUpdate(
            { _id: driverId },
            {
                type: type,
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


app.post('/api/drivers/search', async (req, res) => {
    const { latitude, longitude, type, radius } = req.body;
    try {
        const center = { type: 'Point', coordinates: [longitude, latitude] };
        const distanceInMeters = radius * 1000;

        const drivers = await Driver.find({
            type: type,
            location: {
                $nearSphere: {
                    $geometry: center,
                    $maxDistance: distanceInMeters
                }
            }
        });
        
        const response = drivers.map(driver => (
            {
            driverId: driver._id, 
            latitude: driver.location.coordinates[1],
            longitude: driver.location.coordinates[0]
        }));

        const responseMessage={"statusCode":200,"message":"success","data":response}
        res.json(responseMessage);
        
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

mongoose.connect('mongodb://localhost:27017/qg-taxi-locator-prod', { useNewUrlParser: true, useUnifiedTopology: true })
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