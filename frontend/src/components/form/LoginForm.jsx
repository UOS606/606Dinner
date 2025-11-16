import React, { useState } from "react";
import styles from "../../styles/LoginForm.module.css";
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
      // Test Code Start
      const users = JSON.parse(localStorage.getItem("test_users") || "[]");

      const matchedUser = users.find(
        (u) => u.username === form.username && u.password === form.password
      );

      if (matchedUser) {
        // 성공 시 token 대신 간단히 아이디 저장
        localStorage.setItem("token", "dummy-token");
        localStorage.setItem("username", matchedUser.username);

        alert("로그인 성공!");
        if (onLoginSuccess) onLoginSuccess(matchedUser.username); // 부모 콜백 호출
        onClose();
      } else {
        alert("로그인 실패!");
      }
      // Test Code End
    } else {
      // Post Code Start

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

        // JWT 토큰 저장
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);

        alert("로그인 성공!");
        if (onLoginSuccess) onLoginSuccess(data.username); // 로그인 상태 반영
        onClose();
      } catch (err) {
        console.error(err);
        alert("서버 오류 발생");
      }

      // Post Code End
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
            </button>{" "}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
