import cookieParser from "cookie-parser";
import express from "express";

const app = express() ;


// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()) ;

app.get("/", (req, res) => {
    res.send("Welcome to the Express.js server!");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
}); 