"use client";
import React, { useEffect, useState, FormEvent } from "react";
import { Container, Form, Button, ListGroup, Image } from "react-bootstrap";
import { BsFillChatFill } from "react-icons/bs";
import { io, Socket } from "socket.io-client";
import { nanoid } from "nanoid";
import { format } from "timeago.js";

interface ChatMessage {
  _id: string;
  id: string;
  recipientId: string;
  message: string;
  userId: string;
  userName: string;
  createdAt: string;
}

interface User {
  id: string;
  _id: string;
  userName: string;
  online: boolean;
  profileImage: string;
  messageCounts: number;
}

const ChatPage: React.FC = () => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [userId, setUserId] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [privateMessage, setPrivateMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showGroupChats, setShowGroupChats] = useState(false);
  const [groupChats, setGroupChats] = useState<string[]>([
    "Group Chat 1",
    "Group Chat 2",
    "Group Chat 3",
  ]);
  const [selectedGroupChat, setSelectedGroupChat] = useState<string>("");

  useEffect(() => {
    const newSocket = io(`${process.env.server}`);
    setSocket(newSocket);
    const newUserId = nanoid();
    setUserId(newUserId);

    newSocket.on("onlineUsers", (data: User[]) => {
      setOnlineUsers(data);
    });

    newSocket.on("connect", () => {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Access-Control-Allow-Origin": "*",
      };
      newSocket.emit("initializeUser", newUserId, headers);
    });

    newSocket.on("userDisconnected", (userId: string) => {
      setOnlineUsers((prevUsers) =>
        prevUsers.map((user) => {
          if (user.id === userId) {
            return { ...user, online: false };
          }
          return user;
        })
      );
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleReceivedMessage = (data: ChatMessage) => {
      if (data.userId === recipientId || data.userId == userId) {
        setChatMessages((prevMessages) => [...prevMessages, data]);
        socket?.emit("recipientSelected", { recipientId });
      }
    };

    socket?.on("message", handleReceivedMessage);

    return () => {
      socket?.off("message", handleReceivedMessage);
    };
  }, [recipientId, userId]);

  useEffect(() => {
    const element = document.getElementById(`chatList`);
    if (element !== null) {
      element.scrollTop = element.scrollHeight;
    }
  }, [chatMessages, recipientId]);

  const handleUserClick = (recipientId: string) => {
    const user = onlineUsers.find((user) => user.id === recipientId) || null;
    setSelectedUser(user);
    setRecipientId(recipientId);
    if (socket && recipientId) {
      socket.emit(
        "loadChatMessages",
        recipientId,
        (messages: ChatMessage[]) => {
          setChatMessages(messages);
        }
      );
      socket.emit("recipientSelected", { recipientId });
    } else {
      setChatMessages([]);
    }
  };
  const handlePrivateMessageSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (privateMessage.trim() !== "" && socket && recipientId) {
      const privateMessageObj: ChatMessage = {
        id: nanoid(),
        _id: "",
        recipientId: recipientId,
        message: privateMessage,
        userId: userId,
        userName: "",
        createdAt: format(new Date(), "YYYY-MM-DD HH:mm:ss"),
      };
      socket.emit("privateMessage", {
        recipientId,
        message: privateMessageObj,
      });
      setPrivateMessage("");
    } else {
      alert("Select a user to send a private message");
    }
  };

  const handleGroupChatsClick = () => {
    setShowGroupChats(true);
    setSelectedGroupChat("");
    setChatMessages([]); // Clear chat messages when group chats are selected
  };

  const handlePrivateChatsClick = () => {
    setShowGroupChats(false);
    setChatMessages([]); // Clear chat messages when private chats are selected
  };

  const handleGroupChatClick = (groupChat: string) => {
    setSelectedGroupChat(groupChat);
    setChatMessages([]); // Clear chat messages when a group chat is selected
  };

  return (
    <div style={{ position: "relative", minHeight: "90vh", display: "flex" }}>
      <div
        style={{ flex: "0 0 20%", backgroundColor: "#f8f9fa", padding: "10px" }}
      >
        <div style={{ display: "flex", marginBottom: "10px" }}>
          <h5
            style={{
              marginRight: "10px",
              cursor: "pointer",
              color: showGroupChats ? "inherit" : "blue",
            }}
            onClick={handlePrivateChatsClick}
          >
            <BsFillChatFill className="me-2" />
            Private Chats
          </h5>
          <h5
            style={{
              marginRight: "10px",
              cursor: "pointer",
              color: showGroupChats ? "blue" : "inherit",
            }}
            onClick={handleGroupChatsClick}
          >
            <BsFillChatFill className="me-2" />
            Group Chats
          </h5>
        </div>
        {showGroupChats ? (
          <>
            <h5>Group Chats:</h5>
            <h6>Under Development</h6>
            <ListGroup>
              {groupChats.map((groupChat) => (
                <ListGroup.Item
                  key={groupChat}
                  onClick={() => handleGroupChatClick(groupChat)}
                  style={{
                    color: selectedGroupChat === groupChat ? "blue" : "inherit",
                    cursor: "pointer",
                  }}
                >
                  {groupChat}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </>
        ) : (
          <>
            <h5>Online Users:</h5>
            <Form.Group controlId="searchForm">
              <Form.Control
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Form.Group>
            <ListGroup>
              {onlineUsers
                .filter(
                  (user) =>
                    user?.userName
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()) && userId !== user.id
                )
                .map((user) => (
                  <ListGroup.Item
                    key={user.id}
                    onClick={() => handleUserClick(user.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      color: recipientId === user.id ? "blue" : "inherit",
                    }}
                  >
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        backgroundColor: user.online ? "green" : "blue",
                        borderRadius: "50%",
                        marginRight: "5px",
                      }}
                    ></div>
                    {user.userName}
                    {user?.messageCounts > 0 ? (
                      <p>{user.messageCounts}</p>
                    ) : (
                      <></>
                    )}
                  </ListGroup.Item>
                ))}
            </ListGroup>
          </>
        )}
      </div>

      <Container style={{ flex: "1", padding: "10px" }}>
        <div className="selected-user d-flex">
          {selectedUser && !showGroupChats && (
            <>
              <Image
                src="/profileImage.svg"
                roundedCircle
                alt=""
                className="me-2"
                width={40}
                height={40}
              />
              <h5>{selectedUser.userName}</h5>
            </>
          )}
          {selectedGroupChat && showGroupChats && (
            <>
              <h5>{selectedGroupChat}</h5>
            </>
          )}
        </div>
        <ListGroup
          style={{ height: "70vh", overflowY: "auto" }}
          className="mb-2"
          id="chatList"
        >
          {recipientId &&
            chatMessages?.map((chat, index) => (
              <li
                key={index}
                className={`message my-1 pt-1 px-2 ${
                  chat.userId === userId ? "own-message" : "other-message"
                }`}
                style={{
                  alignSelf: chat.userId === userId ? "flex-end" : "flex-start",
                  listStyle: "none",
                  backgroundColor:
                    chat.userId === userId ? "#007bff" : "inherit",
                  color: chat.userId === userId ? "white" : "inherit",
                  maxWidth: "75%",
                  borderRadius: "12px",
                  padding: "4px",
                  marginBottom: "8px",
                }}
              >
                <p className="message-user">
                  {chat.message}
                  <br />
                  <small>{format(chat.createdAt)}</small>
                </p>
              </li>
            ))}
        </ListGroup>
      </Container>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "10px",
          background: "#f8f9fa",
        }}
      >
        {!showGroupChats ? (
          <Container>
            <Form onSubmit={handlePrivateMessageSubmit}>
              <Form.Group controlId="privateMessageInput" className="mb-0">
                <div style={{ display: "flex" }}>
                  <Form.Control
                    type="text"
                    placeholder="Enter your message..."
                    value={privateMessage}
                    onChange={(e) => setPrivateMessage(e.target.value)}
                  />
                  <Button variant="primary" type="submit">
                    <BsFillChatFill className="mr-2" />
                    Send
                  </Button>
                </div>
              </Form.Group>
            </Form>
          </Container>
        ) : (
          <Container>
            <Form>
              <Form.Group controlId="groupMessageInput" className="mb-0">
                <div style={{ display: "flex" }}>
                  <Form.Control
                    type="text"
                    placeholder="Enter your message..."
                    // value={privateMessage}
                    // onChange={(e) => setPrivateMessage(e.target.value)}
                  />
                  <Button variant="primary" type="submit">
                    <BsFillChatFill className="mr-2" />
                    Send
                  </Button>
                </div>
              </Form.Group>
            </Form>
          </Container>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
