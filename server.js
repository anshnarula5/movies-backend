const express = require("express")
const cors = require("cors")
const mongoose = require('mongoose');
const {notFound, errorHandler} = require("./middlewares/errormiddleware");

const userRoutes = require("./routes/userRoutes")
const reviewRoutes = require("./routes/reviewRoutes")
const uploadRoute = require("./routes/uploadRoute")

mongoose.connect('mongodb://localhost:27017/movies')
.then(() => console.log("Mongoose Running"))
.catch(err => console.log("Mongoose Error", err))

const app = express()

app.use(express.json({extended : true}))
app.use(cors())

app.use("/api/users", userRoutes)
app.use("/api/review", reviewRoutes)
app.use("/api/upload", uploadRoute)

const PORT = 5000 || process.env.PORT

app.use(notFound)

app.use(errorHandler)

app.listen(PORT, () => console.log("Server Running"))