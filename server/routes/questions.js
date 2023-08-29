import exppress from "express";
import {
    newQuestion,
    searchQuestion
} from "../controllers/questions.js";
import {
    isLoggedIn
} from "../middlewares/isLoggedIn.js";
const questionsRoutes = exppress.Router();
questionsRoutes.post("/newQuestion", isLoggedIn, newQuestion);
questionsRoutes.post('/search', searchQuestion);
export default questionsRoutes;