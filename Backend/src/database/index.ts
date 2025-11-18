import mongoose from "mongoose"

const dbConnection = async():Promise<typeof mongoose | undefined> =>{
    try {
        const connectionString:string = `${process.env.MONGODB_URI}/${process.env.DB_NAME}`
        const connectionInstance = await mongoose.connect(connectionString)
        await mongoose.connection.db?.admin().command({ping:1})
        console.log("MongoDB ping successful")
        await Promise.all(
            Object.values(mongoose.models).map((model:mongoose.Model<any>)=>model.createIndexes())
        )
        console.log("All indexes are ensured")
        return connectionInstance;
    } catch (error) {
        console.log("Something went wrong while connecting database",error)
        return undefined
    }
}

export default dbConnection