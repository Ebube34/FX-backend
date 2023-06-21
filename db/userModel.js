import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "Please provide a password!"],
        unique: false,
    },
    lastName: {
        type: String,
        required: [true, "Please provide a password!"],
        unique: false,
    },
    phoneNumber: {
        type: String,
        required: [true, "please provide a valid phone number"],
        unique: false,
    },
    email: {
        type: String,
        required: [true, "Please provide an Email!"],
        unique: [true, "Email Exist"],
    },
    password: {
        type: String,
        required: [true, "Please provide a password!"],
        unique: false,
    },
    status: {
        type: String, 
        enum: ['Pending', 'Active'],
        default: 'Pending'
    },
    confirmationCode: {
        type: String,
        unique: true
    }
});

 const User =  mongoose.model("UcheFX", UserSchema);
export default User;