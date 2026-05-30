import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Edit, Folder, Plus, Search, Trash2 } from "lucide-react"

import { CategoriesService } from "@/client"
import { CategoryFormDialog } from "@/components/Admin/CategoryFormDialog"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

export const Route = createFileRoute("/admin/categories")({
  component: TrangQuanLyDanhMuc,
  head: () => ({
    meta: [{ title: "Quản lý danh mục - ReMarket Admin" }],
  }),
})

function CategoryIcon({ url, name }: { url?: string | null; name: string }) {
  const isPlaceholder = url?.includes("via.placeholder.com")
  if (url && !isPlaceholder) {
    return (
      <img
        src={url}
        alt={name}
        className="size-full object-cover"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
      />
    )
  }

  return <Folder className="size-5 text-blue-400" />
}

function TrangQuanLyDanhMuc() {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [tuKhoa, setTuKhoa] = useState("")
  const [activeFormDialog, setActiveFormDialog] = useState<{
    mode: "create" | "edit"
    category?: any
  } | null>(null)

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ["adminCategories"],
    queryFn: () => CategoriesService.listCategoriesApiV1CategoriesGet({ skip: 0, limit: 100 }),
  })

  const deleteMutation = useMutation({
    mutationFn: (categoryId: string) =>
      CategoriesService.deleteCategoryApiV1CategoriesCategoryIdDelete({
        categoryId,
        args: undefined as any,
        kwargs: undefined as any,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] })
      showSuccessToast("Danh mục sản phẩm đã được xóa thành công.")
    },
    onError: handleError.bind(showErrorToast),
  })

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}" không?\nHành động này không thể hoàn tác.`)) {
      deleteMutation.mutate(id)
    }
  }

  const danhSach = (categoriesData as any)?.data ?? []
  const danhSachLoc = danhSach.filter((cat: any) =>
    cat.name.toLowerCase().includes(tuKhoa.toLowerCase()) ||
    cat.slug.toLowerCase().includes(tuKhoa.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 sm:text-3xl">
            Quản lý danh mục
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Quản lý cấu trúc danh mục sản phẩm của sàn thương mại điện tử
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActiveFormDialog({ mode: "create" })}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-blue-700"
        >
          <Plus className="size-4" />
          Thêm danh mục mới
        </button>
      </div>

      <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-[#111827] p-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục theo tên hoặc slug..."
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-[#1A2233] py-2.5 pl-11 pr-4 text-sm text-slate-100 transition focus:border-blue-500/40 focus:bg-[#1A2233] focus:outline-none placeholder:text-slate-600"
          />
        </div>
        {tuKhoa && (
          <span className="text-sm text-slate-400">
            Tìm thấy <strong className="text-slate-200">{danhSachLoc.length}</strong> danh mục
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-white/[0.06] bg-[#111827]" />
          ))}
        </div>
      ) : danhSachLoc.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-[#111827] py-16 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
            <Folder className="size-7" />
          </div>
          {tuKhoa ? (
            <>
              <p className="font-semibold text-slate-200">Không tìm thấy danh mục</p>
              <p className="mt-1 text-sm text-slate-500">
                Không có danh mục nào khớp với từ khóa "{tuKhoa}".
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-slate-200">Chưa có danh mục nào</p>
              <p className="mt-1 text-sm text-slate-500">
                Bắt đầu bằng cách thêm danh mục sản phẩm đầu tiên.
              </p>
              <button
                type="button"
                onClick={() => setActiveFormDialog({ mode: "create" })}
                className="mt-4 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus className="size-4" />
                Thêm danh mục mới
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {danhSachLoc.map((cat: any) => (
            <div
              key={cat.id}
              className="group flex items-start justify-between rounded-2xl border border-white/[0.06] bg-[#111827] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/20 hover:shadow-[0_8px_24px_rgba(59,130,246,0.08)]"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/[0.06] bg-blue-500/10">
                  <CategoryIcon url={cat.icon_url} name={cat.name} />
                </div>
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-bold text-slate-100">
                    {cat.name}
                  </h4>
                  <span className="font-mono text-[11px] text-slate-500">
                    slug: {cat.slug}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => setActiveFormDialog({ mode: "edit", category: cat })}
                  title="Chỉnh sửa danh mục"
                  className="flex size-8 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-blue-500/10 hover:text-blue-400"
                >
                  <Edit className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(cat.id, cat.name)}
                  title="Xóa danh mục"
                  className="flex size-8 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeFormDialog && (
        <CategoryFormDialog
          mode={activeFormDialog.mode}
          category={activeFormDialog.category}
          onClose={() => setActiveFormDialog(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["adminCategories"] })
            setActiveFormDialog(null)
          }}
        />
      )}
    </div>
  )
}
