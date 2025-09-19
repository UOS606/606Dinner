// src/components/LoginModal.jsx
import React from "react";
import styles from "./LoginModal.module.css";

const LoginModal = ({ onClose, onShowSignup, onShowFindPassword }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          ×
        </button>

        <div className={styles.logo}>
          <img src="/images/dinner_606_logo_v3.png" alt="606Dinner Logo" />
        </div>

        <form action="/login" method="post">
          <div className={styles.inputGroup}>
            <label htmlFor="username">아이디</label>
            <input type="text" id="username" name="username" required />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">비밀번호</label>
            <input type="password" id="password" name="password" required />
          </div>

          <button type="submit" className={styles.loginBtn}>
            로그인
          </button>
        </form>

        <div className={styles.extraLinks}>
          <button
            type="button"
            className={styles.linkButton}
            onClick={onShowSignup}
          >
            회원가입
          </button>{" "}
          |{" "}
          <button
            type="button"
            className={styles.linkButton}
            onClick={onShowFindPassword}
          >
            비밀번호 찾기
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
