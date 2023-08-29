"use client"
import React, { useEffect, useState } from 'react';
import { Container, Card, Image, Button, Form, Dropdown } from 'react-bootstrap';
import { FaArrowLeft, FaTelegramPlane, FaEllipsisV } from 'react-icons/fa';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { io, Socket } from 'socket.io-client';

interface Question {
  _id: string;
  userId: string;
  userName: string;
  question: string;
  createdAt: string;
  likes: string[];
}

interface Answer {
  _id: string;
  userId: {
    _id: string;
    userName: string;
  };
  content: string;
  createdAt: string;
  questionId: string;
}

interface PostDetailsProps {
  selectedQuestion: Question | null;
  userId: string;
  toggleShowQuestionDetails: () => void;
}

const newSocket = io('http://localhost:4000');

const PostDetails: React.FC<PostDetailsProps> = ({ selectedQuestion, userId, toggleShowQuestionDetails }) => {
  const [answerContent, setAnswerContent] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [editStatus, setEditStatus] = useState<boolean>(false);
  const [editedQuestion, setEditedQuestion] = useState<string>('');
  const [question, setQuestion] = useState<any>(null); // New state for the selected question
  const [answers, setAnswers] = useState<Answer[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setSocket(newSocket);
    newSocket?.emit('getAnswers', selectedQuestion?._id);
    newSocket?.on('allAnswers', (questionAnswers) => {
      setAnswers(questionAnswers?.answers);
      setQuestion(questionAnswers)
    });

    newSocket?.on('answerDeleted', (deletedAnswerId) => {
      setAnswers((prevAnswers) => prevAnswers.filter((answer) => answer._id !== deletedAnswerId));
    });

    newSocket?.on('newAnswerAdded', ({ answer }) => {
      setAnswers((prevAnswers) => [answer,...prevAnswers]);
    });

    newSocket?.on('questionUpdated', (updatedQuestion) => {
      setQuestion((prevQuestion: any) => ({
        ...prevQuestion,
        question: updatedQuestion?.question,
      }));
      
    });
    newSocket?.on('Error', (error: { message: string }) => {
      alert('Error: ' + error.message);
    });

    return () => {
      newSocket?.off('allAnswers');
      newSocket?.off('answerDeleted');
      newSocket?.off('newAnswerAdded');
      newSocket?.off('Error');
    };
  }, []);

  const handleBack = () => {
    toggleShowQuestionDetails();
  };

  const handleDeleteAnswer = (answerId: string, questionId: string) => {
    newSocket?.emit('deleteAnswer', { answerId, questionId });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    socket?.emit('newAnswer', { answerContent, userId, questionId: selectedQuestion?._id });
    setAnswerContent('');
  };

  const renderCardHeader = () => {
    return (
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <Image src={`/profileImage.svg`} alt="Profile Image" className="me-2" width={40} height={40} />
          <Card.Title>{selectedQuestion?.userName}</Card.Title>
        </div>
        {selectedQuestion?.userId === userId && (
          <Dropdown>
            <Dropdown.Toggle variant="link" id="dropdown-basic" className="text-decoration-none">
              <FaEllipsisV />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => {setEditStatus(true); setEditedQuestion(question?.question) }}>Edit</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )}
      </div>
    );
  };

  const handleQuestionUpdate = () => {
    const questionId:string=question?._id;
    socket?.emit("updateQuestion",{questionId,editedQuestion})
    setEditStatus(false);
  };

  return (
    <Container className="">
      <Button variant="primary" className="mb-2" onClick={handleBack}>
        <FaArrowLeft className="me-2" />
        Back
      </Button>

      <Card className="mb-4">
        <Card.Body>
          {renderCardHeader()}
          {editStatus ? (
            <div>
              <Form.Control
                type="text"
                value={editedQuestion}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedQuestion(e.target.value)}
              />
              <Button variant="primary" onClick={handleQuestionUpdate}>
                Update
              </Button>
            </div>
          ) : (
            <Card.Text className="fs-5">{question?.question}</Card.Text>
          )}
          <FontAwesomeIcon icon={faHeart} color={'red'} />
          <span className="ms-2">{question?.likes?.length}</span>
        </Card.Body>
      </Card>

      <h2>Answers ({answers?.length})</h2>
      <hr />
      <div className="py-3">
        <h3>Leave your answer</h3>
        <Form onSubmit={handleCommentSubmit}>
          <Form.Group controlId="answer">
            <div className="position-relative">
              <Form.Control
                as="textarea"
                rows={5}
                value={answerContent}
                maxLength={400}
                placeholder="Write your answer..."
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAnswerContent(e.target.value)}
              />
              <Button variant="primary" type="submit" className="position-absolute bottom-0 end-0 mb-1 me-1">
                <FaTelegramPlane />
              </Button>
            </div>
          </Form.Group>
        </Form>
      </div>
      {answers?.map((answer: Answer) => (
        <Card key={answer?._id} className="mb-1">
          <Card.Body className="d-flex justify-content-between">
            <div className="mb-2 d-flex">
              <Image src={`profileImage.svg`} alt="Profile Image" className="me-2" width={40} height={40} />
              <div>
                <Card.Title>
                  {answer?.userId?.userName} <br />
                  <small>{answer?.createdAt}</small>
                </Card.Title>
                <Card.Text>{answer?.content}</Card.Text>
              </div>
            </div>
            {(answer?.userId?._id === userId || userId===question?.userId?._id ) && (
              <div className="">
                <Dropdown>
                  <Dropdown.Toggle variant="link" id="dropdown-basic" className="text-decoration-none">
                    <FaEllipsisV />
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => handleDeleteAnswer(answer?._id, answer?.questionId)}>
                      Delete
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            )}
          </Card.Body>
        </Card>
      ))}     
    </Container>
  );
};

export default PostDetails;
