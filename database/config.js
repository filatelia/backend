const mongoose = require('mongoose');


const dbConnection = async() => {
    DB_CNN=
    process.env.DB_CNN
    try {
        await mongoose.connect( 'mongodb+srv://'+process.env.US+':'+process.env.PS+'@cluster0.4io1z.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'  , {
            useNewUrlParser: true, 
            useUnifiedTopology: true,
            useCreateIndex: true,
            findOneAndUpdate: false,
            findOneAndDelete: false,
            useFindAndModify: false

        });

        console.log('DB Online');
        
    } catch (error) {
        console.log(error);
        throw new Error('Error a la hora de iniciar la BD ver logs');
    }


}


module.exports = {
    dbConnection
}