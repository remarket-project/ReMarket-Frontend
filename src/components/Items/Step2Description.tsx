import type { UseFormReturn } from "react-hook-form"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

interface Step2Props {
  form: UseFormReturn<any>
}

function CreateListingStep2({ form }: Step2Props) {
  const description = form.watch("description") || ""
  const minChars = 20
  const maxChars = 2000

  return (
    <div className="space-y-6">
      {/* Description */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mô tả sản phẩm *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Mô tả chi tiết về sản phẩm của bạn. Bao gồm tình trạng, tính năng, bất kỳ lỗi nào, thông tin mua hàng ban đầu, v.v."
                maxLength={maxChars}
                rows={8}
                {...field}
                className="resize-none text-base"
              />
            </FormControl>
            <div className="flex justify-between items-center">
              <FormDescription>
                {description.length}/{maxChars} ký tự
              </FormDescription>
              {description.length < minChars && (
                <span className="text-red-500 dark:text-red-400 text-sm">
                  Yêu cầu tối thiểu {minChars} ký tự
                </span>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Description Tips */}
      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <p className="font-semibold text-sm text-amber-900 dark:text-amber-100 mb-2">
          📝 Mẹo viết mô tả thu hút:
        </p>
        <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1 list-disc list-inside">
          <li>Thành thật về tình trạng sản phẩm và mọi lỗi hỏng hóc (nếu có)</li>
          <li>Bao gồm thương hiệu, kiểu dáng, kích cỡ, màu sắc hoặc các thông số liên quan khác</li>
          <li>Đề cập đến ngày mua ban đầu nếu bạn còn nhớ</li>
          <li>Giải thích lý do tại sao bạn muốn bán</li>
          <li>Liệt kê các phụ kiện hoặc giấy tờ đi kèm</li>
        </ul>
      </div>

      {/* Preview */}
      {description && (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2 uppercase">
            Xem trước:
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
            {description}
          </p>
        </div>
      )}
    </div>
  )
}

export default CreateListingStep2
