"use client";
import React, { useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import axios from "axios";


interface FormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
export default function ChangePassword() {

  const [formData, setFormData] = useState<FormData>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if(formData.confirmPassword!==formData.newPassword){
        alert("Passwords do not match between confirm password and new passwords");
                return;
    }
    try {
      await axios
        .put(`${process.env.server}/users/profile`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Access-Control-Allow-Origin": "*",
          },
        })
        .then((response) => {
            alert("sucessful")
            
        });
    } catch (error: any) {
    }
  };

  return (
    <>
      <Form className="w-50 p-3 mx-auto" onSubmit={handleSubmit}>
        <Form.Group controlId="oldPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="oldPassword"
            value={formData.oldPassword}
            onChange={handleChange}
            placeholder="Old Password"
            style={{ width: "100%" }}
          />
        </Form.Group>

        <Form.Group controlId="NewPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="New Password"
            style={{ width: "100%" }}
          />
        </Form.Group>
        <Form.Group controlId="confirmPassword">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm New Password"
            style={{ width: "100%" }}
          />
        </Form.Group>
        <div className="d-flex justify-content-end mt-3">
          <Button variant="primary" type="submit">
            Update
          </Button>
        </div>
      </Form>
    </>
  );
}
