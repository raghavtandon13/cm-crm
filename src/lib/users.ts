import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        name: { type: String, trim: true },
        phone: { type: String, required: true, trim: true },
        accounts: [{ type: Schema.Types.Mixed }],
        role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },
        pan: { type: String, trim: true },
        dob: { type: String, trim: true },
        email: { type: String, trim: true },
        addr: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        category: { type: String, trim: true },
        gender: { type: String, trim: true },
        employment: { type: String, enum: ["Salaried", "Self-employed", "No-employment"], default: "Salaried" },
        company_name: { type: String, trim: true },
        income: { type: String, trim: true },
        loan_required: { type: String, trim: true },
        credit_required: { type: String, trim: true },
        partner: { type: String, default: "None" },
        partnerSent: { type: Boolean },
        residence_type: { type: String, trim: true },
        phoneOtp: { type: String, length: 4 },
        pincode: { type: String, length: 6 },
        phoneOtpExpire: { type: Date },
        detailsFilled: { type: Boolean, default: false },
        eformFilled: { type: Boolean, default: false },
        isBanned: { type: Boolean, default: false },
        google: { id: { type: String }, email: { type: String }, name: { type: String } },
    },
    { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", userSchema);
