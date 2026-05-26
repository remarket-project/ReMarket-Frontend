import { useQuery } from "@tanstack/react-query"
import { FileText, MapPin } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"
import { CategoriesService } from "@/client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"

interface Step4Props {
  form: UseFormReturn<any>
}

function CreateListingStep4({ form }: Step4Props) {
  const data = form.getValues()

  const conditionLabels: Record<string, string> = {
    brand_new: "Mới nguyên hộp",
    like_new: "Như mới",
    good: "Tốt",
    fair: "Khá",
    poor: "Kém",
  }

  // Fetch categories to show human-readable name
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      CategoriesService.listCategoriesApiV1CategoriesGet({
        skip: 0,
        limit: 100,
      }),
  })

  const categories = categoriesData?.data ?? []
  const categoryName =
    categories.find((cat: any) => cat.id === data.categoryId)?.name || "—"

  // Fetch human readable location names from codes
  const { data: provinceObj } = useQuery({
    queryKey: ["vn-province-detail", data.province],
    queryFn: async () => {
      if (!data.province) return null
      const res = await fetch(
        `https://provinces.open-api.vn/api/p/${data.province}`,
      )
      if (!res.ok) return null
      return res.json()
    },
    enabled: Boolean(data.province),
  })

  const { data: districtObj } = useQuery({
    queryKey: ["vn-district-detail", data.district],
    queryFn: async () => {
      if (!data.district) return null
      const res = await fetch(
        `https://provinces.open-api.vn/api/d/${data.district}`,
      )
      if (!res.ok) return null
      return res.json()
    },
    enabled: Boolean(data.district),
  })

  const { data: wardObj } = useQuery({
    queryKey: ["vn-ward-detail", data.ward],
    queryFn: async () => {
      if (!data.ward) return null
      const res = await fetch(
        `https://provinces.open-api.vn/api/w/${data.ward}`,
      )
      if (!res.ok) return null
      return res.json()
    },
    enabled: Boolean(data.ward),
  })

  const provinceName = provinceObj?.name || "—"
  const districtName = districtObj?.name || "—"
  const wardName = wardObj?.name || "—"

  return (
    <div className="space-y-6">
      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <p className="text-sm text-green-900 dark:text-green-100">
          ✅ Mọi thông tin đã đầy đủ! Vui lòng xem lại bên dưới và bấm đăng tin khi đã sẵn sàng.
        </p>
      </div>

      {/* Listing Preview Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {/* Images Grid */}
        {data.images && data.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-0 max-h-96 overflow-hidden">
            {data.images.map((img: any, idx: number) => (
              <div
                key={idx}
                className="aspect-square relative overflow-hidden bg-gray-200 dark:bg-gray-700"
              >
                {img.url && (
                  <img
                    src={img.url}
                    alt={`Item ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
                {img.isPrimary && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                    Ảnh chính
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Item Details */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {data.title}
            </h2>
            {data.isNegotiable && (
              <Badge variant="secondary" className="mb-2">
                Có thương lượng
              </Badge>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-green-600 dark:text-green-400">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                maximumFractionDigits: 0,
              }).format(data.price || 0)}
            </span>
          </div>

          {/* Grid of Details */}
          <div className="grid grid-cols-2 gap-4 my-6 py-4 border-y border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">
                Tình trạng
              </p>
              <Badge variant="outline">
                {conditionLabels[data.conditionGrade] || data.conditionGrade}
              </Badge>
            </div>

            {data.province && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Địa điểm
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {provinceName}
                  {districtName !== "—" && `, ${districtName}`}
                  {wardName !== "—" && `, ${wardName}`}
                  {data.addressDetail && `, ${data.addressDetail}`}
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          {data.description && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-2 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Mô tả
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                {data.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Ảnh sản phẩm</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.images?.length || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Đã tải lên {data.images?.length || 0} ảnh
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Danh mục</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
              {categoryName}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Trạng thái</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="default">Sẵn sàng đăng tin</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Final Confirmation */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
        <FormField
          control={form.control}
          name="confirmAccuracy"
          render={({ field }) => (
            <FormItem>
              <label className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(Boolean(checked))
                    }
                  />
                </FormControl>
                <span>
                  Tôi xác nhận sản phẩm này được mô tả chính xác và thuộc sở hữu hợp pháp của tôi.
                </span>
              </label>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="agreeTerms"
          render={({ field }) => (
            <FormItem>
              <label className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(Boolean(checked))
                    }
                  />
                </FormControl>
                <span>
                  Tôi đồng ý với các điều khoản của người bán và chính sách chợ mua bán của ReMarket.
                </span>
              </label>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

export default CreateListingStep4
