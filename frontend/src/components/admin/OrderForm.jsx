import { useState, useEffect } from "react";
import { ingredients, defaultStock } from "../common/Info";
import { isForTest } from "../../App";
import styles from "./OrderForm.module.css";

const OrderForm = () => {
  const [orderType, setOrderType] = useState("regular"); // regular / urgent / immediate
  const [quantities, setQuantities] = useState({});

  // 탭 변경 시 기본값 세팅
  useEffect(() => {
    if (orderType === "regular") {
      setQuantities({ ...defaultStock });
    } else {
      const emptyStock = {};
      Object.keys(ingredients).forEach((key) => (emptyStock[key] = 0));
      setQuantities(emptyStock);
    }
  }, [orderType]);

  const handleChange = (key, value) => {
    setQuantities((prev) => ({ ...prev, [key]: Number(value) }));
  };

  const handleOrder = () => {
    const hasInput = Object.values(quantities).some((val) => val > 0);
    if (!hasInput) {
      alert("수량을 입력해주세요.");
      return;
    }

    if (isForTest) {
      //  테스트 모드: localStorage 누적
      const stored = JSON.parse(
        localStorage.getItem("test_ingredients") || "{}"
      );
      const updatedStock = { ...stored };
      Object.keys(quantities).forEach((key) => {
        updatedStock[key] = (updatedStock[key] || 0) + quantities[key];
      });
      localStorage.setItem("test_ingredients", JSON.stringify(updatedStock));
      alert(
        orderType === "immediate"
          ? "구매 사항이 반영되었습니다. (다음 갱신 때 자동 반영)"
          : "주문이 완료되었습니다. (다음 갱신 때 자동 반영)"
      );
    } else {
      //  실제 모드: 백엔드로 전송
      fetch("/api/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderType, quantities, action: "add" }),
      })
        .then((res) => res.json())
        .then(() => {
          alert(
            orderType === "immediate"
              ? "구매 사항이 반영되었습니다. (다음 갱신 때 자동 반영)"
              : "주문이 등록되었습니다. (다음날 오후 세 시 반영)"
          );
        })
        .catch((err) => console.error(err));
    }

    // 입력 초기화
    if (orderType === "regular") {
      setQuantities({ ...defaultStock });
    } else {
      const reset = {};
      Object.keys(ingredients).forEach((key) => (reset[key] = 0));
      setQuantities(reset);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>재고 관리</h2>

      <div className={styles.typeSelector}>
        <button
          className={orderType === "regular" ? styles.activeBtn : ""}
          onClick={() => setOrderType("regular")}
        >
          정기 주문
        </button>
        <button
          className={orderType === "urgent" ? styles.activeBtn : ""}
          onClick={() => setOrderType("urgent")}
        >
          긴급 주문
        </button>
        <button
          className={orderType === "immediate" ? styles.activeBtn : ""}
          onClick={() => setOrderType("immediate")}
        >
          즉시 반영
        </button>
      </div>

      <div className={styles.inputList}>
        {Object.keys(ingredients).map((key) => (
          <div key={key} className={styles.inputRow}>
            <span className={styles.itemName}>{key}</span>
            <input
              type="number"
              min="0"
              value={quantities[key] || 0}
              onChange={(e) => handleChange(key, e.target.value)}
            />
            <span className={styles.unit}>{ingredients[key].unit}</span>
          </div>
        ))}
      </div>

      <button
        className={`${styles.actionBtn} ${
          orderType === "immediate" ? styles.apply : styles.order
        }`}
        onClick={handleOrder}
      >
        {orderType === "immediate" ? "구매 사항 적용" : "주문하기"}
      </button>
    </div>
  );
};

export default OrderForm;
