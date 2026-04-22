import React, { forwardRef } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Stack, Divider } from "@mui/material";
import { ShoppingCart, Clock, Location } from "iconsax-react";
import QRCode from "react-qr-code";
import Barcode from "react-barcode";

type OrderStatus = "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface AdminOrderItem {
  id: string;
  productName: string;
  productImage: string | null;
  productSku: string | null;
  price: number;
  quantity: number;
}

interface AdminOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  total: number;
  shippingCost: number;
  shippingMethodName: string | null;
  firstName: string;
  lastName: string;
  address: string;
  subdistrict: string;
  district: string;
  province: string;
  postcode: string;
  phone: string;
  email: string | null;
  slipUrl: string | null;
  createdAt: string;
  updatedAt: string;
  items: AdminOrderItem[];
}

interface OrderPrintTemplateProps {
  order: AdminOrder;
  siteSettings: any;
}

function formatMoney(value: number) {
  return `฿${value.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const OrderPrintTemplate = forwardRef<HTMLDivElement, OrderPrintTemplateProps>(({ order, siteSettings }, ref) => {
  return (
    <div style={{ display: "none" }}>
      <div
        ref={ref}
        style={{
          padding: "40px",
          fontFamily: "'Sarabun', 'Inter', sans-serif",
          color: "#333",
          background: "white",
          width: "210mm", // A4 width
          minHeight: "297mm", // A4 height
          boxSizing: "border-box",
        }}
      >
        <Box sx={{ mb: 2, pb: 1.5, borderBottom: "1px solid #eee", position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Box
              component="img"
              src="/images/logo.png"
              alt="SNNP Logo"
              sx={{
                height: 35,
                width: "auto",
                objectFit: "contain",
                filter: "brightness(0)"
              }}
              onError={(e: any) => {
                e.target.style.display = "none";
              }}
            />
          </Box>

          <Box sx={{ position: "absolute", left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
            <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#333", letterSpacing: "1px" }}>ใบสั่งซื้อสินค้า</Typography>
            <Typography sx={{ fontSize: "10px", fontWeight: 500, color: "#666", letterSpacing: "2px" }}>PURCHASE ORDER</Typography>
          </Box>

          <Box sx={{ textAlign: "right", maxWidth: "45%" }}>
            <Typography sx={{ fontSize: "9px", color: "#333", mt: 0.25, whiteSpace: "pre-line", lineHeight: 1.4, fontWeight: 500 }}>
              {siteSettings?.companyAddress || "บริษัท ศรีนานาพร มาร์เก็ตติ้ง จำกัด (มหาชน)\n99/99 ม.7 ตำบลอ้อมน้อย\nอำเภอกระทุ่มแบน จังหวัดสมุทรสาคร 74130\nโทรศัพท์: 089-306-4444"}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={3} mb={2.5} sx={{ bgcolor: "#fafafa", px: 2, py: 1.25, borderRadius: 2, border: "1px solid #f0f0f0" }}>
          <Box flex={1} display="flex" alignItems="center">
            <ShoppingCart size="16" color="#555" variant="Bold" style={{ marginRight: 8 }} />
            <Typography sx={{ color: "#555", fontWeight: 500, fontSize: "13px", mr: 1 }}>เลขที่ใบสั่งซื้อ :</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: "13px", color: "#111" }}>{order.orderNumber}</Typography>
          </Box>
          <Box flex={1} display="flex" alignItems="center">
            <Clock size="16" color="#555" variant="Bold" style={{ marginRight: 8 }} />
            <Typography sx={{ color: "#555", fontWeight: 500, fontSize: "13px", mr: 1 }}>วันที่สั่งซื้อ :</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: "13px", color: "#111" }}>{formatDateTime(order.createdAt)}</Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={4} mb={5}>
          <Box flex={1}>
            <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
              <Location size="18" color="#222" variant="Bold" />
              <Typography sx={{ color: "#222", fontWeight: 600, fontSize: "14px" }}>ผู้ส่ง</Typography>
            </Stack>
            <Box sx={{ ml: "26px", fontSize: "13px", lineHeight: 1.8, color: "#444" }}>
              <Typography sx={{ fontSize: "13px", whiteSpace: "pre-line", fontWeight: 500, color: "#222" }}>
                {siteSettings?.companyAddress || "บริษัท ศรีนานาพร มาร์เก็ตติ้ง จำกัด (มหาชน)\n99/99 ม.7\nตำบล อ้อมน้อย อำเภอ กระทุ่มแบน จังหวัด สมุทรสาคร\n74130\nโทรศัพท์: 089-306-4444"}
              </Typography>
            </Box>
          </Box>
          <Box flex={1}>
            <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
              <Location size="18" color="#222" variant="Bold" />
              <Typography sx={{ color: "#222", fontWeight: 600, fontSize: "14px" }}>ผู้รับ</Typography>
            </Stack>
            <Box sx={{ ml: "26px", fontSize: "13px", lineHeight: 1.8, color: "#444" }}>
              <Typography sx={{ fontWeight: 600, fontSize: "14px", color: "#222", textTransform: "uppercase" }}>
                {order.firstName} {order.lastName}
              </Typography>
              <Typography sx={{ fontSize: "13px" }}>{order.address}</Typography>
              <Typography sx={{ fontSize: "13px" }}>
                ตำบล {order.subdistrict} อำเภอ {order.district} จังหวัด {order.province}
              </Typography>
              <Typography sx={{ fontSize: "13px" }}>{order.postcode}</Typography>
              <Typography sx={{ fontSize: "13px", mt: 1 }}>
                <span style={{ textDecoration: "underline" }}>โทรศัพท์:</span> {order.phone}
              </Typography>
            </Box>
          </Box>
        </Stack>

        <Typography sx={{ fontWeight: 600, fontSize: "15px", mb: 2, color: "#555" }}>รายการสินค้า</Typography>

        <Table sx={{ mb: 4, "& .MuiTableCell-root": { borderColor: "#eee", py: 1.5, px: 1 } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontSize: "13px", color: "#555", width: "5%" }}>#</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: "13px", color: "#555", width: "45%" }}>สินค้า</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: "13px", color: "#555", align: "center", width: "10%" }}>จำนวน</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: "13px", color: "#555", align: "center", width: "15%" }}>ราคาต่อชิ้น</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: "13px", color: "#555", align: "center", width: "15%" }}>ยอดรวม</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: "13px", color: "#d32f2f", align: "center", width: "10%" }}>หมายเหตุ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {order.items.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell sx={{ fontSize: "13px", color: "#444" }}>{index + 1}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={2} alignItems="center">
                    {item.productImage ? (
                      <Box
                        component="img"
                        src={item.productImage}
                        alt={item.productName}
                        sx={{ width: 40, height: 40, objectFit: "contain", borderRadius: 1 }}
                        onError={(e: any) => {
                          e.target.onerror = null;
                          e.target.src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
                        }}
                      />
                    ) : (
                      <Box sx={{ width: 40, height: 40, bgcolor: "#f5f5f5", borderRadius: 1 }} />
                    )}
                    <Box>
                      <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#444" }}>{item.productName}</Typography>
                      {item.productSku && (
                        <Typography sx={{ fontSize: "12px", color: "#777" }}>รหัสสินค้า : {item.productSku}</Typography>
                      )}
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell align="center" sx={{ fontSize: "13px", color: "#444" }}>{item.quantity}</TableCell>
                <TableCell align="center" sx={{ fontSize: "13px", color: "#444" }}>{formatMoney(item.price)}</TableCell>
                <TableCell align="center" sx={{ fontSize: "13px", color: "#444" }}>{formatMoney(item.price * item.quantity)}</TableCell>
                <TableCell align="center" sx={{ fontSize: "13px", color: "#d32f2f" }}>-</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ pt: 2 }}>
            <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
              <QRCode value={order.orderNumber} size={100} level="M" />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center", transform: "scale(0.9)", transformOrigin: "top center" }}>
              <Barcode value={order.orderNumber} format="CODE128" width={2} height={50} displayValue={true} fontSize={14} margin={0} />
            </Box>
          </Box>
          <Box sx={{ minWidth: "250px" }}>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#555" }}>รวมค่าสินค้า:</Typography>
                <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#444" }}>{formatMoney(order.subtotal)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#555" }}>ค่าจัดส่ง:</Typography>
                <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#444" }}>{formatMoney(order.shippingCost)}</Typography>
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#555" }}>ส่วนลด:</Typography>
                <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#444" }}>{formatMoney(order.discount)}</Typography>
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#d32f2f" }}>จำนวนเงิน :</Typography>
                <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#d32f2f" }}>{formatMoney(order.total)}</Typography>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </div>
    </div>
  );
});

OrderPrintTemplate.displayName = "OrderPrintTemplate";
