import monngoose from 'mongoose'

export const connectToDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable is not defined');
          }
        await monngoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); 
    }
}