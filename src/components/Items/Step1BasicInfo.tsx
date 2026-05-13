import { UseFormReturn } from "react-hook-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { CategoriesService } from "@/client";

const conditionGrades = [
  { value: "MINT", label: "Mint", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100" },
  { value: "LIKE_NEW", label: "Like New", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
  { value: "GOOD", label: "Good", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100" },
  { value: "FAIR", label: "Fair", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100" },
  { value: "POOR", label: "Poor", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" },
];

interface Step1Props {
  form: UseFormReturn<any>;
}

function CreateListingStep1({ form }: Step1Props) {
  // Fetch categories
  const { data: categoriesData } = useSuspenseQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      return await CategoriesService.listCategoriesApiV1CategoriesGet({
        skip: 0,
        limit: 100,
      });
    },
  });

  const categories = categoriesData?.data ?? [];
  const title = form.watch("title") || "";

  return (
    <div className="space-y-6">
      {/* Title */}
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Item Title</FormLabel>
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
              <RadioGroup value={field.value} onValueChange={field.onChange}>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                  {conditionGrades.map((grade) => (
                    <div key={grade.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={grade.value} id={grade.value} />
                      <Label
                        htmlFor={grade.value}
                        className={`px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${grade.color} flex-1 text-center`}
                      >
                        {grade.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
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
                          e.target.value ? parseFloat(e.target.value) : 0
                        )
                      }
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Set your asking price in USD
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
  );
}

export default CreateListingStep1;
