import cron from "node-cron"
import { User } from "../models/user-model";

cron.schedule("* * * * *",async()=>{
    const now = Date.now()
    await User.deleteMany({
        docExpire:{$lte:now}
    })
    console.log("Users Database cleaned")
})