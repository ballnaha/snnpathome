import React from "react";
import { Box, Container, Typography, Stack, Breadcrumbs, Divider } from "@mui/material";
import Link from "next/link";
import { ArrowRight2, ShieldTick } from "iconsax-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "นโยบายความเป็นส่วนตัว | SNNP At Home",
  description: "นโยบายความเป็นส่วนตัวสำหรับการใช้งานเว็บไซต์ SNNP At Home",
};

export default function PrivacyPolicyPage() {
  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Hero Section */}
      <Box sx={{ bgcolor: "#eee", py: { xs: 6, md: 8 }, textAlign: "center" }}>
        <Container maxWidth="md">
          <Stack direction="row" alignItems="center" justifyContent="center" gap={1.5} mb={2}>
            <ShieldTick size="32" color="#d71414" variant="Bold" />
            <Typography variant="h3" fontWeight="900" sx={{ color: "#333", fontSize: { xs: "1.8rem", md: "2.5rem" } }}>
              นโยบายความเป็นส่วนตัว
            </Typography>
          </Stack>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
            ข้อมูลของคุณคือความสำคัญอันดับหนึ่งของเรา เรามุ่งมั่นในการดูแลรักษาข้อมูลส่วนบุคคลของคุณอย่างดีที่สุด
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
            นโยบายความเป็นส่วนตัว
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
                1. ข้อมูลที่เราเก็บรวบรวม
              </Typography>
              <Typography color="text.secondary" paragraph>
                เราเก็บรวบรวมข้อมูลส่วนบุคคลที่คุณให้ไว้โดยตรงเมื่อลงทะเบียนบัญชี สั่งซื้อสินค้า หรือติดต่อเรา ข้อมูลเหล่านี้รวมชื่อ-นามสกุล, ที่อยู่จัดส่ง, เบอร์โทรศัพท์, อีเมล และข้อมูลการชำระเงิน
              </Typography>
            </section>

            <Divider />

            <section>
              <Typography variant="h6" fontWeight={900} gutterBottom sx={{ color: "primary.main" }}>
                2. การใช้ข้อมูลของคุณ
              </Typography>
              <Typography color="text.secondary" paragraph>
                เราใช้ข้อมูลที่รวบรวมเพื่อ:
              </Typography>
              <Typography component="ul" color="text.secondary" sx={{ pl: 2 }}>
                <li>ดำเนินการตามคำสั่งซื้อและจัดส่งสินค้า</li>
                <li>แจ้งข้อมูลข่าวสารและโปรโมชั่นของเครือ SNNP (หากคุณยินยอม)</li>
                <li>ปรับปรุงการทำงานของเว็บไซต์และประสบการณ์การใช้งาน</li>
                <li>รักษาความปลอดภัยและป้องกันการฉ้อโกง</li>
              </Typography>
            </section>

            <Divider />

            <section>
              <Typography variant="h6" fontWeight={900} gutterBottom sx={{ color: "primary.main" }}>
                3. การแบ่งปันข้อมูลกับบุคคลที่สาม
              </Typography>
              <Typography color="text.secondary" paragraph>
                เราจะไม่ขายข้อมูลส่วนบุคคลของคุณให้แก่บุคคลที่สาม เราจะแบ่งปันข้อมูลเฉพาะที่จำเป็นให้แก่คู่ค้าที่จะช่วยดำเนินการตามคำสั่งซื้อ เช่น บริษัทขนส่ง หรือผู้ให้บริการระบบชำระเงิน เท่านั้น
              </Typography>
            </section>

            <Divider />

            <section>
              <Typography variant="h6" fontWeight={900} gutterBottom sx={{ color: "primary.main" }}>
                4. สิทธิของเจ้าของข้อมูล
              </Typography>
              <Typography color="text.secondary" paragraph>
                คุณมีสิทธิในการเข้าถึง แก้ไข หรือขอลบข้อมูลส่วนตัวของคุณจากระบบของเราได้ทุกเมื่อ โดยสามารถดำเนินการผ่านหน้าโปรไฟล์ของคุณหรือติดต่อฝ่ายสนับสนุนลูกค้าของเรา
              </Typography>
            </section>

            <Divider />

            <section>
              <Typography variant="h6" fontWeight={900} gutterBottom sx={{ color: "primary.main" }}>
                5. ติดต่อเรา
              </Typography>
              <Typography color="text.secondary">
                หากมีข้อสงสัยเกี่ยวกับนโยบายความเป็นส่วนตัวนี้ โปรดติดต่อเราผ่านช่องทาง LINE Official ของบริษัท หรือที่อยู่ตามที่ปรากฏในหน้า "เกี่ยวกับเรา"
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
