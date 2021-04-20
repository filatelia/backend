const mongoose = require('mongoose');


const dbConnection = async() => {
    DB_CNN =
        process.env.DB_CNN
    try {
        //console.log('mongodb+srv://'+process.env.US+':'+process.env.PS+'@cluster0.4io1z.mongodb.net/myFirstDatabase?retryWrites=true&w=majority')

        var db=await mongoose.connect( 'mongodb+srv://'+process.env.US+':'+process.env.PS+'@cluster0.4io1z.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'  , {

        //await mongoose.connect('mongodb+srv://dorado:DEFBwavACin1b4xU@cluster0.geck7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
        //await mongoose.connect('mongodb://localhost:27017/filatelia_local', {

            
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,

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
