// src/components/menu/Menu.jsx
import React from "react";
import styles from "./Menu.module.css";

const menus = [
  {
    name: "Valentine",
    img: "/images/dinner/valentine/default.png",
  },
  {
    name: "French",
    img: "/images/dinner/french/default.png",
  },
  {
    name: "English",
    img: "/images/dinner/english/default.png",
  },
  {
    name: "Champagne Feast",
    img: "/images/dinner/champagne_feast/default.png",
  },
];

const Menu = () => {
  return (
    <main className={styles.container}>
      <h2 className={styles.title}>Our Dinner</h2>
      <div className={styles.grid}>
        {menus.map((menu, idx) => (
          <div key={idx} className={styles.card}>
            <img src={menu.img} alt={menu.name} className={styles.image} />
            <h3 className={styles.name}>{menu.name}</h3>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Menu;
