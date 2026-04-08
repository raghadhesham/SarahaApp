import cron from 'node-cron';
import { deleteMany } from '../../../DB/database.repository.js';
import { userModel } from '../../../models/user.model.js';
cron.schedule('* * * * *', async () => {
    const fiveDaysAgo = (Date.now()-60*60*24*5*1000)
    let users = await deleteMany({
        model: userModel,
        filter: {
            isVerified: false,
            createdAt:fiveDaysAgo
        }
    })
})