require("dotenv").config();
const express = require('express')
const app = express()
const dotenv=require('dotenv');
dotenv.config();
const cors=require("cors")
const authRoutes=require('./routes/authroutes')
app.use(express.json());
const connect=require("./db/config")
app.use(authRoutes);
const corsOptions = {
  origin: 'http://localhost:5173', // Allow requests from this origin
};

app.use(cors(corsOptions));
app.use(cors());
connect();
// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })
console.log("__dirname", __dirname);
app.use('/', express.static(__dirname + "/hrclient"));

app.listen(process.env.PORT, () => {
  console.log(`server listening at http://localhost:${process.env.PORT}`);
})