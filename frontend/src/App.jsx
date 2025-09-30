import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
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
import AdminDashboard from "./components/admin/AdminDashboard";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showFindPassword, setShowFindPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [username, setUsername] = useState(null);
  const [loginCallback, setLoginCallback] = useState(null);

  const navigate = useNavigate();

  // 새로고침 시 localStorage 토큰 체크
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUsername = localStorage.getItem("username");
    setIsLoggedIn(!!token); // true or false
    setUsername(savedUsername);
  }, []);

  const handleLoginSuccess = (username) => {
    setIsLoggedIn(true);
    setUsername(username);
    localStorage.setItem("username", username);
    setShowLogin(false);

    if (username === "admin") navigate("/admin");
    else navigate("/");

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setUsername(null);
    navigate("/");
  };

  return (
    <>
      <NavBar
        onLoginClick={openLogin}
        onSignupClick={openSignup}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        onRequireLogin={(callback) => openLogin(callback)}
        username={username}
        onLogout={handleLogout}
      />
      <Routes>
        <Route
          path="/admin"
          element={
            <ProtectedRoute
              isLoggedIn={isLoggedIn}
              username={username}
              adminOnly
            >
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/situation"
          element={
            <ProtectedRoute
              isLoggedIn={isLoggedIn}
              username={username}
              adminOnly
            >
              {/* 필요시 AdminOrders 컴포넌트 */}
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <ProtectedRoute
              isLoggedIn={isLoggedIn}
              username={username}
              adminOnly
            >
              {/* 필요시 AdminInventory 컴포넌트 */}
            </ProtectedRoute>
          }
        />

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
    </>
  );
}

export default App;
