// Import the Express frame work for Building web Application
const express = require('express');

//Import Mongoose for interacting MongoDB database
const mongoose = require('mongoose');

//Create an instance of an Express Application
const app = express();

//Define the port number the application will listen on
const env = require('dotenv');
env.config()
const port = process.env.PORT
//console.log(port);

//Define Bcrypt module
const bcrypt = require('bcrypt');

//Middleware to parse incoming JSON request
app.use(express.json())


//Define an asynchronouse function to connect to the mongodb database
const db = async () => {
    try {
        //Connect to the Mongodb database at the specified URI
      await mongoose.connect(process.env.DATABASE_STRING);
      console.log('database connection establish');
        
    } catch (error) {
        //log an error if the connection fails
        console.log('error connecting to database');
        
    }
}

// Call th 'db' function to establish connection to the Database
db();


//Define a Mongoose Schema for the 'User' Collection
const userSchema = new mongoose.Schema({
    //'userName' field of type String, required
    userName: {
    type: String,
    required: true,
    },

    //'Email' field of type string, required, and must be unique
    email: {
        type: String,
        required: true,
        unique: true
    },

    //'password' field of type string, required
    password: {
        type: String,
        required: true
    }

   
})

//Create a Mongoose model for the 'User' collection using the Schema
const User = mongoose.model('User', userSchema)

app.get('/', (req,res) => {     //the / indicates the domain hompage follow by a callback function
    res.send('Homepage');
})

//Define a POST route for the User Signup
app.post('/signup', async (req,res)=>{
    try {
        //Destructure the request body to get 'uerName','email' and 'password'
        const {userName,email,password} = req.body;
        console.log(req.body);
        

        //Check existing user if the same email already exists in the database
        const existingUser = await User.findOne({email:email});

        if (existingUser) {
            //if the user already exists, respond with 400 status and a message
            return res.status(400).json({msg:'Email already exist kindly login'});
        }

        const hashPassword =await bcrypt.hash(password, 10)  //10 is the Saltround for the hashing
        //i.e the number of rounds that the password can be hashed and the standard is 10-12,


        //create a new user document with the provided data using destructuring
        const newUser = new User({
            userName: userName,
            email: email,
            password: hashPassword
        })


        //Save the new user document to the database
        await newUser.save()

        //respond with a success message
        return res.status(200).json({message: "User saved successfully"});

    } catch (error) {
        //log any errors that occur during the process
        console.log(error);

        //respond with 500 status and an error message
        return res.status(500).json({message:"internal server error"})
        
    }
});


app.post('/login', async (req, res) => {
    try {
        const {email,password} =req.body;

        const user = await User.findOne({email:email});
        if(!user) {
            return res.status(400).json({msg:'invalid email credentials'})
        }

        const isMatch =await bcrypt.compare(password,user.password)

        if(!isMatch){
            return res.status(400).json({msg:'Invalid password credentials'})
        } 
        
        const dataInfo = {
            email: user.email,
            password: user.password
        } 
        return res.status (200).json({msg:'Logged in successfully', dataInfo})
        
        }catch (error) {
            return res.status(500).json({msg:'Internal server error'})
    }
})
app.listen(port, () => {    // telling it to Listen to Our call back
    console.log(`server is running at http://localhost:${port}`);
})



// Assignment
//1. write about 5 req methods on express on Dev.to
//write a basic 'Welcome to hompage' render it with Handlebars
//push to github
//do a postman documentation and add a readme.md file