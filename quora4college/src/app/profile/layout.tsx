import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "profile",
  description: "profile section",
};
const profile = ({ children }: any) => {
  return <>{children}</>;
};

export default profile;
