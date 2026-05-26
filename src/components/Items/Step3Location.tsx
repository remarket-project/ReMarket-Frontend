import { useQuery } from "@tanstack/react-query"
import { MapPin } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"
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

interface VnLocation {
  code: number
  name: string
}

interface Step3LocationProps {
  form: UseFormReturn<any>
}

function CreateListingStep3Location({ form }: Step3LocationProps) {
  const province = form.watch("province")
  const district = form.watch("district")

  const { data: provinces = [], isFetching: loadingProvinces } = useQuery({
    queryKey: ["vn-provinces"],
    queryFn: async (): Promise<VnLocation[]> => {
      const response = await fetch("https://provinces.open-api.vn/api/p/")
      if (!response.ok) {
        throw new Error("Failed to load provinces")
      }
      return response.json()
    },
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
    gcTime: 24 * 60 * 60 * 1000,
  })

  const { data: districts = [], isFetching: loadingDistricts } = useQuery({
    queryKey: ["vn-districts", province],
    queryFn: async (): Promise<VnLocation[]> => {
      const response = await fetch(
        `https://provinces.open-api.vn/api/d/?p=${province}`,
      )
      if (!response.ok) {
        throw new Error("Failed to load districts")
      }
      return response.json()
    },
    enabled: Boolean(province),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  })

  const { data: wards = [], isFetching: loadingWards } = useQuery({
    queryKey: ["vn-wards", district],
    queryFn: async (): Promise<VnLocation[]> => {
      const response = await fetch(
        `https://provinces.open-api.vn/api/w/?d=${district}`,
      )
      if (!response.ok) {
        throw new Error("Failed to load wards")
      }
      return response.json()
    },
    enabled: Boolean(district),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  })

  return (
    <div className="space-y-6">
      {/* Location Info */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-2 items-start">
          <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-blue-900 dark:text-blue-100">
              📍 Địa điểm bán hàng
            </p>
            <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
              Điều này giúp người mua ở gần dễ dàng tìm thấy sản phẩm của bạn và hỗ trợ tính toán phí vận chuyển.
            </p>
          </div>
        </div>
      </div>

      {/* Province */}
      <FormField
        control={form.control}
        name="province"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tỉnh / Thành phố *</FormLabel>
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value)
                form.setValue("district", "", { shouldValidate: true })
                form.setValue("ward", "", { shouldValidate: true })
              }}
              disabled={loadingProvinces}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={loadingProvinces ? "Đang tải Tỉnh / Thành phố..." : "Chọn Tỉnh / Thành phố"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {provinces.map((prov) => (
                  <SelectItem key={prov.code} value={String(prov.code)}>
                    {prov.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* District */}
      <FormField
        control={form.control}
        name="district"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Quận / Huyện *</FormLabel>
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value)
                form.setValue("ward", "", { shouldValidate: true })
              }}
              disabled={!province || loadingDistricts}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingDistricts
                        ? "Đang tải Quận / Huyện..."
                        : province
                        ? "Chọn Quận / Huyện"
                        : "Vui lòng chọn Tỉnh / Thành phố trước"
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {districts.map((dist) => (
                  <SelectItem key={dist.code} value={String(dist.code)}>
                    {dist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Ward */}
      <FormField
        control={form.control}
        name="ward"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phường / Xã *</FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={!district || loadingWards}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingWards
                        ? "Đang tải Phường / Xã..."
                        : district
                        ? "Chọn Phường / Xã"
                        : "Vui lòng chọn Quận / Huyện trước"
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {wards.map((ward) => (
                  <SelectItem key={ward.code} value={String(ward.code)}>
                    {ward.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Specific Address */}
      <FormField
        control={form.control}
        name="addressDetail"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Địa chỉ cụ thể (Tùy chọn)</FormLabel>
            <FormControl>
              <Input
                placeholder="Ví dụ: 123 Đường Nguyễn Trãi, Căn hộ 456"
                maxLength={255}
                {...field}
              />
            </FormControl>
            <FormDescription>
              Giúp người mua biết chính xác địa điểm nhận hàng hoặc hình dung rõ hơn về khu vực giao dịch
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export default CreateListingStep3Location
