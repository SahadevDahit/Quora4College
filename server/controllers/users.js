import users from "../models/users.js";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";

import bcrypt from "bcryptjs";
export const registerUserCtrl = asyncHandler(async (req, res) => {
    const {
        email,
    } = req.body;
    // Check user exists
    const userExists = await users.findOne({
        email
    });
    if (userExists) {
        //throw
        throw new Error("User already exists");
    }
  
    //create the user
    const registerUser = await users.create({
        userName: req.body.userName,
        email: req.body.email,
        password: req.body.password,
        phoneNumber: req.body.phoneNumber,
        dob: req.body.dob,
    })
    return res.status(200).json({
        // data: registerUser
        message:"User created successfully"
    })
})
export const loginUserCtrl = asyncHandler(async (req, res) => {
    const {
        email,
        password
    } = req.body;
    //Find the user in db by email only
    const userFound = await users.findOne({
        email,
    });
    if (userFound && (await bcrypt.compare(password, userFound?.password))) {
        res.json({
            status: "success",
            message: "User logged in successfully",
            userFound,
            token: generateToken(userFound?._id),
        });
    } else {
        throw new Error("Invalid login credentials");
    }
});
export const getUserProfileCtrl = asyncHandler(async (req, res) => {
    //find the user
    const user = await users.findById(req.userAuthId);
    if (!user) {
        throw new Error("User not found");
    }
    res.json({
        status: true,
        message: "User profile fetched successfully",
        user,
    });
});

export const updateUserProfileCtrl = asyncHandler(async (req, res) => {
    let user = await users.findOneAndUpdate({
        _id: req.userAuthId
    }, req.body, {
        new: true
    });
    res.json({
        status: "success",
        message: "User profile updated successfully",
        user,
    });
});

export const isLogin = asyncHandler(async (req, res) => {
   if(!req.userAuthId){
    throw new Error("User not logged in");
   }
    res.json({
        status: true,
        message: "User profile fetched successfully",
    });
});
