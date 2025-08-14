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


const Admin = () => {

  return (
    <div className="admin">
      <Sidebar />
      <div className="admin-content">
        <Routes>
          <Route path="/addproduct" element={<AddProduct />} />
          <Route path="/listproduct" element={<ListProduct />} />
          <Route path="/OrderList" element={<OrderList />} />
          <Route path="/DeliveryManagement" element={<DeliveryManagement />} />
          <Route path="/categorymanagement" element={<CategoryManagement />} />
          <Route path="/shopimagemanagement" element={<ShopImageManagement />} />
          <Route path="/collectionsmanagement" element={<CollectionsManagement />} />
        </Routes>
      </div>
    </div>
  );
};

export default Admin;
