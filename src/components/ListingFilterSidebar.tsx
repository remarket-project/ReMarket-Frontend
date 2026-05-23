import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { CategoriesService } from "@/client";

type Props = {
  className?: string;
  q: string;
  setQ: (v: string) => void;
  minPrice: string;
  setMinPrice: (v: string) => void;
  maxPrice: string;
  setMaxPrice: (v: string) => void;
  categoryId?: string;
  setCategoryId: (v?: string) => void;
  onReset?: () => void;
  onApply?: () => void;
};

export default function ListingFilterSidebar({
  className = "",
  q,
  setQ,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  categoryId,
  setCategoryId,
  onReset,
  onApply,
}: Props) {
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      CategoriesService.listCategoriesApiV1CategoriesGet({ limit: 100 } as any),
  });

  const categories = categoriesData?.data ?? [];

  const [localQ, setLocalQ] = useState(q);
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);
  const [localCategory, setLocalCategory] = useState<string | undefined>(
    categoryId,
  );

  // keep local state in sync when parent changes externally
  useEffect(() => setLocalQ(q), [q]);
  useEffect(() => setLocalMin(minPrice), [minPrice]);
  useEffect(() => setLocalMax(maxPrice), [maxPrice]);
  useEffect(() => setLocalCategory(categoryId), [categoryId]);

  const handleApply = () => {
    setQ(localQ);
    setMinPrice(localMin);
    setMaxPrice(localMax);
    setCategoryId(localCategory);
    if (onApply) onApply();
  };

  const handleReset = () => {
    setLocalQ("");
    setLocalMin("");
    setLocalMax("");
    setLocalCategory(undefined);
    if (onReset) onReset();
  };

  return (
    <aside
      className={`w-full max-w-xs p-4 bg-white rounded-md shadow-sm ${className}`}
    >
      <h3 className="mb-3 text-lg font-semibold">Bộ lọc</h3>

      <div className="mb-3">
        <label className="mb-1 block text-sm text-muted">Từ khoá</label>
        <Input
          value={localQ}
          onChange={(e) => setLocalQ(e.target.value)}
          placeholder="Từ khoá, tiêu đề..."
        />
      </div>

      <div className="mb-3">
        <label className="mb-1 block text-sm text-muted">Danh mục</label>
        <select
          value={localCategory ?? ""}
          onChange={(e) => setLocalCategory(e.target.value || undefined)}
          className="w-full rounded-md border px-2 py-2"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="mb-1 block text-sm text-muted">
          Khoảng giá (VND)
        </label>
        <div className="flex gap-2">
          <Input
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            placeholder="Tối thiểu"
          />
          <Input
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            placeholder="Tối đa"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button variant="secondary" className="flex-1" onClick={handleReset}>
          Đặt lại
        </Button>
        <Button className="flex-1" onClick={handleApply}>
          Áp dụng
        </Button>
      </div>
    </aside>
  );
}
