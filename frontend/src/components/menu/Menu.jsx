import React, { useState } from "react";
import OrderModal from "../modal/OrderModal";
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

const Menu = () => {
  const [selectedMenu, setSelectedMenu] = useState(null);

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

      {selectedMenu && (
        <OrderModal menu={selectedMenu} onClose={() => setSelectedMenu(null)} />
      )}
    </main>
  );
};

export default Menu;
