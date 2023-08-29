"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChangePassword from './changePassword';
import { Form, Button, Row, Col } from 'react-bootstrap';

interface FormValues {
  userName: string;
  email: string;
  phoneNumber: string;
  dob: string;
}

const Profile: React.FC = () => {
  const [formValues, setFormValues] = useState<FormValues>({
    userName: '',
    email: '',
    phoneNumber: '',
    dob: '',
  });

  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await axios.get(`${process.env.server}/users/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Access-Control-Allow-Origin': '*',
          },
        });
        const userProfile = response.data.user;
        // Convert the date format to "YYYY-MM-DD"
        userProfile.dob = userProfile.dob.substring(0, 10);
        setFormValues(userProfile);
      } catch (error) {
        console.log(error);
      }
    };
    getProfile();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await axios.put(`${process.env.server}/users/profile`, formValues, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Access-Control-Allow-Origin': '*',
        },
      });
      console.log(response.data);
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload(); // Refresh the page
  };

  return (
    <>
      <div className="text-right float-end pt-3 pe-3">
        <Button variant="danger" onClick={handleLogout}>
          Logout
        </Button>
      </div>
<div className="container pb-5">
      <h3 className="text-center">My Profile</h3>
      <Form onSubmit={handleSubmit} className="w-50 mx-auto pt-5 ">
        <Row>
          <Form.Group as={Col} controlId="userName">
            <Form.Label>Username</Form.Label>
            <Form.Control type="text" name="userName" value={formValues.userName} onChange={handleChange} required />
          </Form.Group>

          <Form.Group as={Col} controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              disabled={true}
              value={formValues.email}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Row>

        <Row>
          <Form.Group as={Col} controlId="phoneNumber">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control type="number" name="phoneNumber" value={formValues.phoneNumber} onChange={handleChange} required />
          </Form.Group>
        </Row>

        <Row>
          <Form.Group as={Col} controlId="dob">
            <Form.Label>Date of Birth</Form.Label>
            <Form.Control type="date" name="dob" value={formValues.dob} onChange={handleChange} required />
          </Form.Group>
        </Row>
        <Button variant="primary" type="submit" className=" float-end">
          Update
        </Button>
      </Form>
      </div>
      <div>
      <hr />
      <ChangePassword />
      </div>
    </>
  );
};

export default Profile;
