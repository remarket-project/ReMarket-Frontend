import { useQuery } from "@tanstack/react-query"
import type { UseFormReturn } from "react-hook-form"
import { CategoriesService } from "@/client"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

const conditionGrades = [
  {
    value: "brand_new",
    label: "Mới nguyên hộp",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    description: "Chưa qua sử dụng, nguyên hộp",
  },
  {
    value: "like_new",
    label: "Như mới",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description: "Sử dụng lướt, không vết trầy xước",
  },
  {
    value: "good",
    label: "Tốt",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    description: "Đã sử dụng, mọi chức năng hoạt động tốt",
  },
  {
    value: "fair",
    label: "Khá",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    description: "Có vết xước hao mòn, hoạt động tốt",
  },
  {
    value: "poor",
    label: "Kém",
    color: "bg-rose-50 text-rose-700 border-rose-200",
    description: "Sử dụng nhiều, bán thanh lý tại chỗ",
  },
]

interface Step1Props {
  form: UseFormReturn<any>
}

function CreateListingStep1({ form }: Step1Props) {
  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      return await CategoriesService.listCategoriesApiV1CategoriesGet({
        skip: 0,
        limit: 100,
      })
    },
  })

  const categories = categoriesData?.data ?? []
  const title = form.watch("title") || ""

  return (
    <div className="space-y-6">
      {/* Title */}
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tiêu đề tin đăng *</FormLabel>
            <FormControl>
              <Input
                placeholder="Ví dụ: iPhone 13 Pro 256GB Xám Không Gian"
                maxLength={100}
                {...field}
                className="text-base"
              />
            </FormControl>
            <FormDescription>
              {title.length}/100 ký tự - Hãy viết cụ thể và chi tiết
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Category */}
      <FormField
        control={form.control}
        name="categoryId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Danh mục *</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn một danh mục" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories.map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              Chọn danh mục phù hợp nhất với món đồ của bạn
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Condition Grade */}
      <FormField
        control={form.control}
        name="conditionGrade"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tình trạng sản phẩm *</FormLabel>
            <FormControl>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5">
                {conditionGrades.map((grade) => (
                  <label
                    key={grade.value}
                    className={cn(
                      "flex cursor-pointer flex-col items-center rounded-xl border-2 p-3 text-center transition",
                      "hover:border-blue-400 hover:bg-blue-50/50",
                      field.value === grade.value
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-500"
                        : "border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900/50",
                    )}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      value={grade.value}
                      checked={field.value === grade.value}
                      onChange={() => field.onChange(grade.value)}
                    />
                    <span
                      className={cn(
                        "rounded-lg border px-2 py-1 text-xs font-semibold",
                        grade.color,
                      )}
                    >
                      {grade.label}
                    </span>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {grade.description}
                    </p>
                  </label>
                ))}
              </div>
            </FormControl>
            <FormDescription>
              Đánh giá tình trạng trung thực giúp tăng uy tín với người mua
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Price & Negotiable */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giá bán *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0"
                      step="1000"
                      min="0"
                      max="1000000000"
                      className="pr-8"
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value, 10) : 0,
                        )
                      }
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold">
                      đ
                    </span>
                  </div>
                </FormControl>
                <FormDescription>
                  Đặt mức giá mong muốn của bạn theo VNĐ
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Negotiable Toggle */}
        <FormField
          control={form.control}
          name="isNegotiable"
          render={({ field }) => (
            <FormItem className="flex flex-col justify-end">
              <FormLabel className="text-sm">Có thể thương lượng?</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2 mt-2">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-green-600"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {field.value ? "Có" : "Không"}
                  </span>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-900 dark:text-blue-100">
        <p className="font-semibold mb-1">💡 Mẹo để bán hàng nhanh hơn:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Tiêu đề rõ ràng, cụ thể giúp thu hút nhiều lượt xem hơn</li>
          <li>Đánh giá đúng tình trạng sản phẩm để xây dựng lòng tin</li>
          <li>Đặt giá cả cạnh tranh giúp bán hàng nhanh hơn</li>
        </ul>
      </div>
    </div>
  )
}

export default CreateListingStep1
