import mongoose from "mongoose";


const ContractSchema = new mongoose.Schema(
    {
        userId: String,
        investmentType: String,
        investmentPlan: String,
        percentageProfit: Number,
        profitPerMonth: Number,
        capital: Number,
        capitalPlusProfit: Number,
        dateOfPayment: String,
        dateOfPurchase: String,
        rating: Number,
    }
)

const Contract = mongoose.model("Contracts", ContractSchema);

export default Contract;