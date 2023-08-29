import { getTokenFromHeader } from "../utils/getTokenFromHeader.js";
import { verifyToken } from "../utils/verifyToken.js";

export const isLoggedIn = (req) => {
  const token = req?.Authorization?.split(" ")[1];
  // verify the token
  const decodedUser = verifyToken(token);
  if (!decodedUser) {
    // throw new Error("Invalid/Expired token, please login again");
    return null;
  }
  req.userAuthId = decodedUser?.id;
  return req.userAuthId;
};
