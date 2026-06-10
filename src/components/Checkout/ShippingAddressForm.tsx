import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import type { ShippingAddressInput } from "@/client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface VnLocation {
  code: number
  name: string
}

interface ShippingAddressFormProps {
  value: ShippingAddressInput
  onChange: (value: ShippingAddressInput) => void
}

export default function ShippingAddressForm({
  value,
  onChange,
}: ShippingAddressFormProps) {
  const [provinces, setProvinces] = useState<VnLocation[]>([])
  const [districts, setDistricts] = useState<VnLocation[]>([])
  const [wards, setWards] = useState<VnLocation[]>([])
  const [loadingProv, setLoadingProv] = useState(false)
  const [loadingDist, setLoadingDist] = useState(false)
  const [loadingWard, setLoadingWard] = useState(false)

  // Fetch initial provinces list
  useEffect(() => {
    setLoadingProv(true)
    fetch("https://provinces.open-api.vn/api/p/")
      .then((r) => r.json())
      .then(setProvinces)
      .catch(() => {})
      .finally(() => setLoadingProv(false))
  }, [])

  // Auto-fetch districts if province exists and districts list is empty
  useEffect(() => {
    if (provinces.length > 0 && value.province) {
      const p = provinces.find((x) => x.name === value.province)
      if (p) {
        if (value.province_id !== p.code) {
          onChange({ ...value, province_id: p.code })
        }
        if (districts.length === 0 && !loadingDist) {
          setLoadingDist(true)
          fetch(`https://provinces.open-api.vn/api/p/${p.code}?depth=2`)
            .then((r) => r.json())
            .then((data) => setDistricts(data.districts || []))
            .catch(() => {})
            .finally(() => setLoadingDist(false))
        }
      }
    }
  }, [
    provinces,
    value.province,
    districts.length,
    loadingDist,
    onChange,
    value.province_id,
    value,
  ])

  // Auto-fetch wards if district exists and wards list is empty
  useEffect(() => {
    if (districts.length > 0 && value.district) {
      const d = districts.find((x) => x.name === value.district)
      if (d) {
        if (value.district_id !== d.code) {
          onChange({ ...value, district_id: d.code })
        }
        if (wards.length === 0 && !loadingWard) {
          setLoadingWard(true)
          fetch(`https://provinces.open-api.vn/api/d/${d.code}?depth=2`)
            .then((r) => r.json())
            .then((data) => setWards(data.wards || []))
            .catch(() => {})
            .finally(() => setLoadingWard(false))
        }
      }
    }
  }, [
    districts,
    value.district,
    wards.length,
    loadingWard,
    onChange,
    value.district_id,
    value,
  ])

  // Sync ward code if ward exists
  useEffect(() => {
    if (wards.length > 0 && value.ward) {
      const w = wards.find((x) => x.name === value.ward)
      if (w && value.ward_code !== String(w.code)) {
        onChange({ ...value, ward_code: String(w.code) })
      }
    }
  }, [wards, value.ward, value.ward_code, value, onChange])

  const handleProvinceChange = (provinceName: string) => {
    const p = provinces.find((x) => x.name === provinceName)
    if (!p) return
    onChange({
      ...value,
      province: provinceName,
      district: "",
      ward: "",
      province_id: p.code,
      district_id: null,
      ward_code: null,
    })
    setDistricts([])
    setWards([])
    setLoadingDist(true)
    fetch(`https://provinces.open-api.vn/api/p/${p.code}?depth=2`)
      .then((r) => r.json())
      .then((data) => setDistricts(data.districts || []))
      .catch(() => {})
      .finally(() => setLoadingDist(false))
  }

  const handleDistrictChange = (districtName: string) => {
    const d = districts.find((x) => x.name === districtName)
    if (!d) return
    onChange({
      ...value,
      district: districtName,
      ward: "",
      district_id: d.code,
      ward_code: null,
    })
    setWards([])
    setLoadingWard(true)
    fetch(`https://provinces.open-api.vn/api/d/${d.code}?depth=2`)
      .then((r) => r.json())
      .then((data) => setWards(data.wards || []))
      .catch(() => {})
      .finally(() => setLoadingWard(false))
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>
            Người nhận <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="Họ và tên"
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            className="h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label>
            Số điện thoại <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="Số điện thoại"
            value={value.phone}
            onChange={(e) => onChange({ ...value, phone: e.target.value })}
            className="h-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label>
            Tỉnh/Thành <span className="text-red-500">*</span>
          </Label>
          <Select
            value={value.province}
            onValueChange={handleProvinceChange}
            disabled={loadingProv}
          >
            <SelectTrigger className="h-9">
              {loadingProv ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <SelectValue placeholder="Chọn tỉnh" />
              )}
            </SelectTrigger>
            <SelectContent>
              {provinces.map((p) => (
                <SelectItem key={p.code} value={p.name}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>
            Quận/Huyện <span className="text-red-500">*</span>
          </Label>
          <Select
            value={value.district}
            onValueChange={handleDistrictChange}
            disabled={!value.province || loadingDist}
          >
            <SelectTrigger className="h-9">
              {loadingDist ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <SelectValue placeholder="Chọn quận" />
              )}
            </SelectTrigger>
            <SelectContent>
              {districts.map((d) => (
                <SelectItem key={d.code} value={d.name}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>
            Phường/Xã <span className="text-red-500">*</span>
          </Label>
          <Select
            value={value.ward}
            onValueChange={(v) => {
              const w = wards.find((x) => x.name === v)
              onChange({
                ...value,
                ward: v,
                ward_code: w ? String(w.code) : null,
              })
            }}
            disabled={!value.district || loadingWard}
          >
            <SelectTrigger className="h-9">
              {loadingWard ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <SelectValue placeholder="Chọn phường" />
              )}
            </SelectTrigger>
            <SelectContent>
              {wards.map((w) => (
                <SelectItem key={w.code} value={w.name}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>
          Địa chỉ chi tiết <span className="text-red-500">*</span>
        </Label>
        <Input
          placeholder="Số nhà, tên đường"
          value={value.address_detail}
          onChange={(e) =>
            onChange({ ...value, address_detail: e.target.value })
          }
          className="h-9"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Ghi chú (không bắt buộc)</Label>
        <Textarea
          placeholder="Ghi chú cho người bán..."
          value={value.note || ""}
          onChange={(e) => onChange({ ...value, note: e.target.value })}
          rows={1}
          className="min-h-[44px] resize-none py-2"
        />
      </div>
    </div>
  )
}
