import React, { useState } from "react";
import OrderModal from "../modal/OrderModal";
import LoginModal from "../modal/LoginModal"; // 로그인 모달
import styles from "./Menu.module.css";

const menus = [
  { name: "Valentine", img: "/images/dinner/valentine/default.png" },
  { name: "French", img: "/images/dinner/french/default.png" },
  { name: "English", img: "/images/dinner/english/default.png" },
  {
    name: "Champagne Feast",
    img: "/images/dinner/champagne_feast/default.png",
  },
];

const Menu = ({ isLoggedIn, handleLoginSuccess }) => {
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginCallback, setLoginCallback] = useState(null);

  return (
    <main className={styles.container}>
      <div className={styles.titleWrapper}>
        <h2 className={styles.title}>Our Dinner</h2>
      </div>
      <div className={styles.grid}>
        {menus.map((menu, idx) => (
          <div
            key={idx}
            className={styles.card}
            onClick={() => setSelectedMenu(menu)}
          >
            <img src={menu.img} alt={menu.name} className={styles.image} />
            <h3 className={styles.name}>{menu.name}</h3>
          </div>
        ))}
      </div>

      {/* OrderModal에 onShowLogin 전달 */}
      {selectedMenu && (
        <OrderModal
          menu={selectedMenu}
          onClose={() => setSelectedMenu(null)}
          isLoggedIn={isLoggedIn} // 로그인 상태 테스트
          onShowLogin={(callback) => {
            setLoginCallback(() => callback); // 4번 케이스: 콜백 저장
            setShowLogin(true); // 로그인 모달 띄우기
          }}
        />
      )}

      {/* 로그인 모달 */}
      {showLogin && (
        <LoginModal
          onClose={() => {
            setShowLogin(false);
            setLoginCallback(null); // 모달 닫을 때 초기화
          }}
          onShowSignup={() => {}}
          onShowFindPassword={() => {}}
          onLoginSuccess={(callback) => {
            setShowLogin(false);
            handleLoginSuccess(loginCallback); // 🔹 App 상태 + callback 실행
            setLoginCallback(null);
          }}
        />
      )}
    </main>
  );
};

export default Menu;
