import app from './app.js';
import { connectDB } from './config/db.js';

await connectDB();

app.listen(process.env.PORT, () => {
    console.log("Server start at: " + process.env.PORT);
})