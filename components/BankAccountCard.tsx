"use client";

import React from "react";
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { Copy } from "iconsax-react";
import { useSnackbar } from "@/components/SnackbarProvider";
import { parseBankAccountInfo } from "@/lib/bank-account-info";

export default function BankAccountCard({
  bankAccountInfo,
  amount,
  title = "โอนเงินมาที่",
  subtitle,
}: {
  bankAccountInfo?: string | null;
  amount?: number | null;
  title?: string;
  subtitle?: string;
}) {
  const { showSnackbar } = useSnackbar();
  const { entries, accountNumber, resolvedText } = parseBankAccountInfo(bankAccountInfo);

  const handleCopyAccountNumber = async () => {
    if (!accountNumber) {
      showSnackbar("ไม่พบเลขบัญชีสำหรับคัดลอก", "error");
      return;
    }

    try {
      await navigator.clipboard.writeText(accountNumber);
      showSnackbar("คัดลอกเลขบัญชีแล้ว", "success");
    } catch {
      showSnackbar("ไม่สามารถคัดลอกเลขบัญชีได้", "error");
    }
  };

  return (
    <Box
      sx={{
        border: "1px solid rgba(215,20,20,0.14)",
        borderRadius: 3,
        p: { xs: 2, md: 2.5 },
        bgcolor: "rgba(255,255,255,0.82)",
      }}
    >
      <Stack spacing={2}>
        <Box>
          <Typography fontWeight={900} color="primary.main">
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>

        <Stack spacing={1.25}>
          {entries.length > 0 ? (
            entries.map((entry, index) => {
              const isAccountNumber = /เลขที่บัญชี|account number/i.test(entry.label);
              const hideLabelOnMobile = !isAccountNumber;

              return (
                <Stack
                  key={`${entry.label}-${index}`}
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: isAccountNumber ? "center" : "flex-start" }}
                  gap={0.75}
                  sx={{
                    py: 0.75,
                    borderBottom: index < entries.length - 1 || amount != null ? "1px solid" : "none",
                    borderColor: "rgba(0,0,0,0.06)",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      minWidth: { sm: 120 },
                      flexShrink: 0,
                      display: { xs: hideLabelOnMobile ? "none" : "block", sm: "block" },
                    }}
                  >
                    {entry.label}
                  </Typography>
                  {isAccountNumber ? (
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={0.5}
                      sx={{ width: { xs: "100%", sm: "auto" } }}
                    >
                      <Typography
                        variant="body1"
                        fontWeight={900}
                        color="primary.main"
                        sx={{
                          letterSpacing: 0.6,
                          fontFamily: '"Roboto Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
                          fontSize: { xs: "1rem", sm: "1.05rem" },
                          lineHeight: 1.2,
                        }}
                      >
                        {entry.value}
                      </Typography>
                      <Tooltip title="คัดลอกเลขบัญชี">
                        <IconButton
                          size="small"
                          onClick={() => void handleCopyAccountNumber()}
                          sx={{ color: "primary.main", ml: 0.25 }}
                        >
                          <Copy size="16" color="currentColor" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  ) : (
                    <Typography
                      variant="body2"
                      fontWeight={isAccountNumber ? 900 : 800}
                      sx={{
                        textAlign: { sm: "right" },
                        whiteSpace: "pre-line",
                        color: hideLabelOnMobile ? "text.primary" : undefined,
                      }}
                    >
                      {entry.value}
                    </Typography>
                  )}
                </Stack>
              );
            })
          ) : (
            <Typography variant="body2" sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
              {resolvedText}
            </Typography>
          )}

          {amount != null ? (
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ pt: 0.75 }}
            >
              <Typography variant="body2" color="text.secondary">
                จำนวนเงิน
              </Typography>
              <Chip
                label={`฿${amount.toLocaleString()}`}
                size="small"
                sx={{
                  height: 28,
                  fontWeight: 900,
                  bgcolor: "rgba(215,20,20,0.08)",
                  color: "primary.main",
                  borderRadius: 999,
                }}
              />
            </Stack>
          ) : null}
        </Stack>
      </Stack>
    </Box>
  );
}