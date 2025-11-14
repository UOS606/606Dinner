import React from "react";
import styles from "./Story.module.css";
import { useNavigate } from "react-router-dom";

const Story = () => {
  const navigate = useNavigate();

  if (localStorage.getItem("username") === "admin") {
    navigate("/admin");
  }

  const lines = [
    "특별한 날,",
    "집에서 편안히 보내며",
    "당신이 사랑하는 사람에게",
    "감동을 선물하세요.",
  ];

  return (
    <main className={styles.mainBanner}>
      <div className={styles.leftImage}>
        <img src="/images/story.png" alt="advertisement" />
      </div>
      <div className={styles.rightImage}>
        <img src="/images/dinner/french/deluxe.png" alt="advertisement" />
      </div>
      <div className={styles.overlay}>
        <h1 className={styles.slogan}>
          {lines.map((line, index) => (
            <span
              key={index}
              className={styles.fadeLine}
              style={{ animationDelay: `${index * 1.15}s` }} // 1.5초 간격
            >
              {line}
            </span>
          ))}
        </h1>
      </div>
    </main>
  );
};

export default Story;
