export const DEFAULT_BANK_ACCOUNT_INFO = [
  "ธนาคาร: ไทยพาณิชย์ (SCB)",
  "ชื่อบัญชี: บริษัท ศรีนานาพร มาร์เก็ตติ้ง จำกัด(มหาชน)",
  "เลขที่บัญชี: 366-415149-5",
].join("\n");

export function resolveBankAccountInfo(bankAccountInfo?: string | null) {
  return (bankAccountInfo && bankAccountInfo.trim()) || DEFAULT_BANK_ACCOUNT_INFO;
}

export function parseBankAccountInfo(bankAccountInfo?: string | null) {
  const resolvedText = resolveBankAccountInfo(bankAccountInfo);
  const lines = resolvedText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const entries = lines.map((line) => {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) {
      return { label: "ข้อมูลบัญชี", value: line };
    }

    return {
      label: line.slice(0, separatorIndex).trim(),
      value: line.slice(separatorIndex + 1).trim(),
    };
  });

  const accountNumber =
    entries.find((entry) => /เลขที่บัญชี|account number/i.test(entry.label))?.value ?? null;

  return {
    resolvedText,
    entries,
    accountNumber,
  };
}