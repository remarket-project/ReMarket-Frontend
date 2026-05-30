import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Check, X } from "lucide-react"

import { CategoriesService } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

interface CategoryFormProps {
  mode: "create" | "edit"
  category?: any
  onClose: () => void
  onSuccess: () => void
}

export function CategoryFormDialog({ mode, category, onClose, onSuccess }: CategoryFormProps) {
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [name, setName] = useState(category?.name || "")
  const [slug, setSlug] = useState(category?.slug || "")
  const [iconUrl, setIconUrl] = useState(category?.icon_url || "")
  const isEdit = mode === "edit"

  const createMutation = useMutation({
    mutationFn: () =>
      CategoriesService.createCategoryApiV1CategoriesPost({
        args: undefined as any,
        kwargs: undefined as any,
        requestBody: { name, slug, icon_url: iconUrl || null },
      }),
    onSuccess: () => {
      showSuccessToast("Đã tạo danh mục sản phẩm mới thành công.")
      onSuccess()
    },
    onError: handleError.bind(showErrorToast),
  })

  const updateMutation = useMutation({
    mutationFn: () =>
      CategoriesService.updateCategoryApiV1CategoriesCategoryIdPut({
        categoryId: category.id,
        args: undefined as any,
        kwargs: undefined as any,
        requestBody: { name, slug, icon_url: iconUrl || null },
      }),
    onSuccess: () => {
      showSuccessToast("Đã cập nhật danh mục thành công.")
      onSuccess()
    },
    onError: handleError.bind(showErrorToast),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isEdit) updateMutation.mutate()
    else createMutation.mutate()
  }

  const handleNameChange = (val: string) => {
    setName(val)
    if (!isEdit) {
      const generatedSlug = val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
      setSlug(generatedSlug)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md animate-rmk-fade-up overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#111827] shadow-2xl text-slate-100"
      >
        <div className="flex items-center justify-between border-b border-white/[0.08] p-5">
          <h3 className="text-lg font-bold text-slate-100">
            {isEdit ? "Chỉnh sửa danh mục sản phẩm" : "Tạo danh mục sản phẩm mới"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-4 p-6 text-sm">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Tên danh mục:</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ví dụ: Điện thoại & Laptop"
              className="w-full rounded-[12px] border border-white/[0.08] bg-[#1A2233] p-2.5 text-slate-100 placeholder:text-slate-600 focus:border-blue-500/40 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Đường dẫn URL (Slug):</label>
            <input
              required
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="dien-thoai-laptop"
              className="w-full rounded-[12px] border border-white/[0.08] bg-[#1A2233] p-2.5 font-mono text-xs text-slate-100 focus:border-blue-500/40 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500">
              Slug dùng làm định danh trên URL, không chứa ký tự tiếng Việt hoặc dấu cách.
            </span>
          </div>
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Đường dẫn ảnh Icon (Tùy chọn):</label>
            <input
              type="url"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              placeholder="https://example.com/icon.png"
              className="w-full rounded-[12px] border border-white/[0.08] bg-[#1A2233] p-2.5 text-xs text-slate-100 focus:border-blue-500/40 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-white/[0.08] bg-[#1A2233]/40 p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] border border-white/[0.08] bg-transparent px-4 py-2 text-sm font-semibold text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-slate-200"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isPending || !name.trim() || !slug.trim()}
            className="flex items-center gap-1.5 rounded-[10px] bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-blue-800/40 disabled:text-slate-500 disabled:cursor-not-allowed"
          >
            <Check className="size-4" /> {isEdit ? "Cập nhật" : "Lưu lại"}
          </button>
        </div>
      </form>
    </div>
  )
}
