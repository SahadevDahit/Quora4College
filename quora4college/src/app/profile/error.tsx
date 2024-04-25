"use client";
import { useEffect } from "react";

interface ErrorProps {
  error: any; // Change 'any' to the specific type of your error object if possible
  reset: () => void; // Specify the type of the reset function
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
