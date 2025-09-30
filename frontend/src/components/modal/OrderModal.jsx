import React, { useState } from "react";
import styles from "./OrderModal.module.css";

const menuItemsData = {
  Valentine: [
    { name: "와인", defaultQty: 1 },
    { name: "스테이크", defaultQty: 1 },
  ],
  French: [
    { name: "커피", defaultQty: 1 },
    { name: "와인", defaultQty: 1 },
    { name: "샐러드", defaultQty: 1 },
    { name: "스테이크", defaultQty: 1 },
  ],
  English: [
    { name: "에그 스크램블", defaultQty: 1 },
    { name: "베이컨", defaultQty: 1 },
    { name: "빵", defaultQty: 1 },
    { name: "스테이크", defaultQty: 1 },
  ],
  "Champagne Feast": [
    { name: "샴페인", defaultQty: 1 },
    { name: "와인", defaultQty: 1 },
    { name: "커피", defaultQty: 1 },
    { name: "바게트", defaultQty: 4 },
    { name: "스테이크", defaultQty: 2 },
  ],
};

const OrderModal = ({ menu, onClose, isLoggedIn, onShowLogin }) => {
  const stylesList = ["simple", "grand", "deluxe"];

  const [selectedStyle, setSelectedStyle] = useState("");

  const [quantities, setQuantities] = useState(
    menuItemsData[menu.name].reduce((acc, item) => {
      acc[item.name] = item.defaultQty;
      return acc;
    }, {})
  );

  const [wineUnit, setWineUnit] = useState(
    menu.name === "Champagne Feast" ? "병" : "잔"
  );
  const [champagneUnit, setChampagneUnit] = useState("병");
  const [coffeeUnit, setCoffeeUnit] = useState("잔");
  const [showAddons, setShowAddons] = useState(false);

  const allItems = Object.values(menuItemsData).flatMap((items) =>
    items.map((i) => i.name)
  );
  const uniqueItems = [...new Set(allItems)];
  const availableAddons = uniqueItems.filter(
    (item) => !quantities.hasOwnProperty(item)
  );

  const imgSrc = selectedStyle
    ? `/images/dinner/${menu.name
        .toLowerCase()
        .replace(/\s/g, "_")}/${selectedStyle}.png`
    : `/images/dinner/${menu.name
        .toLowerCase()
        .replace(/\s/g, "_")}/default.png`;

  const handleQtyChange = (item, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [item]: Math.max(0, prev[item] + delta),
    }));
  };

  const handleAddItem = (item) => {
    setQuantities((prev) => ({ ...prev, [item]: 1 }));
    if (item === "와인") setWineUnit("잔");
    if (item === "샴페인") setChampagneUnit("병");
    if (item === "커피") setCoffeeUnit("잔");
    setShowAddons(false);
  };

  // 주문/장바구니 공통 처리
  const handleOrderOrCart = async (action) => {
    if (!isLoggedIn) {
      onShowLogin(() => handleOrderOrCart(action));
      return;
    }

    const orderData = {
      menuName: menu.name,
      style: selectedStyle || "default",
      items: Object.entries(quantities).map(([name, qty]) => {
        let unit = "개";
        if (name === "와인") unit = wineUnit;
        if (name === "샴페인") unit = champagneUnit;
        if (name === "커피") unit = coffeeUnit;
        return { name, qty, unit };
      }),
      action, // "order" or "cart"
    };

    try {
      const token = localStorage.getItem("token"); // 로그인 토큰

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 인증 헤더
        },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "주문 처리 실패");
        return;
      }

      alert(
        `${action === "cart" ? "장바구니 담기" : "주문"} 성공!\n` +
          JSON.stringify(data, null, 2)
      );
      onClose(); // 모달 닫기
    } catch (err) {
      console.error(err);
      // console.log(orderData.items);
      alert("서버 오류 발생. 잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          ×
        </button>
        <h2 className={styles.title}>{menu.name}</h2>
        <img src={imgSrc} alt={menu.name} className={styles.image} />

        {/* 서빙 스타일 선택 */}
        <div className={styles.styleRow}>
          <span>서빙 스타일</span>
          <div className={styles.styleBtnWrapper}>
            {stylesList.map((style) => (
              <button
                key={style}
                className={`${styles.styleBtn} ${
                  selectedStyle === style ? styles.activeStyle : ""
                }`}
                onClick={() => setSelectedStyle(style)}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* 수량 및 단위 */}
        <div className={styles.quantitySection}>
          {Object.keys(quantities).map((item) => (
            <div key={item} className={styles.quantityRow}>
              <span className={styles.itemName}>{item}</span>
              <div className={styles.qtyControls}>
                {(item === "와인" || item === "샴페인" || item === "커피") && (
                  <div className={styles.unitSelect}>
                    {item === "와인" && (
                      <>
                        <button
                          className={`${styles.unitBtn} ${
                            wineUnit === "잔" ? styles.activeUnit : ""
                          }`}
                          onClick={() => setWineUnit("잔")}
                        >
                          잔
                        </button>
                        <button
                          className={`${styles.unitBtn} ${
                            wineUnit === "병" ? styles.activeUnit : ""
                          }`}
                          onClick={() => setWineUnit("병")}
                        >
                          병
                        </button>
                      </>
                    )}
                    {item === "샴페인" && (
                      <>
                        <button
                          className={`${styles.unitBtn} ${
                            champagneUnit === "잔" ? styles.activeUnit : ""
                          }`}
                          onClick={() => setChampagneUnit("잔")}
                        >
                          잔
                        </button>
                        <button
                          className={`${styles.unitBtn} ${
                            champagneUnit === "병" ? styles.activeUnit : ""
                          }`}
                          onClick={() => setChampagneUnit("병")}
                        >
                          병
                        </button>
                      </>
                    )}
                    {item === "커피" && (
                      <>
                        <button
                          className={`${styles.unitBtn} ${
                            coffeeUnit === "잔" ? styles.activeUnit : ""
                          }`}
                          onClick={() => setCoffeeUnit("잔")}
                        >
                          잔
                        </button>
                        <button
                          className={`${styles.unitBtn} ${
                            coffeeUnit === "포트" ? styles.activeUnit : ""
                          }`}
                          onClick={() => setCoffeeUnit("포트")}
                        >
                          포트
                        </button>
                      </>
                    )}
                  </div>
                )}

                <div className={styles.qtyWrapper}>
                  <button onClick={() => handleQtyChange(item, -1)}>-</button>
                  <span className={styles.qty}>{quantities[item]}</span>
                  <button onClick={() => handleQtyChange(item, 1)}>+</button>
                </div>
              </div>
            </div>
          ))}

          {/* 하단 버튼 */}
          <div className={styles.bottomBtns}>
            <button
              className={styles.addMenuBtn}
              onClick={() => setShowAddons((prev) => !prev)}
            >
              + 다른 디너의 메뉴 추가
            </button>
            <div className={styles.orderBtns}>
              <button onClick={() => handleOrderOrCart("cart")}>
                장바구니 담기
              </button>
              <button onClick={() => handleOrderOrCart("order")}>주문</button>
            </div>
          </div>

          {/* 추가 메뉴 */}
          {showAddons && availableAddons.length > 0 && (
            <div className={styles.addonList}>
              {availableAddons.map((addon) => (
                <button key={addon} onClick={() => handleAddItem(addon)}>
                  {addon}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
