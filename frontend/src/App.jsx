import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/home/Home"; // 추가
import NavBar from "./components/common/nav_bar/NavBar";
import LoginModal from "./components/modal/LoginModal";
import SignupModal from "./components/modal/SignupModal"; // 새로 만드셔야 함
import Story from "./components/story/Story"; // 새로 만든 컴포넌트 불러오기
import FindPWModal from "./components/modal/FindPWModal";
import Menu from "./components/menu/Menu"; // 추가
import Cart from "./components/order/Cart";
import ProtectedRoute from "./components/common/ProtectedRoute";

import OrderHistory from "./components/order/OrderHistory";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showFindPassword, setShowFindPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  const [loginCallback, setLoginCallback] = useState(null);

  // 새로고침 시 localStorage 토큰 체크
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token); // true or false
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowLogin(false);

    if (typeof loginCallback === "function") {
      loginCallback();
    }
    setLoginCallback(null);
  };

  const openLogin = (callback = () => {}) => {
    setLoginCallback(() => callback);
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
    setLoginCallback(null);
  };

  return (
    <Router>
      <NavBar
        onLoginClick={openLogin}
        onSignupClick={openSignup}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        onRequireLogin={(callback) => openLogin(callback)}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/story" element={<Story />} />
        <Route
          path="/menu"
          element={
            <Menu
              isLoggedIn={isLoggedIn}
              handleLoginSuccess={handleLoginSuccess}
            />
          }
        />
        <Route
          path="/order/cart"
          element={
            isLoggedIn === null ? null : ( // 아직 판단 전이면 아무것도 렌더링 안함
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Cart />
              </ProtectedRoute>
            )
          }
        />
        <Route
          path="/order/history"
          element={
            isLoggedIn === null ? null : ( // 아직 판단 전이면 아무것도 렌더링 안함
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <OrderHistory />
              </ProtectedRoute>
            )
          }
        />
      </Routes>

      {showLogin && (
        <LoginModal
          onClose={closeModals}
          onShowSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
          onShowFindPassword={openFindPassword}
          onLoginSuccess={handleLoginSuccess}
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
