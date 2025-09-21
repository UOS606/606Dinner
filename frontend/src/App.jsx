import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home"; // 추가
import NavBar from "./components/NavBar";
import LoginModal from "./components/LoginModal";
import SignupModal from "./components/SignupModal"; // 새로 만드셔야 함
import styles from "./App.module.css";
import FindPWModal from "./components/FindPWModal";
import Menu from "./components/menu/Menu"; // 추가
import Cart from "./components/order/Cart";
import CurrentOrder from "./components/order/CurrentOrder";
import OrderHistory from "./components/order/OrderHistory";

function Story() {
  return (
    <main className={styles.mainBanner}>
      <h1 className={styles.slogan}>
        특별한 날, <br />
        집에서 편안히 보내며
        <br />
        당신이 사랑하는 사람에게
        <br />
        감동을 선물하세요.
      </h1>
    </main>
  );
}

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showFindPassword, setShowFindPassword] = useState(false);

  const openLogin = () => {
    setShowLogin(true);
    setShowSignup(false);
  };

  const openSignup = () => {
    setShowSignup(true);
    setShowLogin(false);
  };

  const openFindPassword = () => {
    setShowLogin(false);
    setShowSignup(false);
    setShowFindPassword(true);
  };

  const closeModals = () => {
    setShowLogin(false);
    setShowSignup(false);
    setShowFindPassword(false);
  };

  return (
    <Router>
      <NavBar onLoginClick={openLogin} onSignupClick={openSignup} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/story" element={<Story />} />
        <Route path="/menu" element={<Menu />} /> {/* 🔹 Menu 컴포넌트 연결 */}
        <Route path="/order/cart" element={<Cart />} />
        <Route path="/order/current" element={<CurrentOrder />} />
        <Route path="/order/history" element={<OrderHistory />} />
      </Routes>

      {showLogin && (
        <LoginModal
          onClose={closeModals}
          onShowSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
          onShowFindPassword={openFindPassword}
        />
      )}

      {showSignup && (
        <SignupModal
          onClose={closeModals}
          onShowLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
      )}
      {showFindPassword && <FindPWModal onClose={closeModals} />}
    </Router>
  );
}

export default App;
