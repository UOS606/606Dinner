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
          const data = await res.json(); // 서버에서 { cook: [...], delivery: [...] } 형태로 전달받는다고 가정
          setStaff(data);
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
        .filter((o) => o.action !== "carted")
        .sort(
          (a, b) => new Date(b.orderedTime || 0) - new Date(a.orderedTime || 0)
        );
      setOrders(historyOrders);
      setLoading(false);
    } else {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const historyOrders = data
          .filter((o) => o.action !== "carted")
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

  const assignStaff = async (userId, cartedTime, type, staffName) => {
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

    // test 모드이면 localStorage 저장
    if (isForTest) {
      localStorage.setItem("test_staffs", JSON.stringify(newStaff));
      localStorage.setItem("test_orders", JSON.stringify(updatedOrders));
    } else {
      try {
        const token = localStorage.getItem("token");

        // 직원 배정 + orders 상태 업데이트
        await fetch(`/api/staffs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId, cartedTime, type, staffName }),
        });

        await fetch(`/api/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId,
            cartedTime,
            action: type === "cook" ? "cooking" : "delivering",
          }),
        });
      } catch (err) {
        console.error("assignStaff API error:", err);
      }
    }
  };

  const markComplete = async (userId, cartedTime, type) => {
    // orders 상태 업데이트
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

        // 직원 해제 + orders 상태 업데이트
        await fetch(`/api/staffs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId, cartedTime, type, unassign: true }),
        });

        await fetch(`/api/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId,
            cartedTime,
            action: type === "cook" ? "cooked" : "delivered",
          }),
        });

        if (cookedOrder && type === "cook") {
          const itemsToSubtract = cookedOrder.items.map((item) => ({
            name: item.name,
            qty: item.qty * (unitConversion[item.unit] || 1), // 단위 변환 적용
          }));
          await fetch(`/api/ingredients`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              action: "subtract",
              items: itemsToSubtract, // [{name, qty}, ...]
            }),
          });
        }

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
              /* TODO
              서버에서 deliveredOrderCount += 1 처리,
              그 후 deliveredOrderCount % 5 == 0 이라면 
              쿠폰 1매 발급 (unusedCouponCount += 1)
              */
            }),
          });
        }
      } catch (err) {
        console.error("markComplete API error:", err);
      }
    }
  };

  const availableStaff = (type) =>
    staff[type].filter(([_, info]) => !info.userId);

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
              <p>고객 이름: {order.name}</p>
              <p>고객 아이디: {order.id}</p>
              <p>
                주문 접수:{" "}
                {new Date(order.orderedTime).toLocaleString("ko-KR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
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
