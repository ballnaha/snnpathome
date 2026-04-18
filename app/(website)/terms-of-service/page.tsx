import React from "react";
import { Box, Container, Typography, Stack, Breadcrumbs, Divider } from "@mui/material";
import Link from "next/link";
import { ArrowRight2, DocumentText } from "iconsax-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "เงื่อนไขการใช้บริการ | SNNP At Home",
  description: "เงื่อนไขและข้อตกลงในการใช้บริการเว็บไซต์ SNNP At Home",
};

export default function TermsOfServicePage() {
  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Hero Section */}
      <Box sx={{ bgcolor: "#eee", py: { xs: 6, md: 8 }, textAlign: "center" }}>
        <Container maxWidth="md">
          <Stack direction="row" alignItems="center" justifyContent="center" gap={1.5} mb={2}>
            <DocumentText size="32" color="#d71414" variant="Bold" />
            <Typography variant="h3" fontWeight="900" sx={{ color: "#333", fontSize: { xs: "1.8rem", md: "2.5rem" } }}>
              เงื่อนไขการใช้บริการ
            </Typography>
          </Stack>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
            ข้อตกลงและเงื่อนไขมาตรฐานสำหรับการเข้าใช้งานและซื้อสินค้าผ่านแพลตฟอร์มของเรา
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
        <Breadcrumbs
          separator={<ArrowRight2 size="14" color="#999" />}
          sx={{ mb: 4 }}
        >
          <Link href="/" style={{ color: "inherit", textDecoration: "none", fontSize: "0.85rem" }}>
            หน้าแรก
          </Link>
          <Typography color="text.primary" sx={{ fontSize: "0.85rem", fontWeight: 700 }}>
            เงื่อนไขการใช้บริการ
          </Typography>
        </Breadcrumbs>

        <Box
          sx={{
            bgcolor: "white",
            p: { xs: 3, md: 6 },
            borderRadius: 4,
            border: "1px solid",
            borderColor: "grey.200",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
          }}
        >
          <Stack spacing={4}>
            <section>
              <Typography variant="h6" fontWeight={900} gutterBottom sx={{ color: "primary.main" }}>
                1. การยอมรับข้อกำหนด
              </Typography>
              <Typography color="text.secondary" paragraph>
                การเข้าถึงและการใช้งานเว็บไซต์ SNNP At Home ถือว่าคุณยอมรับที่จะผูกพันตามเงื่อนไขการใช้บริการเหล่านี้ หากคุณไม่ยอมรับเงื่อนไขเหล่านี้ โปรดหยุดใช้งานเว็บไซต์ทันที
              </Typography>
            </section>

            <Divider />

            <section>
              <Typography variant="h6" fontWeight={900} gutterBottom sx={{ color: "primary.main" }}>
                2. บัญชีผู้ใช้งาน
              </Typography>
              <Typography color="text.secondary" paragraph>
                คุณต้องรักษาความปลอดภัยของชื่อผู้ใช้และรหัสผ่านของคุณเอง และต้องรับผิดชอบต่อกิจกรรมทั้งหมดที่เกิดขึ้นภายใต้บัญชีของคุณ เราขอสงวนสิทธิ์ในการระงับบัญชีหากพบการใช้งานที่ละเมิดข้อตกลง
              </Typography>
            </section>

            <Divider />

            <section>
              <Typography variant="h6" fontWeight={900} gutterBottom sx={{ color: "primary.main" }}>
                3. การสั่งซื้อและการชำระเงิน
              </Typography>
              <Typography color="text.secondary" paragraph>
                ราคาสินค้าที่ปรากฏเป็นราคาที่รวมภาษีมูลค่าเพิ่มแล้ว (ถ้ามี) การสั่งซื้อจะถือว่าสมบูรณ์เมื่อมีการชำระเงินและตรวจสอบหลักฐานการชำระเงินเรียบร้อยแล้วเท่านั้น
              </Typography>
            </section>

            <Divider />

            <section>
              <Typography variant="h6" fontWeight={900} gutterBottom sx={{ color: "primary.main" }}>
                4. การจัดส่งและนโยบายการคืนสินค้า
              </Typography>
              <Typography color="text.secondary" paragraph>
                เราดำเนินการจัดส่งสินค้าตามระยเวลาที่กำหนดในแต่ละรายการ การเปลี่ยนหรือคืนสินค้าสามารถทำได้ภายใน 7 วันหลังจากได้รับสินค้า เฉพาะกรณีที่สินค้าชำรุดจากการผลิตหรือส่งผิดเท่านั้น
              </Typography>
            </section>

            <Divider />

            <section>
              <Typography variant="h6" fontWeight={900} gutterBottom sx={{ color: "primary.main" }}>
                5. ทรัพย์สินทางปัญญา
              </Typography>
              <Typography color="text.secondary" paragraph>
                เนื้อหาทั้งหมดบนเว็บไซต์นี้ รวมถึงโลโก้ รูปภาพสินค้า และข้อความ เป็นทรัพย์สินของบริษัท ศรีนานาพร มาร์เก็ตติ้ง จำกัด (มหาชน) ห้ามนำไปใช้งานเพื่อการค้าโดยไม่ได้รับอนุญาต
              </Typography>
            </section>

            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Typography variant="caption" color="text.disabled">
                อัปเดตล่าสุดเมื่อวันที่ 18 เมษายน 2569
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
