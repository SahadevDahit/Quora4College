"use client";
import React, { useState, useEffect, useRef } from "react";
import { Container, Button, Card, Image } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDivide, faHeart } from "@fortawesome/free-solid-svg-icons";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { io, Socket } from "socket.io-client";
import NewQuestionPost from "./components/posts/newQuestionPost";
import PostDetails from "./components/posts/postDetails";
import { useDispatch, useSelector } from "react-redux";
import { setField } from "./redux_toolkit/slices/stateSlice";
import { RootState } from "./redux_toolkit/store/store";
import axios from "axios";
interface Question {
  _id: string;
  userId: string;
  userName: string;
  question: string;
  createdAt: string;
  likes: string[];
}

const Home: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [questionCards, setQuestionCards] = useState<Question[]>([]);
  const [searchResult, setSearchResult] = useState<Question[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [showQuestionDetails, setShowQuestionDetails] =
    useState<Boolean>(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  ); // New state for the selected question
  const attributesSlice = useSelector((state: RootState) => state.attributes);
  const [currentPage, setCurrentPage] = useState(1);

  const dispatch = useDispatch();

  useEffect(() => {
    const newSocket = io("http://localhost:4000");
    setSocket(newSocket);
    newSocket.on("Error", (error: { message: string }) => {
      alert("Error: " + error.message);
    });

    const headers = {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Access-Control-Allow-Origin": "*",
    };

    newSocket.emit("getAllQuestions", headers, currentPage);

    newSocket.on(
      "allQuestions",
      (allQuestions: Question[], userAuthId: string) => {
        if (allQuestions?.length > 0) {
          setUserId(userAuthId);
          setQuestionCards([...questionCards, ...allQuestions]);
        }
      }
    );

    newSocket.on("likeUpdated", (updatedQuestion: Question) => {
      setQuestionCards((prevCards) =>
        prevCards.map((card) =>
          card._id === updatedQuestion._id ? updatedQuestion : card
        )
      );
    });

    return () => {
      newSocket.disconnect();
    };
  }, [currentPage]);

  useEffect(() => {
    const element = document.getElementById(`${attributesSlice.questionId}`);
    if (element !== null) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, [showQuestionDetails]);
  const handleSearchInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchQuery(event.target.value);
    try {
      const response = await axios.post(
        `${process.env.server}/questions/search`,
        {
          searchQuery,
        }
      );
      setSearchResult(response?.data);
    } catch (error) {
      // Handle errors here
      console.log(error);
    }
  };

  const handleLike = (questionId: string) => {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Access-Control-Allow-Origin": "*",
    };
    socket?.emit("likeQuestion", { questionId, headers });
  };
  const loadMore = () => {
    if (questionCards.length === 0) {
      return;
    }
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const truncateContent = (content: string, maxLength: number): string => {
    if (content.length > maxLength) {
      return content.slice(0, maxLength);
    }
    return content;
  };

  const showAnswers = (questionId: string) => {
    const selectedQuestion = questionCards.find(
      (card) => card._id === questionId
    );
    setSelectedQuestion(selectedQuestion || null);
    dispatch(setField({ questionId }));
    setShowQuestionDetails(true);
  };
  const toggleShowQuestionDetails = () => {
    setShowQuestionDetails(!showQuestionDetails);
  };
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <>
      {showQuestionDetails ? (
        <PostDetails
          selectedQuestion={selectedQuestion}
          userId={userId}
          toggleShowQuestionDetails={toggleShowQuestionDetails}
        />
      ) : (
        <></>
      )}

      <Container
        className={
          showQuestionDetails
            ? "d-none"
            : `d-flex flex-column align-items-center `
        }
        style={{ height: "100%" }}
      >
        <NewQuestionPost />
        <div className="input-group mb-3 mt-3 w-50">
          <input
            type="text"
            className="form-control"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchInputChange}
          />
          <div className="input-group-append">
            <button className="btn btn-outline-secondary" type="button">
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>
        </div>

        <div className="w-75 h-100 mt-4">
          {searchResult?.map((card, index) => (
            <Card key={card._id} id={card._id} className="py-3 my-2">
              <Card.Body>
                <div className="d-flex align-items-center mb-2">
                  <Image
                    src="/profileImage.svg"
                    roundedCircle
                    alt=""
                    className="me-2"
                    width={40}
                    height={40}
                  />
                  <Card.Title>
                    {card?.userName}
                    <br />
                    <small>{card?.createdAt}</small>
                  </Card.Title>
                </div>
                <Card.Text className="p-3 fs-5">
                  {truncateContent(card.question, 80)}
                  {card.question.length > 80 && (
                    <Button
                      variant="link"
                      className="fs-5 text-decoration-none"
                      onClick={() => showAnswers(card._id)}
                    >
                      ...See more
                    </Button>
                  )}
                </Card.Text>
                <Button
                  variant="outline-primary"
                  onClick={() => handleLike(card._id)}
                >
                  <FontAwesomeIcon
                    icon={faHeart}
                    color={card.likes.includes(userId) ? "red" : "grey"}
                  />
                  <span className="ms-2">{card.likes.length}</span>
                </Button>
                <Button
                  variant="outline-secondary"
                  className="mx-2"
                  onClick={() => showAnswers(card._id)}
                >
                  Answers
                </Button>
              </Card.Body>
            </Card>
          ))}
          {questionCards?.map((card, index) => (
            <Card key={card._id} id={card._id} className="py-3 my-2">
              <Card.Body>
                <div className="d-flex align-items-center mb-2">
                  <Image
                    src="/profileImage.svg"
                    roundedCircle
                    alt=""
                    className="me-2"
                    width={40}
                    height={40}
                  />
                  <Card.Title>
                    {card?.userName}
                    <br />
                    <small>{card?.createdAt}</small>
                  </Card.Title>
                </div>
                <Card.Text className="p-3 fs-5">
                  {truncateContent(card.question, 80)}
                  {card.question.length > 80 && (
                    <Button
                      variant="link"
                      className="fs-5 text-decoration-none"
                      onClick={() => showAnswers(card._id)}
                    >
                      ...See more
                    </Button>
                  )}
                </Card.Text>
                <Button
                  variant="outline-primary"
                  onClick={() => handleLike(card._id)}
                >
                  <FontAwesomeIcon
                    icon={faHeart}
                    color={card.likes.includes(userId) ? "red" : "grey"}
                  />
                  <span className="ms-2">{card.likes.length}</span>
                </Button>
                <Button
                  variant="outline-secondary"
                  className="mx-2"
                  onClick={() => showAnswers(card._id)}
                >
                  Answers
                </Button>
              </Card.Body>
            </Card>
          ))}
        </div>

        <div
          className="fixed-bottom w-100 d-flex justify-content-between px-1 "
          style={{ backgroundColor: "white" }}
        >
          <Button variant="primary" onClick={scrollToTop}>
            Scroll to Top
          </Button>
          <Button
            onClick={loadMore}
            disabled={questionCards.length === 0}
            variant="primary"
            style={{ border: "none", backgroundColor: "white", color: "blue" }}
          >
            Load More...
          </Button>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </div>
      </Container>
    </>
  );
};

export default Home;
