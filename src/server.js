import app from './app.js';

app.listen(process.env.PORT, () => {
    console.log("Server start at: " + process.env.PORT);
})