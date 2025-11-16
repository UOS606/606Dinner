// AdminDashboard.jsx
import StockStatus from "./InventoryStatus";
import OrderForm from "./IngredientsOrder";
import styles from "../../styles/AdminDashboard.module.css";
import Assign from "./StaffAssignment";

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
