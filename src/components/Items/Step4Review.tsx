import { useQuery } from "@tanstack/react-query"
import { DollarSign, FileText, MapPin } from "lucide-react"
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
    brand_new: "Brand New",
    like_new: "Like New",
    good: "Good",
    fair: "Fair",
    poor: "Poor",
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
          ✅ All information looks good! Review below and publish when ready.
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
                    Primary
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
                Negotiable
              </Badge>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-3xl font-bold text-green-600 dark:text-green-400">
              ${data.price?.toFixed(2)}
            </span>
          </div>

          {/* Grid of Details */}
          <div className="grid grid-cols-2 gap-4 my-6 py-4 border-y border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">
                Condition
              </p>
              <Badge variant="outline">
                {conditionLabels[data.conditionGrade] || data.conditionGrade}
              </Badge>
            </div>

            {data.province && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Location
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
                <FileText className="w-3 h-3" /> Description
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
            <CardTitle className="text-sm font-semibold">Images</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.images?.length || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {data.images?.length === 1 ? "image" : "images"} uploaded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Category</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
              {categoryName}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="default">Ready to Publish</Badge>
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
                  I confirm this item is accurately described and I legally own
                  it.
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
                  I agree to ReMarket's seller terms and marketplace policy.
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
