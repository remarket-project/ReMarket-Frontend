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

  const { data: provinces = [] } = useQuery({
    queryKey: ["vn-provinces"],
    queryFn: async (): Promise<VnLocation[]> => {
      const response = await fetch("https://provinces.open-api.vn/api/p/")
      if (!response.ok) {
        throw new Error("Failed to load provinces")
      }
      return response.json()
    },
  })

  const { data: districts = [] } = useQuery({
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
  })

  const { data: wards = [] } = useQuery({
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
  })

  return (
    <div className="space-y-6">
      {/* Location Info */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-2 items-start">
          <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-blue-900 dark:text-blue-100">
              📍 Your listing location
            </p>
            <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
              This helps local buyers find your item and is used for shipping
              calculations.
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
            <FormLabel>Province/City *</FormLabel>
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value)
                form.setValue("district", "", { shouldValidate: true })
                form.setValue("ward", "", { shouldValidate: true })
              }}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select your province" />
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
            <FormLabel>District *</FormLabel>
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value)
                form.setValue("ward", "", { shouldValidate: true })
              }}
              disabled={!province}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      province ? "Select district" : "First select province"
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
            <FormLabel>Ward *</FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={!district}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      district ? "Select ward" : "First select district"
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
            <FormLabel>Specific Address (Optional)</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., 123 Main Street, Apartment 456"
                maxLength={255}
                {...field}
              />
            </FormControl>
            <FormDescription>
              Help buyers know exactly where to pick up or to understand the
              area better
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export default CreateListingStep3Location
