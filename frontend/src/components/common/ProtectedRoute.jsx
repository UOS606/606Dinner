// src/components/common/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ isLoggedIn, children }) => {
  if (!isLoggedIn) {
    // 로그인 안 되어 있으면 메인 페이지로 이동
    return <Navigate to="/" replace />;
  }

  // 로그인 되어 있으면 정상적으로 렌더링
  return children;
};

export default ProtectedRoute;
