import mongoose from "mongoose";


interface iPartnerdocs {
    owner: mongoose.Types.ObjectId,
    aadharUrl: string,
    rcurl: string,
    licenceurl: string,

    status: "approved" | "pending" | "rejected",
    rejectionreason?: string,

    createdAt: Date,
    updatedAt: Date,


}
const PartnerdocsSchema = new mongoose.Schema<iPartnerdocs>({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    aadharUrl: {
        type: String,
       
    },
    rcurl: {
        type: String,
      
    },
    licenceurl: {
        type: String,
       
    },
   
    status: {
        type: String,
        enum: ["approved", "pending", "rejected"],
        default: "pending"
    },
    rejectionreason: {
        type: String,
        required: false
    },
   
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
}, {
    timestamps: true
})

const Partnerdocs = mongoose.models.Partnerdocs<iPartnerdocs> || mongoose.model<iPartnerdocs>("Partnerdocs", PartnerdocsSchema);
export default Partnerdocs;
