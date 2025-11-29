import app from './app'
import dbConnection from './database/index'
import dotenv from 'dotenv'
import "./utils/dbCleaner"

dotenv.config({
   path:'./.env'
})

dbConnection()
.then(()=>{
    app.listen(`${process.env.PORT}`,()=>{
        console.log(`Express app is listing at ${process.env.PORT}`)
    })
})
.catch(()=>{
    console.log(`Got an error while listening on ${process.env.PORT}` )
})