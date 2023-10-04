require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
const http = require("http");

const Socket = require("./socket.io");

const authRouter = require("../src/routes/auth");
const categoryRouter = require("../src/routes/category");
const restaurantRouter = require("../src/routes/restaurant");
const menuRouter = require("../src/routes/menu");
const foodRouter = require("../src/routes/food");
const orderRouter = require("../src/routes/order");
const chooseRouter = require("../src/routes/choose");
const listChooseRouter = require("../src/routes/listChoose");
const testRouter = require("../src/routes/test");
const payRouter = require("../src/routes/pay");
const discountRouter = require("../src/routes/discount");
const comboRouter = require("../src/routes/combo");

const connectDB = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@detai75-thucan.vgddw.mongodb.net/detai75-thucan?retryWrites=true&w=majority`
    );

    console.log("MongoDB connected");
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());

// app.use(
//   cors({
//     origin: "http://localhost:3000",
//     credentials: true,
//   })
// );
app.use(
  cors({
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200,
    methods: "GET, PUT, POST, DELETE, PATCH",
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/api/auth", authRouter);

app.use("/api/category", categoryRouter);

app.use("/api/restaurant", restaurantRouter);

app.use("/api/menu", menuRouter);

app.use("/api/food", foodRouter);

app.use("/api/order", orderRouter);

app.use("/api/choose", chooseRouter);

app.use("/api/listChoose", listChooseRouter);

app.use("/api/test", testRouter);

app.use("/api/pay", payRouter);

app.use("/api/discount", discountRouter);

app.use("/api/combo", comboRouter);

const PORT = process.env.PORT || 3000;

Socket(io);

server.listen(PORT, () => console.log(`Server started on Port ${PORT}`));
