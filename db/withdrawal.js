import mongoose from "mongoose";

const WithdrawalsSchema = new mongoose.Schema(
    {
        userId: String,
        amount: Number,
        network: String,
        date: String,
        address: String,
        status: {
            type: String, 
            enum: ['Pending', 'Confirmed'],
            default: 'Pending'
        },
        
    },
)

const Withdrawals = mongoose.model("Withdrwals", WithdrawalsSchema);

export default Withdrawals;