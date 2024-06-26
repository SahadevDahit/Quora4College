"use client";
import { Inter } from "next/font/google";
import React, { useEffect, useState } from "react";
import Login from "./components/login/login";
import Navbar from "./components/navbar";
import axios from "axios";
import { Providers } from "./redux_toolkit/provider/provider";
const inter = Inter({ subsets: ["latin"] });
import { metadata } from "./metadata";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [isCheckComplete, setIsCheckComplete] = useState<boolean>(false);

  useEffect(() => {
    const islogin = async () => {
      try {
        const response = await axios.get(
          `${process.env.server}/users/isLogin`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.data.status) {
          setIsLogin(false);
        }
      } catch (error: any) {
        console.log(error?.response);
      } finally {
        setIsCheckComplete(true);
      }
    };

    islogin();
  }, []);

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="login, signin, signup" />
        <meta name="author" content="Sahadev" />
        <meta name="publisher" content="Dahit" />
        <meta name="copyright" content="John Doe" />
        <meta
          name="description"
          content="This short description describes my website."
        />
        <meta name="page-topic" content="auth" />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC"
          crossOrigin="anonymous"
        ></link>
      </head>
      <body>
        <Providers>
          {isCheckComplete ? (
            isLogin ? (
              <Login setIsLogin={setIsLogin} />
            ) : (
              <>
                <Navbar />
                {children}
              </>
            )
          ) : (
            <div>Loading...</div>
          )}
        </Providers>
      </body>
    </html>
  );
}
