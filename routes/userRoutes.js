const express = require("express")
const expressAsyncHandler = require("express-async-handler")
const {check, validationResult} = require("express-validator")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const router = express.Router()
const User = require("../models/User.js")
const auth = require("../middlewares/authmiddleware.js")

//register

const registerValidator = [
    check("email", "Enter correct email").isEmail(),
    check("password", "Password should be atleast 6 characters long").trim().isLength({min : 6}),
    check("name", "Name is required").trim().not().isEmpty()
]

router.post("/", registerValidator, expressAsyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(400)
        throw new Error(errors.errors.map(e => e.msg))
    }
    const {name, email, password} = req.body
    let user = await User.findOne({email})
    if (user) {
        res.status(400)
        throw new Error("User already exists")
    }
    user = new User({email, name, password})
    const hashedPassword = await bcrypt.hash(password, 12)
    user.password = hashedPassword
    const savedUser = await user.save()
    const id = savedUser._id
    const token = jwt.sign({id}, "secret", {expiresIn: 3600000000})
    res.status(201).json({
        _id: savedUser._id,
        name,
        email,
        profileImage: savedUser.profileImage,
        token
    })
}))

//login

const loginValidator = [
    check("email", "Enter correct email").isEmail(),
    check("password", "Password should be atleast 6 characters long").trim().isLength({min : 6}),
]

router.post("/login", loginValidator, expressAsyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(400)
        throw new Error(errors.errors.map(e => e.msg))
    }
    const { email, password} = req.body
    let user = await User.findOne({email})
    if (!user) {
        res.status(400)
        throw new Error("No user found")
    }
    const isMatched = await bcrypt.compare(password, user.password)
    if (!isMatched) {
        res.status(400)
        throw new Error("Invalid Credentials")
    }
    const token = jwt.sign({id : user._id}, "secret", {expiresIn: 3600000000})
    res.status(201).json({
        _id: user._id,
        name : user.name,
        email,
        profileImage: user.profileImage,
        token
    })
}))


router.get("/", auth, expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password")
    res.json(user)
}))



module.exports = router