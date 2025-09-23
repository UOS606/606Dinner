import React from "react";
import styles from "./Story.module.css";

const Story = () => {
  const lines = [
    "특별한 날,",
    "집에서 편안히 보내며",
    "당신이 사랑하는 사람에게",
    "감동을 선물하세요.",
  ];

  return (
    <main className={styles.mainBanner}>
      <div className={styles.overlay}>
        <h1 className={styles.slogan}>
          {lines.map((line, index) => (
            <span
              key={index}
              className={styles.fadeLine}
              style={{ animationDelay: `${index * 1.5}s` }} // 1.5초 간격
            >
              {line} <br />
            </span>
          ))}
        </h1>
      </div>
    </main>
  );
};

export default Story;
