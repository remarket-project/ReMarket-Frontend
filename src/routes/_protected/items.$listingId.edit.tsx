import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import {
  CategoriesService,
  ListingsService,
  type ConditionGrade,
  type ListingWithImages,
} from "@/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const conditionOptions: { value: ConditionGrade; label: string }[] = [
  { value: "brand_new", label: "Mới nguyên hộp" },
  { value: "like_new", label: "Như mới" },
  { value: "good", label: "Tốt" },
  { value: "fair", label: "Khá" },
  { value: "poor", label: "Kém" },
]

function EditListingPage() {
  const { listingId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: listing, isLoading: listingLoading } = useQuery({
    queryKey: ["listing", listingId],
    queryFn: () =>
      ListingsService.getListingApiV1ListingsListingIdGet({
        listingId,
      }),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => CategoriesService.listCategoriesApiV1CategoriesGet({}),
  })

  const categories = categoriesData?.data ?? []

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [conditionGrade, setConditionGrade] = useState<ConditionGrade>("good")
  const [isNegotiable, setIsNegotiable] = useState(false)
  const [categoryId, setCategoryId] = useState("")

  useEffect(() => {
    if (listing) {
      setTitle(listing.title)
      setDescription(listing.description ?? "")
      setPrice(listing.price.toString())
      setConditionGrade(listing.condition_grade)
      setIsNegotiable(listing.is_negotiable ?? false)
      setCategoryId(listing.category_id)
    }
  }, [listing])

  const updateMutation = useMutation({
    mutationFn: () =>
      ListingsService.updateListingApiV1ListingsListingIdPatch({
        listingId,
        requestBody: {
          title: title.trim() || undefined,
          description: description.trim() || undefined,
          price: price ? Number(price) : undefined,
          is_negotiable: isNegotiable,
          condition_grade: conditionGrade,
          category_id: categoryId || undefined,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listing", listingId] })
      queryClient.invalidateQueries({ queryKey: ["my-listings"] })
      toast.success("Cập nhật tin đăng thành công.")
      navigate({ to: "/items/$listingId", params: { listingId } })
    },
    onError: (error: any) => {
      toast.error(error?.body?.detail || "Không thể cập nhật tin đăng.")
    },
  })

  if (listingLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-[#2563EB]" />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="text-center py-20 text-[#5B7083]">
        Không tìm thấy tin đăng.
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <section className="rounded-[26px] border border-[#D8E2EF] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="border-[#D8E2EF] text-[#5B7083] hover:bg-slate-100 cursor-pointer"
            onClick={() =>
              navigate({ to: "/items/$listingId", params: { listingId } })
            }
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-[#102A43]">Sửa tin đăng</h1>
            <p className="text-sm text-[#5B7083]">
              Cập nhật thông tin sản phẩm của bạn
            </p>
          </div>
        </div>
      </section>

      <Card className="border-[#D8E2EF] bg-white rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold text-[#102A43]">
            Thông tin cơ bản
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#102A43] mb-1.5">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-[#D8E2EF] bg-white px-4 py-2.5 text-sm text-[#102A43] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              placeholder="Nhập tiêu đề sản phẩm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#102A43] mb-1.5">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl border border-[#D8E2EF] bg-white px-4 py-2.5 text-sm text-[#102A43] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            >
              <option value="">Chọn danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#102A43] mb-1.5">
                Giá (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border border-[#D8E2EF] bg-white px-4 py-2.5 text-sm text-[#102A43] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                placeholder="0"
                min={0}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#102A43] mb-1.5">
                Tình trạng <span className="text-red-500">*</span>
              </label>
              <select
                value={conditionGrade}
                onChange={(e) =>
                  setConditionGrade(e.target.value as ConditionGrade)
                }
                className="w-full rounded-xl border border-[#D8E2EF] bg-white px-4 py-2.5 text-sm text-[#102A43] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              >
                {conditionOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isNegotiable"
              checked={isNegotiable}
              onChange={(e) => setIsNegotiable(e.target.checked)}
              className="size-4 rounded border-[#D8E2EF] text-[#2563EB] focus:ring-[#2563EB]"
            />
            <label htmlFor="isNegotiable" className="text-sm text-[#5B7083]">
              Có thể thương lượng
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#102A43] mb-1.5">
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full rounded-xl border border-[#D8E2EF] bg-white px-4 py-2.5 text-sm text-[#102A43] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] resize-y"
              placeholder="Mô tả chi tiết sản phẩm..."
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#D8E2EF] bg-white rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold text-[#102A43]">
            Hình ảnh
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {(listing as ListingWithImages).images?.map((img) => (
              <div
                key={img.id}
                className="relative aspect-square rounded-xl overflow-hidden border border-[#D8E2EF]"
              >
                <img
                  src={img.image_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
                {img.is_primary && (
                  <span className="absolute top-1 left-1 text-[10px] bg-[#2563EB] text-white px-1.5 py-0.5 rounded-full font-semibold">
                    Chính
                  </span>
                )}
              </div>
            ))}
            {(listing as ListingWithImages).images?.length === 0 && (
              <p className="col-span-3 text-sm text-[#5B7083] text-center py-8">
                Không có hình ảnh
              </p>
            )}
          </div>
          <p className="text-xs text-[#94A3B8] mt-3">
            Để thay đổi hình ảnh, vui lòng xóa rồi đăng lại tin.
          </p>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          className="border-[#D8E2EF] text-[#5B7083] hover:bg-slate-100 rounded-xl cursor-pointer"
          onClick={() =>
            navigate({ to: "/items/$listingId", params: { listingId } })
          }
        >
          Hủy
        </Button>
        <Button
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-semibold px-6 cursor-pointer"
          disabled={updateMutation.isPending || !title.trim() || !categoryId || !price}
          onClick={() => updateMutation.mutate()}
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="mr-2 size-4" />
              Lưu thay đổi
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export const Route = createFileRoute(
  "/_protected/items/$listingId/edit",
)({
  component: EditListingPage,
  head: () => ({
    meta: [{ title: "Sửa tin đăng - ReMarket" }],
  }),
})
