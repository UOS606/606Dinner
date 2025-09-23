import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/home/Home"; // 추가
import NavBar from "./components/common/nav_bar/NavBar";
import LoginModal from "./components/modal/LoginModal";
import SignupModal from "./components/modal/SignupModal"; // 새로 만드셔야 함
import Story from "./components/story/Story"; // 새로 만든 컴포넌트 불러오기
import FindPWModal from "./components/modal/FindPWModal";
import Menu from "./components/menu/Menu"; // 추가
import Cart from "./components/order/Cart";
import CurrentOrder from "./components/order/CurrentOrder";
import OrderHistory from "./components/order/OrderHistory";

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
