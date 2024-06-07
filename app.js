const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors"); // Import CORS middleware
const path = require("path");
const app = express();
const userRouter = require("./Routes/authRouter");
const userRouterSkills = require("./Routes/userRouter");
const User = require("./Models/userModel");

mongoose.connect(
  "mongodb+srv://surajpokhriyal150:an0oe792KCBkYhK4@cluster0.tqahn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
);

app.use(express.json());
app.use(
  cors({
    origin: "*",
    optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);

app.use("/users", userRouter);
app.use("/userRouterSkills", userRouterSkills);

app.get("/getUsers", async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    console.error("Error retrieving users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Backend Route for serving the reset password page
app.get("/resetPass/:token", (req, res) => {
  // Render the reset password page here
  res.sendFile(path.join(__dirname, "pages/ResetPasswordPage.js"));
});

const server = http.createServer(app);

server.listen(4000, () => {
  console.log("Server is running on port 4000");
});
