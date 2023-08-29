"use client"
import React, { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';
interface FormValues {
  userName: string;
  email: string;
  password: string;
  phoneNumber: string;
  dob: string;
}
interface SignInProps {
    setIsSignIn: (value: boolean) => void;
  }

  const SignUp: React.FC<SignInProps> = ({setIsSignIn }) => {
  const [formValues, setFormValues] = useState<FormValues>({
    userName: '',
    email: '',
    password: '',
    phoneNumber: '',
    dob: '',
  });

  const handleSubmit = async(event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
        const response = await axios.post(`${process.env.server}/users/`,formValues);
        alert(response.data.message);
        setIsSignIn(true);
    } catch (error) {
        console.log(error);
      }


  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((prevFormValues) => ({
      ...prevFormValues,
      [name]: value,
    }));
  };

  return (<>
  <h3 className='text-center'>SignUp</h3>
    <Form onSubmit={handleSubmit} className='w-50 mx-auto pt-5 '>
      <Row>
        <Form.Group as={Col} controlId="userName">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            name="userName"
            value={formValues.userName}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group as={Col} controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formValues.email}
            onChange={handleChange}
            required
          />
        </Form.Group>
      </Row>

      <Row>
        <Form.Group as={Col} controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={formValues.password}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group as={Col} controlId="phoneNumber">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control
            type="number"
            name="phoneNumber"
            value={formValues.phoneNumber}
            onChange={handleChange}
            required
          />
        </Form.Group>
      </Row>

      <Row>
        <Form.Group as={Col} controlId="dob">
          <Form.Label>Date of Birth</Form.Label>
          <Form.Control
            type="date"
            name="dob"
            value={formValues.dob}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3 float-end" controlId="signIn" onClick={()=>{setIsSignIn(true)}}>
        <Form.Label className='primary pt-3 flo'><u>Already have an Account?</u></Form.Label>
      </Form.Group>
      </Row>

      <Button variant="primary" type="submit" className="mt-2">
        SignUp
      </Button>
    </Form>
    </>
  );
};

export default SignUp;
