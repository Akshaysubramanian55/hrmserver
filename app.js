const dotenv=require('dotenv');
dotenv.config();
const express = require('express');
const app = express();

const cors = require("cors");
const authRoutes = require('./routes/authroutes');
const userRoutes=require('./routes/userroutes');
const connect = require("./db/models/config");

dotenv.config();

// Connect to the database
connect();

// Enable CORS for specific origin
const corsOptions = {
  origin: 'http://localhost:5173' // Allow requests from this origin
};

app.use(cors(corsOptions));

// Parse JSON bodies
app.use(express.json());

// Mount authentication routes
app.use(authRoutes);
app.use(userRoutes);
app.use('/getuser', userRoutes);
app.use('/updateuser',userRoutes)

// Serve static files
console.log("__dirname", __dirname);
app.use('/', express.static(__dirname + "/hrclient"));

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`server listening at http://localhost:${process.env.PORT}`);
})
