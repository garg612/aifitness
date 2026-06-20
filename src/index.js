import "dotenv/config";
import {app} from './app.js';
import connectdb from './db/index.js';
import logger from './utils/logger.js';

await connectdb();

const PORT=process.env.PORT || 3000;

app.listen(PORT,()=>{
    logger.info(`Server is running on port ${PORT}`);
})

