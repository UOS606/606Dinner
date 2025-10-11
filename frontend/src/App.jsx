import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Home from "./components/home/Home"; // 추가
import NavBar from "./components/common/nav_bar/NavBar";
import LoginModal from "./components/modal/LoginModal";
import SignupModal from "./components/modal/SignupModal"; // 새로 만드셔야 함
import Story from "./components/story/Story"; // 새로 만든 컴포넌트 불러오기
import Menu from "./components/menu/Menu"; // 추가
import Cart from "./components/order/Cart";
import ProtectedRoute from "./components/common/ProtectedRoute";
import OrderHistory from "./components/order/OrderHistory";
import AdminDashboard from "./components/admin/AdminDashboard";

export let isForTest = false; // true for test, false for deploy

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [username, setUsername] = useState(null);
  const [loginCallback, setLoginCallback] = useState(null);
  const [hidden, setHidden] = useState(false);

  const navigate = useNavigate();

  // 새로고침 시 localStorage 토큰 체크
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUsername = localStorage.getItem("username");
    setIsLoggedIn(!!token); // true or false
    setUsername(savedUsername);
  }, []);

  const handleLoginSuccess = (name) => {
    setIsLoggedIn(true);
    setShowLogin(false);
    setUsername(localStorage.getItem("username"));
    if (name === "admin") navigate("/admin");

    if (typeof loginCallback === "function" && name !== "admin") {
      loginCallback();
    }
    setHidden(false);
    setLoginCallback(null);
  };

  const openLogin = (callback = () => {}) => {
    if (isForTest) {
      const users = JSON.parse(localStorage.getItem("test_users") || "[]");
      if (!users.some((u) => u.username === "admin")) {
        users.push({
          username: "admin",
          password: "1234",
          name: "관리자",
          email: "606Dinner@daebak.com",
          phone: "01000000000",
          address: "서울특별시 김구 김읍 김동",
          cardNumber: "1111222233334444",
        });
        localStorage.setItem("test_users", JSON.stringify(users));
      }
    }
    setShowLogin(true);
    setLoginCallback(() => callback);
    setShowSignup(false);
  };

  const openSignup = () => {
    setShowSignup(true);
    setShowLogin(false);
  };

  const closeModals = () => {
    setShowLogin(false);
    setShowSignup(false);

    setLoginCallback(null);
    setHidden(false);
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
          onLoginSuccess={handleLoginSuccess}
          hidden={hidden}
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
    </>
  );
}

export default App;
