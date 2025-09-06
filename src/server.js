import app from './app.js';
import { connectDB } from './config/db.js';

connectDB()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log("Server start at: " + process.env.PORT);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error: ", err);
        process.exit(1);
    })

