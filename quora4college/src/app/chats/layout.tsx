import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "chats",
  description: "chats section",
};
const Chats = ({ children }: any) => {
  return <>{children}</>;
};

export default Chats;
