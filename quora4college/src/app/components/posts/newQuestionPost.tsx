"use client";
import React, { SyntheticEvent, useState } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";

const NewQuestionPost: React.FC = () => {
  const [question, setQuestion] = useState<string>("");

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();

    try {
      const response = await axios.post(
        `${process.env.server}/questions/newQuestion`,
        { question },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      console.log(response?.data?.newQuestion);
      alert("New question has been created");
      setQuestion(""); // Clear the input field on success
    } catch (error) {
      console.error("Error creating a new question:", error);
      alert("An error occurred while creating a new question");
    }
  };

  const handleQuestionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setQuestion(event.target.value);
  };

  return (
    <div className="w-50 mt-4">
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="questionForm">
          <Form.Label>Post a Question</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            maxLength={400}
            placeholder="Enter your question"
            value={question}
            onChange={handleQuestionChange}
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="float-end">
          Post
        </Button>
      </Form>
    </div>
  );
};

export default NewQuestionPost;
