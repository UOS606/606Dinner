import React from "react";
import common from "./OrderCommon.module.css";
import styles from "./Cart.module.css"; // Cart 전용 스타일 (없으면 생략 가능)

const Cart = () => {
  return (
    <main className={`${common.container} ${styles.container || ""}`}>
      <h2 className={`${common.title} ${styles.title || ""}`}>
        장바구니 페이지 (준비중)
      </h2>
    </main>
  );
};

export default Cart;
