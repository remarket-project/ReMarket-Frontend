import { UseFormReturn } from "react-hook-form";
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
import { MapPin } from "lucide-react";

// Vietnamese provinces, districts, wards data
// For simplicity, using a basic structure
const vietnamLocations = {
  provinces: [
    { id: "HN", name: "Hà Nội" },
    { id: "HCM", name: "TP. Hồ Chí Minh" },
    { id: "DN", name: "Đà Nẵng" },
    { id: "HP", name: "Hải Phòng" },
    { id: "CT", name: "Cần Thơ" },
  ],
  districts: {
    HN: [
      { id: "HN-BA", name: "Quận Ba Đình" },
      { id: "HN-HBT", name: "Quận Hoàn Bà Trìu" },
      { id: "HN-HA", name: "Quận Hai Bà Trưng" },
    ],
    HCM: [
      { id: "HCM-1", name: "Quận 1" },
      { id: "HCM-3", name: "Quận 3" },
      { id: "HCM-BT", name: "Quận Bình Thạnh" },
    ],
    DN: [
      { id: "DN-HD", name: "Quận Hải Châu" },
      { id: "DN-TK", name: "Quận Thanh Khê" },
    ],
    HP: [
      { id: "HP-NG", name: "Quận Ngô Quyền" },
      { id: "HP-LCH", name: "Quận Lê Chân" },
    ],
    CT: [
      { id: "CT-NK", name: "Quận Ninh Kiều" },
      { id: "CT-TK", name: "Quận Thốt Nốt" },
    ],
  },
  wards: {
    "HN-BA": [
      { id: "HN-BA-P1", name: "Phường Phúc Tân" },
      { id: "HN-BA-P2", name: "Phường Trúc Bạch" },
    ],
    "HN-HBT": [
      { id: "HN-HBT-P1", name: "Phường Hoàn Kiếm" },
      { id: "HN-HBT-P2", name: "Phường Thanh Nên" },
    ],
    "HCM-1": [
      { id: "HCM-1-B", name: "Phường Bến Nghé" },
      { id: "HCM-1-DN", name: "Phường Đa Kao" },
    ],
  },
};

interface Step3LocationProps {
  form: UseFormReturn<any>;
}

function CreateListingStep3Location({ form }: Step3LocationProps) {
  const province = form.watch("province");
  const district = form.watch("district");

  const availableDistricts =
    vietnamLocations.districts[
      province as keyof typeof vietnamLocations.districts
    ] || [];
  const availableWards =
    vietnamLocations.wards[district as keyof typeof vietnamLocations.wards] ||
    [];

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
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select your province" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {vietnamLocations.provinces.map((prov) => (
                  <SelectItem key={prov.id} value={prov.id}>
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
              onValueChange={field.onChange}
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
                {availableDistricts.map((dist) => (
                  <SelectItem key={dist.id} value={dist.id}>
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
                {availableWards.map((ward) => (
                  <SelectItem key={ward.id} value={ward.id}>
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
  );
}

export default CreateListingStep3Location;
