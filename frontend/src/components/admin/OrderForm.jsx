// src/components/admin/OrderForm.jsx
import { useState, useEffect } from "react";
import { ingredients, defaultStock } from "../common/Info";
import { isForTest } from "../../App";
import styles from "./OrderForm.module.css";

const OrderForm = () => {
  const [quantities, setQuantities] = useState({});
  const [orders, setOrders] = useState([]); // 항상 배열로 유지

  // 공통: Authorization 헤더 생성
  const getAuthHeaders = (withJson = false) => {
    const token = localStorage.getItem("token");
    const headers = {};
    if (withJson) headers["Content-Type"] = "application/json";
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  // 주문 내역 로딩
  useEffect(() => {
    const loadOrders = async () => {
      if (isForTest) {
        const storedOrders = JSON.parse(
          localStorage.getItem("test_ingredients_orders") || "[]"
        );
        setOrders(Array.isArray(storedOrders) ? storedOrders : []);
        return;
      }

      try {
        const res = await fetch("/api/fetch/ingredients_orders", {
          method: "GET",
          headers: getAuthHeaders(false),
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("loadOrders error:", err);
        setOrders([]); // 안전하게 초기화
      }
    };

    loadOrders();
  }, []);

  // 입력 변경
  const handleChange = (key, value) => {
    setQuantities((prev) => ({ ...prev, [key]: Number(value) }));
  };

  // 주문하기
  const handleOrder = async () => {
    const hasInput = Object.values(quantities).some((val) => val > 0);
    if (!hasInput) {
      alert("수량을 입력해주세요.");
      return;
    }

    const itemsPayload = Object.keys(ingredients).map((key) => ({
      item: key,
      quantity: quantities[key] || 0,
    }));

    if (isForTest) {
      const newOrder = {
        orderItems: itemsPayload, // 테스트 모드는 기존 key 유지
        state: "ordered",
        orderDate: new Date().toISOString(),
      };

      const storedOrders = JSON.parse(
        localStorage.getItem("test_ingredients_orders") || "[]"
      );
      const updated = [...storedOrders, newOrder];
      localStorage.setItem(
        "test_ingredients_orders",
        JSON.stringify(updated)
      );
      setOrders(updated);
      alert("주문이 완료되었습니다.");
    } else {
      // 실제 백엔드는 IngredientOrder 엔티티와 맞추기 위해 items 사용
      const newOrder = {
        items: itemsPayload,
        state: "ordered",
        orderDate: new Date().toISOString(),
      };

      try {
        const res = await fetch("/api/fetch/ingredients_orders", {
          method: "POST",
          headers: getAuthHeaders(true),
          body: JSON.stringify(newOrder),
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const saved = await res.json(); // 서버에서 저장된 주문 반환한다고 가정
        setOrders((prev) => [...prev, saved]);
        alert("주문이 완료되었습니다.");
      } catch (err) {
        console.error("handleOrder error:", err);
        alert("주문 요청에 실패했습니다. 다시 시도해주세요.");
      }
    }

    // 입력값 초기화
    setQuantities({ ...defaultStock });
  };

  // 재고 반영 버튼
  const handleApplyStock = async (order) => {
    if (isForTest) {
      // ===== TEST 모드: 로컬스토리지 사용 =====

      // 1) 주문 상태 변경
      const updatedOrders = (orders || []).map((o) =>
        o === order ? { ...o, state: "applied" } : o
      );
      localStorage.setItem(
        "test_ingredients_orders",
        JSON.stringify(updatedOrders)
      );
      setOrders(updatedOrders);

      // 2) 재고 반영
      const updatedStock = JSON.parse(
        localStorage.getItem("test_ingredients") || "{}"
      );
      const orderItems = order.orderItems || order.items || [];
      orderItems.forEach((item) => {
        if (item.quantity > 0) {
          updatedStock[item.item] =
            (updatedStock[item.item] || 0) + item.quantity;
        }
      });
      localStorage.setItem("test_ingredients", JSON.stringify(updatedStock));

      window.location.reload();
      return;
    }

    // ===== 실제 백엔드 처리 =====
    // 재고 증가는 백엔드 IngredientOrderService.apply() 에서만 수행하도록 함

    // 1) 서버에 주문 상태를 applied 로 변경 요청
    const updatedOrder = { ...order, state: "applied" };

    try {
      const res = await fetch("/api/fetch/ingredients_orders", {
        method: "PUT",
        headers: getAuthHeaders(true),
        body: JSON.stringify(updatedOrder),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      // 프론트 상태에서도 applied 반영
      setOrders((prev) =>
        (prev || []).map((o) =>
          o.id === order.id ? { ...o, state: "applied" } : o
        )
      );

      alert("재고가 반영되었습니다.");
      // 좌측 "실시간 재고 현황" 즉시 갱신
      window.location.reload();
    } catch (err) {
      console.error("applyOrderState error:", err);
      alert("재고 반영에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 화면 렌더링
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

      {/* "ordered" 상태만 표시 */}
      <div className={styles.orderItemsList}>
        {(orders || [])
          .filter((order) => order.state === "ordered")
          .sort(
            (a, b) =>
              new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
          )
          .map((order) => {
            const orderItems = (order.items || order.orderItems || []).filter(
              (item) => item.quantity > 0
            );

            return (
              <div
                key={order.id ?? order.orderDate}
                className={styles.orderItemRow}
              >
                <div>
                  <strong>
                    {order.orderDate
                      ? new Date(order.orderDate).toLocaleString()
                      : ""}
                  </strong>
                </div>
                <div>
                  {orderItems.map((item, idx) => (
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
            );
          })}
      </div>
    </div>
  );
};

export default OrderForm;
