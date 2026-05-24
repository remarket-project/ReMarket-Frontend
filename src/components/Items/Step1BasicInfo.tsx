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
    label: "Brand New",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    description: "Unused, original packaging",
  },
  {
    value: "like_new",
    label: "Like New",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description: "Used lightly, no visible wear",
  },
  {
    value: "good",
    label: "Good",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    description: "Normal use, fully functional",
  },
  {
    value: "fair",
    label: "Fair",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    description: "Visible wear, still works",
  },
  {
    value: "poor",
    label: "Poor",
    color: "bg-rose-50 text-rose-700 border-rose-200",
    description: "Heavy use, sold as-is",
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
            <FormLabel>Item Title *</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., iPhone 13 Pro 256GB Space Gray"
                maxLength={100}
                {...field}
                className="text-base"
              />
            </FormControl>
            <FormDescription>
              {title.length}/100 characters - Be specific and descriptive
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
            <FormLabel>Category *</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
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
              Choose the category that best describes your item
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
            <FormLabel>Condition Grade *</FormLabel>
            <FormControl>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5">
                {conditionGrades.map((grade) => (
                  <label
                    key={grade.value}
                    className={cn(
                      "flex cursor-pointer flex-col items-center rounded-xl border-2 p-3 text-center transition",
                      "hover:border-blue-400 hover:bg-blue-50/50",
                      field.value === grade.value
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 bg-white",
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
                    <p className="mt-1 text-xs text-gray-500">
                      {grade.description}
                    </p>
                  </label>
                ))}
              </div>
            </FormControl>
            <FormDescription>
              Honest condition grading helps buyers trust your listings
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
                <FormLabel>Price *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold">
                      $
                    </span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      max="999999.99"
                      className="pl-7"
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseFloat(e.target.value) : 0,
                        )
                      }
                    />
                  </div>
                </FormControl>
                <FormDescription>Set your asking price in USD</FormDescription>
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
              <FormLabel className="text-sm">Open to Negotiation?</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2 mt-2">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-green-600"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {field.value ? "Yes" : "No"}
                  </span>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-900 dark:text-blue-100">
        <p className="font-semibold mb-1">💡 Tips for success:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Clear, specific titles get more views and faster sales</li>
          <li>Be honest about condition to build trust</li>
          <li>Competitive pricing helps items sell faster</li>
        </ul>
      </div>
    </div>
  )
}

export default CreateListingStep1
