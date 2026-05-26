import { Star, Trash2, Upload } from "lucide-react"
import { useState } from "react"
import { type UseFormReturn, useFieldArray } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { FormDescription, FormLabel } from "@/components/ui/form"

interface Step3Props {
  form: UseFormReturn<any>
}

function CreateListingStep3({ form }: Step3Props) {
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "images",
  })

  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFiles = (files: FileList) => {
    const currentCount = fields.length
    const maxImages = 10
    const remainingSlots = maxImages - currentCount
    const acceptedTypes = ["image/jpeg", "image/png", "image/webp"]

    if (remainingSlots <= 0) {
      toast.error("Bạn chỉ có thể tải lên tối đa 10 ảnh.")
      return
    }

    const selected = Array.from(files)
    const validFiles = selected.slice(0, remainingSlots)

    const invalidTypeCount = selected.filter(
      (file) => !acceptedTypes.includes(file.type),
    ).length
    const invalidSizeCount = selected.filter(
      (file) => file.size > 5 * 1024 * 1024,
    ).length

    if (selected.length > remainingSlots) {
      toast.warning(`Chỉ còn lại ${remainingSlots} chỗ để tải ảnh.`)
    }
    if (invalidTypeCount > 0) {
      toast.error("Chỉ hỗ trợ định dạng ảnh JPG, PNG và WebP.")
    }
    if (invalidSizeCount > 0) {
      toast.error("Mỗi ảnh phải có dung lượng từ 5MB trở xuống.")
    }

    validFiles.forEach((file) => {
      if (!acceptedTypes.includes(file.type) || file.size > 5 * 1024 * 1024) {
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        append({
          file,
          url: e.target?.result as string,
          isPrimary: currentCount + validFiles.indexOf(file) === 0,
        })
      }
      reader.readAsDataURL(file)
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const setPrimary = (index: number) => {
    fields.forEach((_, idx) => {
      update(idx, { ...fields[idx], isPrimary: idx === index })
    })
  }

  const handleRemove = (index: number) => {
    const isPrimary = (fields[index] as any)?.isPrimary
    remove(index)

    if (isPrimary && fields.length > 1) {
      setTimeout(() => {
        const next = form.getValues("images")
        if (next?.length > 0 && !next.some((img: any) => img.isPrimary)) {
          form.setValue(
            "images",
            next.map((img: any, idx: number) => ({
              ...img,
              isPrimary: idx === 0,
            })),
            { shouldValidate: true },
          )
        }
      }, 0)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div>
        <FormLabel className="block mb-3">Ảnh sản phẩm *</FormLabel>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? "border-green-500 bg-green-50 dark:bg-green-950"
              : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500"
          }`}
        >
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleInputChange}
            className="hidden"
            id="image-input"
          />
          <label htmlFor="image-input" className="cursor-pointer block">
            <Upload className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Kéo thả ảnh vào đây hoặc nhấp để chọn từ thiết bị
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              JPG, PNG, hoặc WebP • Tối đa 5MB mỗi ảnh • Lên tới 10 ảnh
            </p>
          </label>
        </div>
        <FormDescription className="mt-2">
          Đã tải lên {fields.length}/10 ảnh
        </FormDescription>
      </div>

      {/* Image Gallery */}
      {fields.length > 0 && (
        <div>
          <FormLabel className="block mb-3">Danh sách ảnh của bạn</FormLabel>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {fields.map((field: any, index) => (
              <div
                key={field.id}
                className="relative group rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 aspect-square"
              >
                {field.url && (
                  <img
                    src={field.url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Primary Badge */}
                {field.isPrimary && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" />
                    Ảnh chính
                  </div>
                )}

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!field.isPrimary && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setPrimary(index)}
                      className="text-white border-white hover:bg-white/20"
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemove(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">
          📸 Mẹo chụp ảnh sản phẩm:
        </p>
        <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
          <li>Sử dụng ánh sáng tốt và chụp ảnh rõ nét</li>
          <li>Chụp sản phẩm từ nhiều góc độ khác nhau</li>
          <li>Chụp cận cảnh những chỗ bị lỗi hoặc hư hại (nếu có)</li>
          <li>Ảnh đầu tiên (Ảnh chính) sẽ hiển thị trong kết quả tìm kiếm</li>
        </ul>
      </div>
    </div>
  )
}

export default CreateListingStep3
