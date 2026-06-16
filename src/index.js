import {app} from './app.js';
import connectdb from './db/index.js';
import dotenv from 'dotenv';

dotenv.config();

await connectdb();

const PORT=process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})

