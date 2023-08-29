"use client"
import React,{useState} from "react";
import SignIn from "./signIn";
import SignUp from "./signup";
interface LoginProps {
   setIsLogin: (value: boolean) => void;
 }
const Login: React.FC<LoginProps> = ({ setIsLogin }) => {

   const [isSignIn,setIsSignIn] = useState<boolean>(true)
  return (
   <div className="pt-5">
   {isSignIn? <SignIn setIsSignIn={setIsSignIn} setIsLogin={setIsLogin} /> : <SignUp setIsSignIn={setIsSignIn} />}
      </div>
  );
}

export default Login;