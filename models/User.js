const mongoose = require("mongoose")
const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        type: String,
        required : true
    },
    email: {
        type: String,
        required : true
    },
    password: {
        type: String,
        required : true
    },
    profileImage: {
        type: String,
        required: true,
        default : "https://cdn.pixabay.com/photo/2018/11/13/21/43/instagram-3814049_1280.png"
    }
})

const User = mongoose.model("User", userSchema)

module.exports = User