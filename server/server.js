import dotenv from "dotenv";
dotenv.config();
import express from "express";

const app = express();
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send({ message: "This is working" });
});

app.listen(PORT, () => {
  console.log("Server is running");
});
