"use client"
import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import axios from 'axios';
interface SignInProps {
  setIsSignIn: (value: boolean) => void;
  setIsLogin: (value: boolean) => void;
}

const SignIn: React.FC<SignInProps> = ({ setIsSignIn,setIsLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async(event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${process.env.server}/users/login`,{email,password});
      localStorage.setItem("token", response?.data?.token);
      alert(response.data.message);
      setIsLogin(false)
  } catch (error:any) {
      console.log(error.response.data.message);
      alert(error.response.data.message);
    }
  };

  return (
    <>
      <h3 className="text-center">Sign In</h3>

      <Form className="w-50 mx-auto h-100 pt-5" onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicCheckbox">
          <Form.Check type="checkbox" label="Check me out" />
        </Form.Group>

        <Form.Group
          className="mb-3 float-end"
          controlId="signUp"
          onClick={() => {
            setIsSignIn(false);
          }}
        >
          <Form.Label>
            <u>Create a new Account?</u>
          </Form.Label>
        </Form.Group>

        <Button variant="primary" type="submit">
          SignIn
        </Button>
      </Form>
    </>
  );
};

export default SignIn;
