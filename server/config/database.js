const mongoose=  require("mongoose");
require("dotenv").config();

exports.connect = ()=>{
    mongoose.connect(process.env.MONGODB_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
    })
    .then(()=>console.log("DB connected Successfully"))
    .catch((error)=>{
        console.log("DB not connected");
        console.error(error);
        process.exit(1);
    })
}