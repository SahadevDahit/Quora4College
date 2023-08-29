"use client";
import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import styles from "../page.module.css";
import Dropdown from "react-bootstrap/Dropdown"; 
const NavbarComponent = () => {
 
  return (
    <>
      <Navbar expand="lg" id={styles.nav}>
        <Container fluid>
          <div className="w-5">
            <Navbar.Brand href="/" >Quora4College</Navbar.Brand>
          </div>
        
          <div className="w-20 d-flex align-items-center justify-content-around">
            <Nav.Link id={styles.link} href="/">
              Home
            </Nav.Link>
            <Nav.Link id={styles.link} href="/chats">
              Chats
            </Nav.Link>
         
            <Nav.Link id={styles.link} href="/profile">
              Profile
            </Nav.Link>
          </div>
        </Container>
      </Navbar>
    </>
  );
};

export default NavbarComponent;
