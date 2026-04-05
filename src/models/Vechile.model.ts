import mongoose from "mongoose";
type vechiletype="bike"|"car"|"loading"|"truck"|"auto"; 
interface ivechile{
    owner:mongoose.Types.ObjectId,

    vechileType:vechiletype,
    vechileModel:string,
    number:string,
    imageurl?:string,
    priceperkm:number,
    waitingcharge:number,
    basfare:number,
    status:"approved"|"pending"|"rejected",
    rejectionreason?:string,
    isActive: boolean,
    createdAt: Date, 
    updatedAt: Date,
    

}
const vechileSchema = new mongoose.Schema({
      owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
      },
      vechileType:{
        type:String,
        enum:["bike","car","loading","truck","auto"],
        required:true
      },
      vechileModel:{
        type:String,
        required:true
      },
      number:{
        type:String,
        
        required:true
      },
      imageurl:{
        type:String,
    
      },
      priceperkm:{
        type:Number,
    
      },
      waitingcharge:{
        type:Number,
        
      },
      basfare:{
        type:Number,
    
      },
      status:{
        type:String,
        enum:["approved","pending","rejected"],
        default:"pending"
      },
      rejectionreason:{
        type:String,
        required:false
      },
      isActive:{
        type:Boolean,
        default:true
      },
      createdAt:{
        type:Date,
        default:Date.now
      },
      updatedAt:{
        type:Date,
        default:Date.now
      },
},{
    timestamps:true
})

const Vechile = mongoose.models.Vechile <ivechile> || mongoose.model<ivechile>("Vechile", vechileSchema);
export default Vechile;
