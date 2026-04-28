import React from "react";
import "../styles/Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <div className="logo-glow"></div>
        <div className="spinner">
          <div className="double-bounce1"></div>
          <div className="double-bounce2"></div>
        </div>
        <h2 className="home-text">CongoTransit</h2>
        <p className="home-subtext">Chargement de votre espace sécurisé...</p>
      </div>
    </div>
  );
};

export default Home;
