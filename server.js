const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const mongoose = require('mongoose');
const {notFound, errorHandler} = require("./middlewares/errormiddleware");

dotenv.config()

const userRoutes = require("./routes/userRoutes")
const reviewRoutes = require("./routes/reviewRoutes")
const uploadRoute = require("./routes/uploadRoute")

const DB_URL = "mongodb+srv://ansh:ansh123@cluster0.kdck0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority" 

// 'mongodb://localhost:27017/movies'

mongoose.connect(DB_URL)
.then(() => console.log("Mongoose Running"))
.catch(err => console.log("Mongoose Error", err))

const app = express()

app.use(express.json({extended : true}))
app.use(cors())

app.use("/api/users", userRoutes)
app.use("/api/review", reviewRoutes)
app.use("/api/upload", uploadRoute)

const PORT =  process.env.PORT || 5000

app.use(notFound)

app.use(errorHandler)

app.listen(PORT, () => console.log("Server Running"))