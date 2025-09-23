// src/components/NavBar.jsx
import React from "react";
import styles from "./NavBar.module.css";
import { Link } from "react-router-dom";

const NavBar = ({ onLoginClick, onSignupClick }) => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="/">
          <img src="/images/dinner_606_logo_v3.png" alt="606Dinner Logo" />
        </Link>
      </div>

      <div className={styles.menu}>
        <Link to="/story">STORY</Link>
        <Link to="/menu">MENU</Link>
        <div className={styles.dropdown}>
          <span className={styles.dropdownToggle}>ORDER</span>
          <div className={styles.dropdownMenu}>
            <Link to="/order/cart">장바구니</Link>
            <Link to="/order/current">현재 주문 내역</Link>
            <Link to="/order/history">이전 주문 내역</Link>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.loginBtn} onClick={onLoginClick}>
          로그인
        </button>
        <button className={styles.signupBtn} onClick={onSignupClick}>
          회원가입
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
