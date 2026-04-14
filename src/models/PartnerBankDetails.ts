import mongoose from "mongoose";
type vechiletype = "bike" | "car" | "loading" | "truck" | "auto";
interface iPartnerbank {
    owner: mongoose.Types.ObjectId,
    bankname: string,
    accountholder: string,
    accountnumber: string,
    ifsc: string,
    
  upi?:string,
    status: "notadded" | "added" | "verified",
    rejectionreason?: string,

    createdAt: Date,
    updatedAt: Date,


}
const PartnerbankSchema = new mongoose.Schema<iPartnerbank>({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    bankname: {
        type: String,
       
    },
    accountholder:{
        type: String,
        required:true,
    },
    accountnumber: {
        type: String,
        required:true,
        unique:true 
      
    },
    ifsc: {
        type: String,
        required:true,
       uppercase:true
    },
    upi: {
        type: String,
    },
    status: {
        type: String,
        enum: ["notadded", "added", "verified"],
        default: "notadded"
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

const Partnerbank = (mongoose.models.Partnerbank as mongoose.Model<iPartnerbank>) || mongoose.model<iPartnerbank>("Partnerbank", PartnerbankSchema);
export default Partnerbank;
