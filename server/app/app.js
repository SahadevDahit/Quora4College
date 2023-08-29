import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import helmet from 'helmet';
import dbConnect from "../config/dbConnect.js";
import Users from "../routes/users.js";
import Questions from "../routes/questions.js";
import bodyParser from "body-parser";
import {
    globalErrhandler,
    notFound
} from "../middlewares/globalErrHandler.js";


const app = express();
app.use(helmet())
app.disable('x-powered-by')
//db connect
dbConnect();
//cors
app.use(cors());
//pass incoming data
app.use(express.json());
//url encoded
app.use(express.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
const corsOptions = {
    origin: '*',
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With,  Accept"
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PATCH, DELETE, OPTIONS"
    );
    next();
});
//routes
app.use("/users", Users);
app.use("/questions", Questions)

app.get("/", (req, res) => {
    res.send("Welcome to Quora4College");
})

//err middleware
app.use(notFound);
app.use(globalErrhandler);

export default app;