// AdminDashboard.jsx
import StockStatus from "./StockStatus";
import OrderForm from "./OrderForm";
import styles from "./AdminDashboard.module.css";
import Assign from "./Assign";

const AdminDashboard = () => {
  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.leftPanel}>
        <StockStatus /> {/* 실시간 재고 현황 - 20% */}
        <OrderForm /> {/* 주문 양식 - 30% */}
      </div>

      <div className={styles.rightPanel}>
        <Assign />
      </div>
    </div>
  );
};

export default AdminDashboard;
