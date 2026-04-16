"use client";

import React, { useTransition } from "react";
import {
  Stack,
  TextField,
  InputAdornment,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { SearchNormal1 } from "iconsax-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface AllProductsControlsProps {
  defaultSearch?: string;
  defaultSort?: string;
}

export default function AllProductsControls({
  defaultSearch = "",
  defaultSort = "latest",
}: AllProductsControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [searchInput, setSearchInput] = React.useState(defaultSearch);

  // Sync searchInput when URL search param changes (e.g. brand switch clears search)
  React.useEffect(() => {
    setSearchInput(searchParams.get("search") ?? "");
  }, [searchParams]);

  // Derive sort value from live URL so dropdown always reflects current state
  const currentSort = searchParams.get("sort") ?? "latest";

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(overrides)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    // Reset page on filter change
    params.delete("page");
    return `${pathname}?${params.toString()}`;
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => {
      router.push(buildUrl({ search: searchInput || undefined }));
    });
  }

  function handleSortChange(value: string) {
    startTransition(() => {
      router.push(buildUrl({ sort: value === "latest" ? undefined : value }));
    });
  }

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      justifyContent="space-between"
      alignItems={{ xs: "stretch", sm: "center" }}
      mb={{ xs: 2, sm: 4 }}
    >
      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 400 }}>
        <Stack direction="row" spacing={0}>
          <TextField
            fullWidth
            size="small"
            placeholder="ค้นหาสินค้า..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{
              bgcolor: "white",
              "& fieldset": {
                borderRadius: "8px 0 0 8px",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchNormal1 size="18" color="#d71414" />
                </InputAdornment>
              ),
              "aria-label": "Search products",
            }}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{
              borderRadius: "0 8px 8px 0",
              px: 2,
              fontWeight: 700,
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "#cc0000" },
            }}
          >
            ค้นหา
          </Button>
        </Stack>
      </form>

      {/* Sort dropdown */}
      <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 200 } }}>
        <InputLabel id="sort-select-label">เรียงตาม</InputLabel>
        <Select
          labelId="sort-select-label"
          label="เรียงตาม"
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value as string)}
          sx={{ bgcolor: "white", borderRadius: 2 }}
        >
          <MenuItem value="latest">ล่าสุด</MenuItem>
          <MenuItem value="popularity">ความเป็นที่นิยม</MenuItem>
          <MenuItem value="price-low">ราคาต่ำสุดไปสูงสุด</MenuItem>
          <MenuItem value="price-high">ราคาสูงสุดไปต่ำสุด</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
}
