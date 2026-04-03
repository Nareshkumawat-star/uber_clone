const mongodburl = process.env.MONGODB_URL


if(!mongodburl){
    throw new Error("Please provide mongodb url")
}

let  cached =  global.mongooseConn
 if(!cached){
        cached  = global.mongooseConn={conn:null,promise:null}
    }
    

export const connectDB = async () => {

    if(cached.conn){
        return cached.conn
    }
    try{
        const conn = await cached.promise
        return conn
    }
    catch(e){
        console.log(e)
    }
    
}
export default connectDB