import React, { useEffect, useState } from "react";
import common from "../../styles/OrderCommon.module.css";
import styles from "../../styles/OrderHistory.module.css";
import { calculateTotalPrice } from "../../utils/Info";
import { isForTest } from "../../App";
import { useNavigate } from "react-router-dom";

const OrderHistory = () => {
  const navigate = useNavigate();

  if (localStorage.getItem("username") === "admin") {
    navigate("/admin");
  }

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  // ---------------- 주문 내역 로드 ----------------
  const loadOrders = async () => {
    setLoading(true);
    setError("");

    if (isForTest) {
      // ----------  TEST CODE ----------
      const savedOrders = JSON.parse(
        localStorage.getItem("test_orders") || "[]"
      );
      const historyOrders = savedOrders.filter(
        (order) => order.action !== "carted"
      );

      const sortedOrders = historyOrders.sort((a, b) => {
        const aOrdered = new Date(a.orderedTime || 0).getTime();
        const bOrdered = new Date(b.orderedTime || 0).getTime();
        const aCarted = new Date(a.cartedTime || 0).getTime();
        const bCarted = new Date(b.cartedTime || 0).getTime();

        // orderedTime이 있으면 그것으로 비교, 같으면 cartedTime으로 비교
        if (bOrdered !== aOrdered) return bOrdered - aOrdered;
        return bCarted - aCarted;
      });

      setOrders(sortedOrders);
      setLoading(false);
      // ---------- END TEST CODE ----------
    } else {
      // ----------  POST CODE ----------

      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/orders/history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "주문 내역 로드 실패");
          setLoading(false);
          return;
        }
        const historyOrders = data.filter((order) => order.action !== "carted");

        const sortedOrders = historyOrders.sort((a, b) => {
          const aOrdered = new Date(a.orderedTime || 0).getTime();
          const bOrdered = new Date(b.orderedTime || 0).getTime();
          const aCarted = new Date(a.cartedTime || 0).getTime();
          const bCarted = new Date(b.cartedTime || 0).getTime();

          if (bOrdered !== aOrdered) return bOrdered - aOrdered;
          return bCarted - aCarted;
        });

        setOrders(sortedOrders);
        setLoading(false);
      } catch (err) {
        console.error("서버 오류:", err);
        setError("서버 오류 발생");
        setLoading(false);
      }
    }
  };

  // ---------------- 재주문 버튼 ----------------
  const handleReorder = async (order) => {
    if (isForTest) {
      // ----------  TEST CODE ----------
      const savedOrders = JSON.parse(
        localStorage.getItem("test_orders") || "[]"
      );
      const newOrder = {
        ...order,
        action: "carted",
        cartedTime: new Date().toISOString(),
        orderedTime: null,
        cookedTime: null,
        deliveredTime: null,
      };
      savedOrders.push(newOrder);
      localStorage.setItem("test_orders", JSON.stringify(savedOrders));
      alert("동일한 메뉴가 장바구니에 담겼습니다!");
      // ---------- END TEST CODE ----------
    } else {
      // ----------  POST CODE ----------

      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...order,
            action: "carted",
            cartedTime: new Date().toISOString(),
            orderedTime: null,
            cookedTime: null,
            deliveredTime: null,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.message || "재주문 실패");
          return;
        }
        alert("재주문이 장바구니에 추가되었습니다!");
      } catch (err) {
        console.error("서버 오류:", err);
        alert("서버 오류 발생. 잠시 후 다시 시도해주세요.");
      }
    }
  };

  const getStatusText = (action) => {
    switch (action) {
      case "ordered": // orderedTime
        return "주문 접수";
      case "cooking": // 조리 직원 배정 시
        return "조리 중";
      case "cooked": // cookedTime
        return "조리 완료";
      case "delivering": // 배달 직원 배정 시
        return "배달 중";
      case "delivered": // deliveredTime
        return "배달 완료";
      default:
        return "확인 중";
    }
  };

  if (loading) return <p className={styles.loading}>로딩 중...</p>;
  if (error) return <p className={styles.error}>오류: {error}</p>;

  return (
    <main className={`${common.container} ${styles.container || ""}`}>
      <h2 className={`${common.title} ${styles.title || ""}`}>주문 내역</h2>

      {orders.length === 0 ? (
        <p className={styles.empty}>주문 내역이 없습니다.</p>
      ) : (
        <div className={styles.orderList}>
          {orders.map((order, idx) => {
            const units = {
              wineUnit:
                order.items.find((i) => i.name === "와인")?.unit || "잔",
              champagneUnit:
                order.items.find((i) => i.name === "샴페인")?.unit || "병",
              coffeeUnit:
                order.items.find((i) => i.name === "커피")?.unit || "잔",
            };

            const totalPrice = calculateTotalPrice(
              order.items.reduce((acc, i) => {
                acc[i.name] = i.qty;
                return acc;
              }, {}),
              order.style,
              units
            );

            const discountedPrice = order.isCouponUsed
              ? Math.round(totalPrice * 0.7)
              : totalPrice;

            return (
              <div key={idx} className={styles.orderItem}>
                <h3>
                  <span className={styles.styleLabel}>
                    {order.style.charAt(0).toUpperCase() + order.style.slice(1)}
                  </span>{" "}
                  {order.menuName}
                </h3>

                <img
                  className={styles.orderImage}
                  src={`/images/dinner/${order.menuName
                    .toLowerCase()
                    .replace(/\s/g, "_")}/${(
                    order.style || "default"
                  ).toLowerCase()}.png`}
                  alt={order.menuName}
                />

                <ul>
                  {order.items.map((item, i) => (
                    <li key={i}>
                      {item.name} - {item.qty}
                      {item.unit}
                    </li>
                  ))}
                </ul>

                <p className={styles.price}>
                  가격: {discountedPrice.toLocaleString()}원{" "}
                  {order.isCouponUsed && (
                    <span className={styles.couponLabel}>쿠폰 적용</span>
                  )}
                </p>

                <div className={styles.timeInfo}>
                  <p>
                    주문 접수:{" "}
                    {order.orderedTime
                      ? new Date(order.orderedTime).toLocaleString("ko-KR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </p>
                  <p>
                    조리 완료:{" "}
                    {order.cookedTime
                      ? new Date(order.cookedTime).toLocaleString("ko-KR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </p>
                  <p>
                    배달 완료:{" "}
                    {order.deliveredTime
                      ? new Date(order.deliveredTime).toLocaleString("ko-KR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </p>
                </div>

                <p className={styles.address}>
                  배달 주소: {order.address || "주소 정보 없음"}
                </p>

                <p className={styles.status}>
                  상태: <strong>{getStatusText(order.action)}</strong>
                </p>

                {order.action === "delivered" && (
                  <button
                    className={styles.reorderBtn}
                    onClick={() => handleReorder(order)}
                  >
                    재주문
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default OrderHistory;
