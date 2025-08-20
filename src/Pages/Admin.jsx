import React from "react";
import "./CSS/Admin.css";
import Sidebar from "../Components/Sidebar/Sidebar";
import AddProduct from "../Components/AddProduct/AddProduct";
import { Route, Routes } from "react-router-dom";
import ListProduct from "../Components/ListProduct/ListProduct";
import OrderList from "../Components/OrderList/OrderList";
import DeliveryManagement from "../Components/DeliveryManagement/DeliveryManagement";
import CategoryManagement from "../Components/CategoryManagement/CategoryManagement";
import ShopImageManagement from "../Components/ShopImageManagement/ShopImageManagement";
import CollectionsManagement from "../Components/CollectionsManagement/CollectionsManagement";
// New Advanced Components
import Analytics from "../Components/Analytics/Analytics";
import InventoryManagement from "../Components/InventoryManagement/InventoryManagement";
import EmailNotifications from "../Components/EmailNotifications/EmailNotifications";
import AdminSettings from "../Components/AdminSettings/AdminSettings";


const Admin = ({ mobileOpen, onMobileClose }) => {

  return (
    <div className="admin">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={onMobileClose} />
      <div className="admin-content">
        <Routes>
          <Route path="/addproduct" element={<AddProduct />} />
          <Route path="/listproduct" element={<ListProduct />} />
          <Route path="/OrderList" element={<OrderList />} />
          <Route path="/DeliveryManagement" element={<DeliveryManagement />} />
          <Route path="/categorymanagement" element={<CategoryManagement />} />
          <Route path="/shopimagemanagement" element={<ShopImageManagement />} />
          <Route path="/collectionsmanagement" element={<CollectionsManagement />} />
          {/* New Advanced Features Routes */}
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/inventory" element={<InventoryManagement />} />
          <Route path="/email-notifications" element={<EmailNotifications />} />
          <Route path="/settings" element={<AdminSettings />} />
        </Routes>
      </div>
    </div>
  );
};

export default Admin;
