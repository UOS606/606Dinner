// StockStatus.jsx
import { useEffect, useState } from "react";
import { ingredients } from "../common/Info"; // 재고 항목 정보
import { isForTest } from "../../App";
import styles from "./StockStatus.module.css";

// 공통: JWT 헤더 생성
const getAuthHeaders = () => {
  const token = localStorage.getItem("token"); // ★ localStorage 키 이름
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const StockStatus = () => {
  const [quantities, setQuantities] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      if (isForTest) {
        const stored = JSON.parse(
          localStorage.getItem("test_ingredients") || "{}"
        );
        setQuantities(stored);
        setLastUpdate(new Date().toLocaleTimeString());
        return;
      }

      fetch("/api/ingredients", {
        headers: {
          ...getAuthHeaders(),
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          setQuantities(data || {});
          setLastUpdate(new Date().toLocaleTimeString());
        })
        .catch((err) => {
          console.error(err);
        });
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // 10초마다 갱신
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>실시간 재고 현황</h2>
      <ul className={styles.list}>
        {Object.keys(ingredients).map((item) => {
          const raw = quantities[item];
          const safeQty = typeof raw === "number" ? raw : 0;
          const displayQty = Math.round(safeQty * 10) / 10;

          return (
            <li key={item} className={styles.listItem}>
              <span className={styles.itemName}>{item}</span>
              <span className={styles.current}>
                {displayQty} {ingredients[item].unit}
              </span>
            </li>
          );
        })}
      </ul>
      <div className={styles.lastUpdate}>
        마지막 갱신: {lastUpdate || "로딩 중..."}
      </div>
    </div>
  );
};

export default StockStatus;
