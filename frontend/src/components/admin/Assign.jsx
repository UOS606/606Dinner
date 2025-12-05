import { useState, useEffect } from "react";
import styles from "./Assign.module.css";
import { isForTest } from "../../App";
import { staff as initialStaff, unitConversion } from "../common/Info";

const Assign = () => {
  const [orders, setOrders] = useState([]);
  const [staff, setStaff] = useState({ ...initialStaff });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();

    if (isForTest) {
      const savedStaff = JSON.parse(
        localStorage.getItem("test_staffs") || "{}"
      );
      if (savedStaff.cook && savedStaff.delivery) setStaff(savedStaff);
    } else {
      const loadStaff = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch("/api/staffs", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await res.json();
          // 응답 형식이 이상하면 초기값으로
          if (
            data &&
            Array.isArray(data.cook) &&
            Array.isArray(data.delivery)
          ) {
            setStaff(data);
          } else {
            setStaff({ ...initialStaff });
          }
        } catch (err) {
          console.error("loadStaff API error:", err);
        }
      };
      loadStaff();
    }

    const intervalId = setInterval(() => {
      loadOrders();
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const loadOrders = async () => {
    setLoading(true);

    if (isForTest) {
      const savedOrders = JSON.parse(
        localStorage.getItem("test_orders") || "[]"
      );
      const historyOrders = savedOrders
        .filter((o) => o.action !== "carted" && o.action !== "delivered")
        .sort(
          (a, b) => new Date(b.orderedTime || 0) - new Date(a.orderedTime || 0)
        );
      setOrders(historyOrders);
      setLoading(false);
    } else {
      try {
        const token = localStorage.getItem("token");
        // ★ 백엔드 컨트롤러: GET /api/admin/orders/all
        const res = await fetch("/api/admin/orders/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        const historyOrders = data
          // carted, delivered 는 어드민 화면에서 제외
          .filter((o) => o.action !== "carted" && o.action !== "delivered")
          .sort(
            (a, b) =>
              new Date(b.orderedTime || 0) - new Date(a.orderedTime || 0)
          );

        setOrders(historyOrders);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
  };

  // 백엔드에 넘길 cartedTime 문자열을 Instant.parse 가능하게 변환
  const toApiCartedTime = (cartedTime) => {
    if (!cartedTime) return null;
    if (typeof cartedTime === "string") {
      // LocalDateTime("2025-11-30T03:40:00") 형태면 Z 붙여서 Instant 로 파싱 가능하게
      return cartedTime.endsWith("Z") ? cartedTime : `${cartedTime}Z`;
    }
    return cartedTime;
  };

  const assignStaff = async (userId, cartedTime, type, staffName) => {
    // 1) 프론트 상태 먼저 반영
    const newStaff = { ...staff };
    newStaff[type] = newStaff[type].map(([name, info]) =>
      name === staffName ? [name, { userId, cartedTime }] : [name, info]
    );
    setStaff(newStaff);

    const updatedOrders = orders.map((o) => {
      if (o.id === userId && o.cartedTime === cartedTime) {
        return { ...o, action: type === "cook" ? "cooking" : "delivering" };
      }
      return o;
    });
    setOrders(updatedOrders);

    if (isForTest) {
      localStorage.setItem("test_staffs", JSON.stringify(newStaff));
      localStorage.setItem("test_orders", JSON.stringify(updatedOrders));
    } else {
      try {
        const token = localStorage.getItem("token");
        const apiCartedTime = toApiCartedTime(cartedTime);

        // 직원 배정
        await fetch(`/api/staffs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId, cartedTime, type, staffName }),
        });

        // 주문 상태 업데이트 (조리 배정 / 배달 배정)
        await fetch(`/api/admin/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId,
            cartedTime: apiCartedTime,
            action: type === "cook" ? "cooking" : "delivering",
          }),
        });
      } catch (err) {
        console.error("assignStaff API error:", err);
      }
    }
  };

  const markComplete = async (userId, cartedTime, type) => {
    // 1) 프론트 상태 먼저 반영
    const updatedOrders = orders.map((o) => {
      if (o.id === userId && o.cartedTime === cartedTime) {
        const now = new Date().toISOString();
        if (type === "cook") return { ...o, cookedTime: now, action: "cooked" };
        if (type === "delivery")
          return { ...o, deliveredTime: now, action: "delivered" };
      }
      return o;
    });
    setOrders(updatedOrders);

    const newStaff = { ...staff };
    newStaff[type] = newStaff[type].map(([name, info]) =>
      info.userId === userId && info.cartedTime === cartedTime
        ? [name, { userId: null, cartedTime: null }]
        : [name, info]
    );
    setStaff(newStaff);

    const cookedOrder = updatedOrders.find(
      (o) => o.id === userId && o.cartedTime === cartedTime
    );

    if (isForTest) {
      localStorage.setItem("test_staffs", JSON.stringify(newStaff));
      localStorage.setItem("test_orders", JSON.stringify(updatedOrders));

      const testIngredients = JSON.parse(
        localStorage.getItem("test_ingredients") || "{}"
      );

      if (cookedOrder && type === "cook") {
        cookedOrder.items.forEach((item) => {
          const conversion = unitConversion[item.unit] || 1;
          const qtyToSubtract = item.qty * conversion;
          if (testIngredients[item.name] != null) {
            testIngredients[item.name] -= qtyToSubtract;
            if (testIngredients[item.name] < 0) testIngredients[item.name] = 0;
          }
        });
        localStorage.setItem(
          "test_ingredients",
          JSON.stringify(testIngredients)
        );
      }

      if (type === "delivery") {
        const coupons = JSON.parse(
          localStorage.getItem("test_coupons") || "[]"
        );
        const target = coupons.find((c) => c.id === userId);
        if (target) {
          target.deliveredOrderCount += 1;
          // 5의 배수일 때 쿠폰 지급
          if (target.deliveredOrderCount % 5 === 0) {
            target.unusedCouponCount += 1;
          }
        }
        localStorage.setItem("test_coupons", JSON.stringify(coupons));
      }
    } else {
      try {
        const token = localStorage.getItem("token");
        const apiCartedTime = toApiCartedTime(cartedTime);

        // 직원 해제
        await fetch(`/api/staffs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId, cartedTime, type, unassign: true }),
        });

        // 주문 상태 업데이트 (조리 완료 / 배달 완료)
        await fetch(`/api/admin/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId,
            cartedTime: apiCartedTime,
            action: type === "cook" ? "cooked" : "delivered",
          }),
        });

        // 재고 차감
        if (cookedOrder && type === "cook") {
          const itemsToSubtract = cookedOrder.items.map((item) => ({
            name: item.name,
            qty: item.qty * (unitConversion[item.unit] || 1),
          }));
          await fetch(`/api/ingredients`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              action: "subtract",
              items: itemsToSubtract,
            }),
          });
        }

        // 쿠폰 지급
        if (type === "delivery") {
          await fetch(`/api/coupons`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              id: userId,
              action: "add",
              deliveredOrderCount: 1,
            }),
          });
        }
      } catch (err) {
        console.error("markComplete API error:", err);
      }
    }
  };

  const availableStaff = (type) => {
    if (Array.isArray(staff[type])) {
      return staff[type].filter(([_, info]) => !info.userId);
    }
    return [];
  };

  const getStatusText = (action) => {
    switch (action) {
      case "ordered":
        return "주문 접수";
      case "cooking":
        return "조리 중";
      case "cooked":
        return "조리 완료";
      case "delivering":
        return "배달 중";
      case "delivered":
        return "배달 완료";
      default:
        return "확인 중";
    }
  };

  if (loading) return <p>로딩 중...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.staffSection}>
        <div className={styles.staffColumn}>
          <h3>조리 배정 대기</h3>
          <div className={styles.staffList}>
            {availableStaff("cook").map(([name]) => (
              <span key={name} className={styles.staffCard}>
                {name}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.staffColumn}>
          <h3>배달 배정 대기</h3>
          <div className={styles.staffList}>
            {availableStaff("delivery").map(([name]) => (
              <span key={name} className={styles.staffCard}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.orderList}>
        {orders.map((order, idx) => (
          <div key={idx} className={styles.orderItem}>
            <img
              className={styles.orderImage}
              src={`/images/dinner/${order.menuName
                .toLowerCase()
                .replace(/\s/g, "_")}/${(
                order.style || "default"
              ).toLowerCase()}.png`}
              alt={order.menuName}
            />
            <div className={styles.orderDetails}>
              <h3>
                {order.style.charAt(0).toUpperCase()}
                {order.style.slice(1)} {order.menuName}
              </h3>
              <ul>
                {order.items.map((i, ii) => (
                  <li key={ii}>
                    {i.name} - {i.qty} {i.unit}
                  </li>
                ))}
              </ul>
              <p>
                배달 요청 날짜:{" "}
                {order.deliveryDate
                  ? order.deliveryDate
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
              <p>주소: {order.address || "-"}</p>
              <p className={styles.status}>
                상태: {getStatusText(order.action)}{" "}
                {order.action === "cooking" &&
                  staff.cook
                    .filter(
                      ([_, info]) =>
                        info.userId === order.id &&
                        info.cartedTime === order.cartedTime
                    )
                    .map(([name]) => `(${name})`)}
                {order.action === "delivering" &&
                  staff.delivery
                    .filter(
                      ([_, info]) =>
                        info.userId === order.id &&
                        info.cartedTime === order.cartedTime
                    )
                    .map(([name]) => `(${name})`)}
              </p>

              {order.action === "ordered" &&
                availableStaff("cook").map(([name]) => (
                  <button
                    key={name}
                    className={styles.assignBtn}
                    onClick={() =>
                      assignStaff(order.id, order.cartedTime, "cook", name)
                    }
                  >
                    {name}
                  </button>
                ))}

              {order.action === "cooking" &&
                staff.cook.some(
                  ([_, info]) =>
                    info.userId === order.id &&
                    info.cartedTime === order.cartedTime
                ) && (
                  <button
                    className={styles.assignBtn}
                    onClick={() =>
                      markComplete(order.id, order.cartedTime, "cook")
                    }
                  >
                    조리 완료
                  </button>
                )}

              {order.action === "cooked" &&
                availableStaff("delivery").map(([name]) => (
                  <button
                    key={name}
                    className={styles.assignBtn}
                    onClick={() =>
                      assignStaff(order.id, order.cartedTime, "delivery", name)
                    }
                  >
                    {name}
                  </button>
                ))}

              {order.action === "delivering" &&
                staff.delivery.some(
                  ([_, info]) =>
                    info.userId === order.id &&
                    info.cartedTime === order.cartedTime
                ) && (
                  <button
                    className={styles.assignBtn}
                    onClick={() =>
                      markComplete(order.id, order.cartedTime, "delivery")
                    }
                  >
                    배달 완료
                  </button>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Assign;
