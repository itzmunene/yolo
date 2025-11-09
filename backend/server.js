const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const upload = multer();

const productRoute = require('./routes/api/productRoute');

// Connecting to the Database
let mongodb_url = 'mongodb://localhost/';
let dbName = 'yolomy';

// define a url to connect to the database
const MONGODB_URI = process.env.MONGODB_URI || mongodb_url + dbName
mongoose.connect(MONGODB_URI,{useNewUrlParser: true, useUnifiedTopology: true  } )
let db = mongoose.connection;

// Check Connection
db.once('open', ()=>{
    console.log('Database connected successfully')
})

// Check for DB Errors
db.on('error', (error)=>{
    console.log(error);
})

// Initializing express
const app = express()

// Body parser middleware
app.use(express.json())

// 
app.use(upload.array()); 

// Cors 
app.use(cors({
  origin: '*',  // allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

// Health check route for probes and testing
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Use Route
app.use('/api/products', productRoute)

// Define the PORT
const PORT = process.env.PORT || 5000

app.listen(PORT, ()=>{
    console.log(`Server listening on port ${PORT}`)
})
