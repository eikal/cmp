
import mongoose from 'mongoose';

export const getDbConnection = async () => {
    try {
        await mongoose.connect(`mongodb://${process.env.DB_HOSTNAME}:${process.env.DB_PORT}/${process.env.DB_NAME}`, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });
        console.log('Successfully connected to DB');
        return;
    } catch (ex) {
        const err = `Failed while tryint to connect to db, Error: ${JSON.stringify(ex)}`;
        console.log(err);
        throw err;
    }
};
