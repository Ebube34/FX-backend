import mongoose from "mongoose";

const DepositsSchema = new mongoose.Schema(
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

const Deposits = mongoose.model("Deposits", DepositsSchema);

export default Deposits;
