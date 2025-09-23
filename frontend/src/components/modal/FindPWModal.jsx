// src/components/FindPWModal.jsx
import React, { useState } from "react";
import styles from "./FindPWModal.module.css";

const FindPWModal = ({ onClose }) => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      alert("이메일을 입력해 주세요.");
      return;
    }

    // TODO: 서버에 이메일 전송
    alert(`비밀번호 재설정 링크가 ${email}로 전송되었습니다.`);
    onClose();
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

        <h2 className={styles.title}>비밀번호 찾기</h2>
        <p className={styles.description}>
          가입하신 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다.
        </p>

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              type="email"
              name="email"
              value={email}
              placeholder="user@example.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn}>
            링크 보내기
          </button>
        </form>
      </div>
    </div>
  );
};

export default FindPWModal;
