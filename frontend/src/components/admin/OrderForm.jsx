import { useState, useEffect } from "react";
import { ingredients, defaultStock } from "../common/Info";
import { isForTest } from "../../App";
import styles from "./OrderForm.module.css";

const OrderForm = () => {
  const [quantities, setQuantities] = useState({}); // 수량
  const [orders, setOrders] = useState([]); // 주문 내역

  // 주문 내역 가져오기 (useEffect)
  useEffect(() => {
    const loadOrders = () => {
      if (isForTest) {
        const storedOrders = JSON.parse(
          localStorage.getItem("test_ingredients_orders") || "[]"
        );
        setOrders(storedOrders);
      } else {
        // 실제 API로 주문 내역 가져오기
        fetch("/api/fetch/ingredients_orders")
          .then((res) => res.json())
          .then((data) => {
            // data가 배열인지 확인하고, 아니면 빈 배열로 설정
            setOrders(Array.isArray(data) ? data : []);
          })
          .catch((err) => console.error(err));
      }
    };

    loadOrders();
  }, []); // 컴포넌트가 마운트될 때만 실행

  // 주문 입력 처리
  const handleChange = (key, value) => {
    setQuantities((prev) => ({ ...prev, [key]: Number(value) }));
  };

  // 주문 처리
  const handleOrder = () => {
    const hasInput = Object.values(quantities).some((val) => val > 0);
    if (!hasInput) {
      alert("수량을 입력해주세요.");
      return;
    }

    const newOrder = {
      orderItems: Object.keys(ingredients).map((key) => ({
        item: key,
        quantity: quantities[key] || 0,
      })),
      state: "ordered",
      orderDate: new Date(), // 날짜를 읽기 쉬운 형식으로
    };

    // 주문 내역 저장
    if (isForTest) {
      const storedOrders = JSON.parse(
        localStorage.getItem("test_ingredients_orders") || "[]"
      );
      storedOrders.push(newOrder);
      setOrders(storedOrders); // 상태 업데이트
      localStorage.setItem(
        "test_ingredients_orders",
        JSON.stringify(storedOrders)
      );
    } else {
      fetch("/api/fetch/ingredients_orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      })
        .then((res) => res.json())
        .then(() => {
          setOrders((prevOrders) => [...prevOrders, newOrder]);
          alert("주문이 완료되었습니다.");
        })
        .catch((err) => console.error(err));
    }

    setQuantities({ ...defaultStock }); // 수량 초기화
  };

  // 재고 반영 처리
  const handleApplyStock = (order) => {
    if (isForTest) {
      // 상태를 applied로 변경
      const updatedOrders = orders.map((o) =>
        o === order ? { ...o, state: "applied" } : o
      );

      // localStorage에 업데이트된 주문 내역 저장
      localStorage.setItem(
        "test_ingredients_orders",
        JSON.stringify(updatedOrders)
      );
      setOrders(updatedOrders); // 상태 업데이트

      // 재고 반영
      const updatedStock = JSON.parse(
        localStorage.getItem("test_ingredients") || "{}"
      );
      order.orderItems.forEach((item) => {
        updatedStock[item.item] =
          (updatedStock[item.item] || 0) + item.quantity;
      });
      localStorage.setItem("test_ingredients", JSON.stringify(updatedStock));

      // 페이지 새로고침
    } else {
      fetch("/api/fetch/ingredients_orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...order, state: "applied" }),
      })
        .then((res) => res.json())
        .then(() => {
          // 주문 상태 업데이트
          setOrders((prevOrders) =>
            prevOrders.map((o) =>
              o === order ? { ...o, state: "applied" } : o
            )
          );

          // 재고 반영
          fetch("/api/fetch/ingredients", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: order.orderItems, action: "add" }),
          });

          // 페이지 새로고침
        })
        .catch((err) => console.error(err));
    }
    window.location.reload();
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>재고 관리</h2>

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

      <button className={styles.actionBtn} onClick={handleOrder}>
        주문하기
      </button>

      {/* "applied" 상태는 아예 렌더링하지 않음 */}
      <div className={styles.orderItemsList}>
        {Array.isArray(orders) &&
          orders
            .filter((order) => order.state === "ordered") // "ordered" 상태인 것만 렌더링
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)) // orderDate 기준 내림차순 정렬
            .map((order, index) => (
              <div key={index} className={styles.orderItemRow}>
                <div>
                  <strong>{new Date(order.orderDate).toLocaleString()}</strong>
                </div>
                <div>
                  {order.orderItems
                    .filter((item) => item.quantity > 0) // 수량이 0인 항목은 제외
                    .map((item, idx) => (
                      <div key={idx}>
                        {item.item}: {item.quantity}
                      </div>
                    ))}
                </div>
                <button
                  className={styles.applyBtn}
                  onClick={() => handleApplyStock(order)}
                >
                  재고 반영
                </button>
              </div>
            ))}
      </div>
    </div>
  );
};

export default OrderForm;
