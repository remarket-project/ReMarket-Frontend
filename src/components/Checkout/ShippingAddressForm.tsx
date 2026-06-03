import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ShippingAddressInput } from "@/client"
import type { Province, District, Ward } from "@/lib/shipping-utils"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

interface ShippingAddressFormProps {
  value: ShippingAddressInput
  onChange: (value: ShippingAddressInput) => void
}

export default function ShippingAddressForm({ value, onChange }: ShippingAddressFormProps) {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [loadingProv, setLoadingProv] = useState(false)
  const [loadingDist, setLoadingDist] = useState(false)
  const [loadingWard, setLoadingWard] = useState(false)

  useEffect(() => {
    setLoadingProv(true)
    fetch(`${API_BASE}/api/v1/shipping/provinces`)
      .then((r) => r.json())
      .then(setProvinces)
      .catch(() => {})
      .finally(() => setLoadingProv(false))
  }, [])

  const handleProvinceChange = (provinceName: string) => {
    const p = provinces.find((x) => x.province_name === provinceName)
    if (!p) return
    onChange({ ...value, province: provinceName, district: "", ward: "", province_id: p.province_id, district_id: null, ward_code: null })
    setDistricts([])
    setWards([])
    setLoadingDist(true)
    fetch(`${API_BASE}/api/v1/shipping/districts?province_id=${p.province_id}`)
      .then((r) => r.json())
      .then(setDistricts)
      .catch(() => {})
      .finally(() => setLoadingDist(false))
  }

  const handleDistrictChange = (districtName: string) => {
    const d = districts.find((x) => x.district_name === districtName)
    if (!d) return
    onChange({ ...value, district: districtName, ward: "", district_id: d.district_id, ward_code: null })
    setWards([])
    setLoadingWard(true)
    fetch(`${API_BASE}/api/v1/shipping/wards?district_id=${d.district_id}`)
      .then((r) => r.json())
      .then(setWards)
      .catch(() => {})
      .finally(() => setLoadingWard(false))
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
        Địa chỉ giao hàng
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Người nhận</Label>
          <Input
            placeholder="Họ và tên"
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Số điện thoại</Label>
          <Input
            placeholder="Số điện thoại"
            value={value.phone}
            onChange={(e) => onChange({ ...value, phone: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label>Tỉnh/Thành</Label>
          <Select
            value={value.province}
            onValueChange={handleProvinceChange}
            disabled={loadingProv}
          >
            <SelectTrigger>
              {loadingProv ? <Loader2 className="size-4 animate-spin" /> : <SelectValue placeholder="Chọn tỉnh" />}
            </SelectTrigger>
            <SelectContent>
              {provinces.map((p) => (
                <SelectItem key={p.province_id} value={p.province_name}>
                  {p.province_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Quận/Huyện</Label>
          <Select
            value={value.district}
            onValueChange={handleDistrictChange}
            disabled={!value.province || loadingDist}
          >
            <SelectTrigger>
              {loadingDist ? <Loader2 className="size-4 animate-spin" /> : <SelectValue placeholder="Chọn quận" />}
            </SelectTrigger>
            <SelectContent>
              {districts.map((d) => (
                <SelectItem key={d.district_id} value={d.district_name}>
                  {d.district_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Phường/Xã</Label>
          <Select
            value={value.ward}
            onValueChange={(v) => {
              const w = wards.find((x) => x.ward_name === v)
              onChange({ ...value, ward: v, ward_code: w?.ward_code || null })
            }}
            disabled={!value.district || loadingWard}
          >
            <SelectTrigger>
              {loadingWard ? <Loader2 className="size-4 animate-spin" /> : <SelectValue placeholder="Chọn phường" />}
            </SelectTrigger>
            <SelectContent>
              {wards.map((w) => (
                <SelectItem key={w.ward_code} value={w.ward_name}>
                  {w.ward_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Địa chỉ chi tiết</Label>
        <Input
          placeholder="Số nhà, tên đường"
          value={value.address_detail}
          onChange={(e) => onChange({ ...value, address_detail: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Ghi chú (không bắt buộc)</Label>
        <Textarea
          placeholder="Ghi chú cho người bán..."
          value={value.note || ""}
          onChange={(e) => onChange({ ...value, note: e.target.value })}
          rows={2}
        />
      </div>
    </div>
  )
}
