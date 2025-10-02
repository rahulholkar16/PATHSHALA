import app from "./app.js";
import { connectDB } from "./config/db.js";
import { availableParallelism } from "os";
import cluster from "cluster";

const numCPUs = availableParallelism();

if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
} else {
    connectDB()
        .then(() => {
            app.listen(process.env.PORT, () => {
                console.log("Server start at: " + process.env.PORT);
            });
        })
        .catch((err) => {
            console.error("MongoDB connection error: ", err);
            process.exit(1);
        });
}
