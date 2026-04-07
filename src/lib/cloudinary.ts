import {v2 as cloudinary} from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLODINARY_CLOUD_NAME,
    api_key: process.env.CLODINARY_API_KEY,
    api_secret: process.env.CLODINARY_API_SECRET,
});

export const uploadOncloudinary = async(file:Blob):Promise<string|null>=>{
    if(!file){
        return null;
    }
    try{
        const buffer = Buffer.from(await file.arrayBuffer());
        return new Promise((resolve,reject)=>{
            const uploadStream = cloudinary.uploader.upload_stream(
                {resource_type:"auto"},
                (error,result)=>{
                    if(error){
                        reject(error);
                    }
                    resolve(result?.secure_url?? null);
                }
            )
            uploadStream.end(buffer);
        })
      
    }
    catch(error){
        console.log(error);
        return null;
    }
}

export default cloudinary;