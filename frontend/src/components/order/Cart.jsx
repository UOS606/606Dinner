import React, { useEffect, useState } from "react";
import common from "./OrderCommon.module.css";
import styles from "./Cart.module.css";
import { calculateTotalPrice } from "../common/Info";
import { isForTest } from "../../App";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const navigate = useNavigate();

  if (localStorage.getItem("username") === "admin") {
    navigate("/admin");
  }

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unusedCouponCount, setUnusedCouponCount] = useState(0);

  useEffect(() => {
    loadCart();
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    if (isForTest) {
      const testCoupons =
        JSON.parse(localStorage.getItem("test_coupons")) || [];
      const userId = localStorage.getItem("username");
      const myCoupon = testCoupons.find((c) => c.id === userId);
      if (myCoupon) {
        setUnusedCouponCount(myCoupon.unusedCouponCount); // 추가
      }
    } else {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/coupons", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUnusedCouponCount(data.unusedCouponCount);
      } catch (err) {
        console.error("쿠폰 불러오기 실패:", err);
      }
    }
  };

  const canApplyCoupon = (cartedTime) =>
    unusedCouponCount > 0 &&
    !cartItems.some((o) => o.couponApplied && o.cartedTime !== cartedTime);

  const handleCouponToggle = (cartedTime, apply) => {
    setCartItems((prev) =>
      prev.map((o) =>
        o.cartedTime === cartedTime ? { ...o, couponApplied: apply } : o
      )
    );

    setUnusedCouponCount((prev) => (apply ? prev - 1 : prev + 1));
  };
  // ---------------- 장바구니 데이터 로드 ----------------
  const loadCart = async () => {
    setLoading(true);
    setError("");

    if (isForTest) {
      // -------------- Test Code Start --------------
      const savedOrders = JSON.parse(
        localStorage.getItem("test_orders") || "[]"
      );
      const cartOnly = savedOrders
        .filter((order) => order.action === "carted")
        .sort((a, b) => new Date(b.cartedTime) - new Date(a.cartedTime));
      setCartItems(cartOnly);
      setLoading(false);
      // -------------- Test Code End --------------
    } else {
      // -------------- Post Code Start --------------

      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "장바구니 로드 실패");
          setLoading(false);
          return;
        }
        // action이 cart인 항목만 필터링
        const cartOnly = data
          .filter((order) => order.action === "carted")
          .sort((a, b) => new Date(b.cartedTime) - new Date(a.cartedTime));
        setCartItems(cartOnly);
        setLoading(false);
      } catch (err) {
        console.error("서버 오류:", err);
        setError("서버 오류 발생");
        setLoading(false);
      }
      // -------------- Post Code End --------------
    }
  };

  // ---------------- 삭제 함수 ----------------
  const handleDelete = async (userId, cartedTime) => {
    if (isForTest) {
      // -------------- Test Code Start --------------
      const savedOrders = JSON.parse(
        localStorage.getItem("test_orders") || "[]"
      );
      const newOrders = savedOrders.filter(
        (o) => !(o.id === userId && o.cartedTime === cartedTime)
      );
      localStorage.setItem("test_orders", JSON.stringify(newOrders));
      const updatedCart = newOrders
        .filter((order) => order.action === "carted")
        .sort((a, b) => new Date(b.cartedTime) - new Date(a.cartedTime));

      setCartItems(updatedCart);
      // -------------- Test Code End --------------
    } else {
      // -------------- Post Code Start --------------

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/orders`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: userId, cartedTime, action: "carted" }),
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.message || "삭제 실패");
          return;
        }
        setCartItems((prev) =>
          prev
            .filter((o) => !(o.id === userId && o.cartedTime === cartedTime))
            .sort((a, b) => new Date(b.cartedTime) - new Date(a.cartedTime))
        );
      } catch (err) {
        console.error("서버 삭제 오류:", err);
        alert("서버 삭제 오류 발생");
      }

      // -------------- Post Code End --------------
    }
  };

  // 주문하기 버튼
  const submitOrder = async () => {
    const usedCount = cartItems.filter((o) => o.couponApplied).length;
    const now = new Date().toISOString();
    const id = localStorage.getItem("username");
    let selectedAddress = "";

    const useOldAddress = window.confirm(
      "기본 주소를 배송지로 사용하시겠습니까?"
    );

    if (!useOldAddress) {
      // 새로운 배송지 입력받기
      selectedAddress = window.prompt("새 배송지를 입력해주세요:");
      if (!selectedAddress) {
        alert("배송지가 입력되지 않아 주문이 취소되었습니다.");
        return;
      }
    }

    if (isForTest) {
      // ---------------- Test 코드 ----------------
      const savedOrders = JSON.parse(
        localStorage.getItem("test_orders") || "[]"
      );

      const orderedCount = savedOrders.filter(
        (o) => o.action === "carted" && o.id === id
      ).length;

      const updatedOrders = savedOrders.map((o) => {
        const currentCartItem = cartItems.find(
          (item) => item.cartedTime === o.cartedTime && item.id === o.id
        );

        if (o.action === "carted" && currentCartItem) {
          return {
            ...o,
            action: "ordered",
            orderedTime: now,
            isCouponUsed: currentCartItem.couponApplied || false,
            address: useOldAddress ? o.address : selectedAddress,
          };
        }
        return o;
      });

      localStorage.setItem("test_orders", JSON.stringify(updatedOrders));

      const newCart = updatedOrders
        .filter((o) => o.action === "carted")
        .sort((a, b) => new Date(b.cartedTime) - new Date(a.cartedTime));
      setCartItems(newCart);

      const savedCoupons =
        JSON.parse(localStorage.getItem("test_coupons")) || [];
      const userId = localStorage.getItem("username");
      const updatedCoupons = savedCoupons.map((c) => {
        if (c.id === userId) {
          return {
            ...c,
            unusedCouponCount: c.unusedCouponCount - usedCount,
            usedCouponCount: (c.usedCouponCount || 0) + usedCount,
          };
        }
        return c;
      });
      localStorage.setItem("test_coupons", JSON.stringify(updatedCoupons));

      alert(
        `주문 완료! 쿠폰 ${usedCount}매 사용하여 ${orderedCount}개 메뉴가 결제됨 (${new Date(
          now
        ).toLocaleString()})`
      );

      window.location.reload();
    } else {
      // ---------------- Post 코드 ----------------

      try {
        const token = localStorage.getItem("token");

        const ordersToUpdate = cartItems.map((o) => ({
          cartedTime: o.cartedTime,
          isCouponUsed: o.couponApplied || false,
          address: useOldAddress ? o.address : selectedAddress,
        }));

        const res = await fetch("/api/orders", {
          method: "PUT", // 또는 PATCH
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: "ordered",
            orderedTime: now,
            orders: ordersToUpdate,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.message || "주문 처리 실패");
          return;
        }

        if (usedCount > 0) {
          await fetch("/api/coupons", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              action: "use",
              usedCount, // unusedCouponCount -= usedCount
              // usedCouponCount += usedCount
            }),
          });
        }

        alert(`주문 완료! 쿠폰 ${usedCount}매 사용되었습니다.`);

        window.location.reload();
      } catch (err) {
        console.error(err);
        alert("서버 오류 발생. 잠시 후 다시 시도해주세요.");
      }
    }
  };

  // ---------------- Cart 총합 계산 ----------------
  const totalCartPrice = cartItems.reduce((sum, order) => {
    const units = {
      wineUnit: order.items.find((i) => i.name === "와인")?.unit || "잔",
      champagneUnit: order.items.find((i) => i.name === "샴페인")?.unit || "병",
      coffeeUnit: order.items.find((i) => i.name === "커피")?.unit || "잔",
    };
    const orderPrice = calculateTotalPrice(
      order.items.reduce((acc, i) => {
        acc[i.name] = i.qty;
        return acc;
      }, {}),
      order.style,
      units
    );
    return (
      sum + (order.couponApplied ? Math.round(orderPrice * 0.7) : orderPrice)
    );
  }, 0);

  if (loading) return <p className={styles.loading}>로딩 중...</p>;
  if (error) return <p className={styles.error}>오류: {error}</p>;

  return (
    <main className={`${common.container} ${styles.container || ""}`}>
      <h2 className={`${common.title} ${styles.title || ""}`}>장바구니</h2>

      {cartItems.length === 0 ? (
        <p className={styles.empty}>장바구니가 비어 있습니다.</p>
      ) : (
        <>
          <div className={styles.cartList}>
            {cartItems.map((order) => {
              const units = {
                wineUnit:
                  order.items.find((i) => i.name === "와인")?.unit || "잔",
                champagneUnit:
                  order.items.find((i) => i.name === "샴페인")?.unit || "병",
                coffeeUnit:
                  order.items.find((i) => i.name === "커피")?.unit || "잔",
              };

              const discountedPrice = order.couponApplied
                ? Math.round(
                    calculateTotalPrice(
                      order.items.reduce((acc, i) => {
                        acc[i.name] = i.qty;
                        return acc;
                      }, {}),
                      order.style,
                      units
                    ) * 0.7
                  )
                : calculateTotalPrice(
                    order.items.reduce((acc, i) => {
                      acc[i.name] = i.qty;
                      return acc;
                    }, {}),
                    order.style,
                    units
                  );

              return (
                <div key={order.id} className={styles.cartItem}>
                  <h3>
                    <span className={styles.styleLabel}>
                      {order.style.charAt(0).toUpperCase() +
                        order.style.slice(1)}
                    </span>{" "}
                    {order.menuName}
                  </h3>

                  <img
                    className={styles.cartImage}
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

                  <p className={styles.totalPrice}>
                    가격: {discountedPrice.toLocaleString()}원
                  </p>

                  {order.couponApplied ? (
                    <button
                      className={styles.couponBtn}
                      onClick={() =>
                        handleCouponToggle(order.cartedTime, false)
                      }
                    >
                      쿠폰 해제
                    </button>
                  ) : canApplyCoupon(order.cartedTime) ? (
                    <button
                      className={styles.couponBtn}
                      onClick={() => handleCouponToggle(order.cartedTime, true)}
                    >
                      쿠폰 적용
                    </button>
                  ) : null}

                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(order.id, order.cartedTime)}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          <div className={styles.orderBottom}>
            <span className={styles.totalCartPrice}>
              총 가격: {totalCartPrice.toLocaleString()}원
            </span>
            <button className={styles.placeOrderBtn} onClick={submitOrder}>
              주문하기
            </button>
          </div>
        </>
      )}
    </main>
  );
};

export default Cart;
