import { Route, Routes } from 'react-router-dom'
import { OrdersPage, OrderDetailsPage } from '@/features/orders'
import { CustomersPage, CustomerDetailsPage } from '@/features/customers'
import {
  InventoryPage,
  ProductHistoryPage,
  SkuHistoryPage,
  BarcodeHistoryPage,
  AdviceDetailsPage,
} from '@/features/inventory'
import { MtoPage, MtoOrdersPage, MtoOrderDetailsPage, MtoItemDetailsPage } from '@/features/mto'
import { CartPage } from '@/features/cart'
import { HomePage } from '@/features/home'
import { WarehousePage } from '@/features/warehouse'
import { PopDashboardPage, PopPage, PopCustomerPage, PopRedemptionPage } from '@/features/pop'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/products" element={<HomePage />} />
      <Route path="/customers" element={<CustomersPage />} />
      <Route path="/customers/:customerId" element={<CustomerDetailsPage />} />
      <Route path="/mto" element={<MtoPage />} />
      <Route path="/mto/orders" element={<MtoOrdersPage />} />
      <Route path="/mto/orders/:orderId" element={<MtoOrderDetailsPage />} />
      <Route path="/mto/orders/:orderId/items/:itemId" element={<MtoItemDetailsPage />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/inventory/advices/:adviceId" element={<AdviceDetailsPage />} />
      <Route path="/inventory/history" element={<SkuHistoryPage />} />
      <Route path="/inventory/history/barcode" element={<BarcodeHistoryPage />} />
      <Route path="/inventory/history/barcode/*" element={<BarcodeHistoryPage />} />
      <Route path="/inventory/:itemId/history" element={<ProductHistoryPage />} />
      <Route path="/warehouse" element={<WarehousePage />} />
      <Route path="/pop" element={<PopPage />} />
      <Route path="/pop/home" element={<PopPage />} />
      <Route path="/pop/enroll" element={<PopPage />} />
      <Route path="/pop/dashboard" element={<PopDashboardPage />} />
      <Route path="/pop/lookup" element={<PopCustomerPage />} />
      <Route path="/pop/redeem/:planId" element={<PopRedemptionPage />} />
    </Routes>
  )
}
