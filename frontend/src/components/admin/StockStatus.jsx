// StockStatus.jsx
import { useEffect, useState } from "react";
import { ingredients } from "../common/Info"; // 재고 항목 정보
import { isForTest } from "../../App";
import styles from "./StockStatus.module.css";

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
      } else {
        fetch("/api/ingredients")
          .then((res) => res.json())
          .then((data) => setQuantities(data))
          .catch((err) => console.error(err));
      }
      setLastUpdate(new Date().toLocaleTimeString());
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // 10초마다 갱신
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>실시간 재고 현황</h2>
      <ul className={styles.list}>
        {Object.keys(ingredients).map((item) => (
          <li key={item} className={styles.listItem}>
            <span className={styles.itemName}>{item}</span>
            <span className={styles.current}>
              {Math.round(quantities[item] * 10) / 10 ?? 0}{" "}
              {ingredients[item].unit}
            </span>
          </li>
        ))}
      </ul>
      <div className={styles.lastUpdate}>
        마지막 갱신: {lastUpdate || "로딩 중..."}
      </div>
    </div>
  );
};

export default StockStatus;
