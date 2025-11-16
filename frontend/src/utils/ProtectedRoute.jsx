import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ isLoggedIn, username, adminOnly, children }) => {
  if (!isLoggedIn) return <Navigate to="/" replace />; // 로그인 안되면 홈으로
  if (adminOnly && username !== "admin") return <Navigate to="/" replace />; // admin 전용
  return children;
};

export default ProtectedRoute;
