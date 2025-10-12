// src/components/NavBar.jsx
import { useState, useEffect } from "react";
import styles from "./NavBar.module.css";
import { Link, useNavigate } from "react-router-dom";

import { isForTest } from "../../../App";

const NavBar = ({
  onLoginClick,
  onSignupClick,
  isLoggedIn,
  setIsLoggedIn,
  onRequireLogin,
  username,
  onLogout,
}) => {
  const [couponCount, setCouponCount] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCouponStatus = async (userId) => {
      if (!userId) return;

      if (isForTest) {
        const testCoupons =
          JSON.parse(localStorage.getItem("test_coupons")) || [];
        const userCoupon = testCoupons.find((c) => c.id === userId);
        setCouponCount(userCoupon ? userCoupon.unusedCouponCount : 0);
      } else {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch("/api/coupons", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          setCouponCount(data?.unusedCouponCount ?? 0);
        } catch (err) {
          console.error("쿠폰 정보를 불러오지 못했습니다:", err);
          setCouponCount(0);
        }
      }
    };

    fetchCouponStatus(username);
  }, [username]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    navigate("/");
    onLogout();
    const protectedPaths = ["/order/cart", "/order/history"];
    if (protectedPaths.includes(window.location.pathname)) {
      navigate("/"); // 메인 페이지로 이동
    }
  };

  const handleProtectedClick = (path) => {
    if (!isLoggedIn) {
      onRequireLogin(() => {
        // 로그인 후 원래 이동
        navigate(path);
      });
      return;
    }
    navigate(path); // 이미 로그인된 경우 바로 이동
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <img
          src="/images/dinner_606_logo_v3.png"
          alt="606Dinner Logo"
          style={{ cursor: "pointer" }}
          onClick={() => {
            if (username === "admin") navigate("/admin");
            else navigate("/");
          }}
        />
      </div>

      <div className={styles.menu}>
        {username === "admin" ? (
          <>
            <span className={styles.admin}>관리자용 페이지</span>
          </>
        ) : (
          <>
            <Link to="/story">STORY</Link>
            <Link to="/menu">MENU</Link>
            <div className={styles.dropdown}>
              <span className={styles.dropdownToggle}>ORDER</span>
              <div className={styles.dropdownMenu}>
                <button onClick={() => handleProtectedClick("/order/cart")}>
                  장바구니
                </button>
                <button onClick={() => handleProtectedClick("/order/history")}>
                  주문 내역
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className={styles.actions}>
        {isLoggedIn ? (
          <>
            {username !== "admin" && (
              <span className={styles.couponInfo}>
                {couponCount === null ? (
                  "쿠폰 정보를 불러오는 중..."
                ) : (
                  <>
                    쿠폰 <strong>{couponCount}</strong>매 보유 중
                  </>
                )}
              </span>
            )}

            <button onClick={handleLogout} className={styles.loginBtn}>
              로그아웃
            </button>
          </>
        ) : (
          <>
            <button onClick={onLoginClick} className={styles.loginBtn}>
              로그인
            </button>
            <button className={styles.signupBtn} onClick={onSignupClick}>
              회원가입
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
