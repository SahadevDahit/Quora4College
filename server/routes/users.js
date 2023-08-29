import exppress from "express";
import {
    registerUserCtrl,
    loginUserCtrl,
    getUserProfileCtrl,
    isLogin,
    updateUserProfileCtrl,
} from "../controllers/users.js";
import {
    isLoggedIn
} from "../middlewares/isLoggedIn.js";
const userRoutes = exppress.Router();
userRoutes.post("/", registerUserCtrl);

userRoutes.post("/login", loginUserCtrl);
userRoutes.get("/profile", isLoggedIn, getUserProfileCtrl);
userRoutes.get("/isLogin", isLoggedIn, isLogin);

//update user profile
userRoutes.put("/profile", isLoggedIn, updateUserProfileCtrl);


export default userRoutes;