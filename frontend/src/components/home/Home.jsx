import React, { useEffect, useState } from "react";
import styles from "./Home.module.css";

const Home = () => {
  const [bannerIndex, setBannerIndex] = useState(0);
  const [menuIndex, setMenuIndex] = useState(0);

  const bannerImages = ["/images/homepage1.png", "/images/homepage2.png"];
  const menuSets = [
    [
      { src: "/images/dinner/valentine/default.png" },
      { src: "/images/dinner/french/default.png" },
    ],
    [
      { src: "/images/dinner/english/default.png" },
      { src: "/images/dinner/champagne_feast/default.png" },
    ],
  ];

  // 왼쪽 배너 (10초마다 변경)
  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % bannerImages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // 오른쪽 메뉴 (5초마다 변경)
  useEffect(() => {
    const interval = setInterval(() => {
      setMenuIndex((prev) => (prev + 1) % menuSets.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.homeLayout}>
      {/* 왼쪽 배너 */}
      <div className={styles.leftBanner}>
        {bannerImages.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`banner-${i}`}
            className={`${styles.bannerImage} ${
              i === bannerIndex ? styles.active : ""
            }`}
          />
        ))}
      </div>

      {/* 오른쪽 메뉴 */}
      <div className={styles.rightMenu}>
        {menuSets.map((group, idx) => (
          <div
            key={idx}
            className={`${styles.menuGroup} ${
              idx === menuIndex ? styles.active : ""
            }`}
          >
            {group.map((menu, i) => (
              <div key={i} className={styles.menuItem}>
                <img src={menu.src} alt={`menu-${i}`} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
