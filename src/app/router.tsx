import { Navigate, Route, Routes } from 'react-router-dom'
import { OrdersPage, OrderDetailsPage } from '@/features/orders'
import {
  InventoryPage,
  ProductHistoryPage,
  SkuHistoryPage,
  BarcodeHistoryPage,
} from '@/features/inventory'
import { MtoPage, MtoOrdersPage, MtoOrderDetailsPage } from '@/features/mto'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/orders" replace />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
      <Route path="/mto" element={<MtoPage />} />
      <Route path="/mto/orders" element={<MtoOrdersPage />} />
      <Route path="/mto/orders/:orderId" element={<MtoOrderDetailsPage />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/inventory/history" element={<SkuHistoryPage />} />
      <Route path="/inventory/history/barcode" element={<BarcodeHistoryPage />} />
      <Route path="/inventory/history/barcode/*" element={<BarcodeHistoryPage />} />
      <Route path="/inventory/:itemId/history" element={<ProductHistoryPage />} />
    </Routes>
  )
}
