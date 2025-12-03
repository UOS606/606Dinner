// src/components/modal/LoginModal.jsx
import React, { useState } from "react";
import styles from "./LoginModal.module.css";
import { isForTest } from "../../App";

const LoginModal = ({
  onClose,
  onShowSignup,
  onLoginSuccess,
  hidden,
}) => {
  const [form, setForm] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isForTest) {
      // ---------- TEST CODE ----------
      const users = JSON.parse(localStorage.getItem("test_users") || "[]");

      const matchedUser = users.find(
        (u) => u.username === form.username && u.password === form.password
      );

      if (matchedUser) {
        // 테스트 모드에서는 더미 토큰과 아이디만 저장
        localStorage.setItem("token", "dummy-token");
        localStorage.setItem("username", matchedUser.username);

        alert("로그인 성공!");
        if (onLoginSuccess) onLoginSuccess(matchedUser.username);
        onClose();
      } else {
        alert("로그인 실패!");
      }
      // ---------- TEST CODE END ----------
    } else {
      // ---------- REAL LOGIN CODE ----------
      try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "로그인 실패");
          return;
        }

        // ✅ 토큰 형식 정리: "Bearer xxx" 로 오든, "xxx"로 오든 통일해서 저장
        let token = data.token;
        if (typeof token === "string" && token.startsWith("Bearer ")) {
          token = token.slice(7); // "Bearer " 잘라냄
        }

        // JWT 토큰과 username 저장
        localStorage.setItem("token", token);
        localStorage.setItem("username", data.username);

        alert("로그인 성공!");
        if (onLoginSuccess) onLoginSuccess(data.username);
        onClose();
      } catch (err) {
        console.error(err);
        alert("서버 오류 발생");
      }
      // ---------- REAL LOGIN CODE END ----------
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          ×
        </button>

        <div className={styles.logo}>
          <img src="/images/dinner_606_logo_v3.png" alt="606Dinner Logo" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="username">아이디</label>
            <input
              type="text"
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className={styles.loginBtn}>
            로그인
          </button>
        </form>

        {!hidden && (
          <div className={styles.extraLinks}>
            <button
              type="button"
              className={styles.linkButton}
              onClick={onShowSignup}
            >
              회원가입
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
