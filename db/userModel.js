import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        unique: false,
    },
    lastName: {
        type: String,
        unique: false,
    },
    phoneNumber: {
        type: String,
        unique: false,
    },
    email: {
        type: String,
        unique: [true, "Email Exist"],
    },
    password: {
        type: String,
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
    },
    country: String,
    kyc: {
        type: String,
        enum: [ 'Not verified', 'Verifed' ],
        default: "Not verified"
    },
    KYCData: Object,
    capitalInvested: Number,
    totalEarnings: Number,
    earnings: Number,
    walletBalance: Number,
    noOfActiveContracts: Number,
    activeContracts: Array,
    deposits: Array,
    withdrawals: Array

});

 const User =  mongoose.model("UcheFX", UserSchema);
export default User;