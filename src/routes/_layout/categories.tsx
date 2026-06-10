import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { ChevronRight, Grid3X3, Loader2 } from "lucide-react"

import { CategoriesService } from "@/client"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export const Route = createFileRoute("/_layout/categories")({
  component: CategoriesPage,
})

const hardcodedCategories = [
  {
    name: "Công nghệ",
    slug: "cong-nghe",
    icon: "📱",
    color: "bg-blue-50",
    desc: "Điện thoại, laptop, máy tính bảng & phụ kiện",
  },
  {
    name: "Gia dụng",
    slug: "gia-dung",
    icon: "🏠",
    color: "bg-amber-50",
    desc: "Đồ dùng nhà bếp, nội thất & thiết bị gia đình",
  },
  {
    name: "Thời trang",
    slug: "thoi-trang",
    icon: "👕",
    color: "bg-rose-50",
    desc: "Quần áo, giày dép, túi xách & phụ kiện",
  },
  {
    name: "Máy ảnh",
    slug: "may-anh",
    icon: "📷",
    color: "bg-purple-50",
    desc: "Máy ảnh, ống kính & thiết bị nhiếp ảnh",
  },
  {
    name: "Gaming",
    slug: "gaming",
    icon: "🎮",
    color: "bg-green-50",
    desc: "Console, game & phụ kiện chơi game",
  },
  {
    name: "Đời sống",
    slug: "doi-song",
    icon: "🌿",
    color: "bg-emerald-50",
    desc: "Đồ dùng cá nhân, làm đẹp & sức khỏe",
  },
  {
    name: "Thể thao",
    slug: "the-thao",
    icon: "⚽",
    color: "bg-orange-50",
    desc: "Dụng cụ thể thao, xe đạp & thiết bị ngoài trời",
  },
  {
    name: "Xe cộ",
    slug: "xe-co",
    icon: "🚗",
    color: "bg-cyan-50",
    desc: "Xe máy, ô tô & phụ tùng",
  },
  {
    name: "Sách",
    slug: "sach",
    icon: "📚",
    color: "bg-yellow-50",
    desc: "Sách các loại, truyện & tài liệu học tập",
  },
  {
    name: "Âm nhạc",
    slug: "am-nhac",
    icon: "🎵",
    color: "bg-indigo-50",
    desc: "Nhạc cụ, thiết bị âm thanh & phụ kiện",
  },
]

function CategoriesPage() {
  const { data: apiCategories, isLoading } = useQuery({
    queryKey: ["categories-all"],
    queryFn: () =>
      CategoriesService.listCategoriesApiV1CategoriesGet({ limit: 50 }),
  })

  const categories =
    apiCategories?.data && apiCategories.data.length > 0
      ? apiCategories.data.map((c) => ({
          name: c.name,
          slug: c.slug,
          id: c.id,
          icon_url: c.icon_url,
        }))
      : null

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#5B7083]">
        <Link to="/" className="hover:text-[#2563EB]">
          Trang chủ
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-[#102A43] font-medium">Danh mục</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#102A43]">Danh mục sản phẩm</h1>
        <p className="mt-1 text-sm text-[#5B7083]">
          Khám phá hàng ngàn tin đăng theo danh mục bạn quan tâm
        </p>
      </div>

      {/* Search filter */}
      <div className="relative max-w-md">
        <Input
          placeholder="Tìm danh mục..."
          className="border-[#D8E2EF] pl-9"
        />
        <Grid3X3 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8A99A8]" />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-8 animate-spin text-[#2563EB]" />
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {hardcodedCategories.map((cat) => (
          <Link
            key={cat.slug}
            to="/items"
            search={{ categorySlug: cat.slug }}
            className="group"
          >
            <Card className="border-[#D8E2EF] bg-white transition hover:border-[#2563EB]/40 hover:shadow-md h-full">
              <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                <span
                  className={`flex size-14 items-center justify-center rounded-2xl ${cat.color} text-2xl`}
                >
                  {cat.icon}
                </span>
                <div>
                  <h3 className="font-semibold text-[#102A43] group-hover:text-[#2563EB]">
                    {cat.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-[#8A99A8]">{cat.desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* API categories section (if available) */}
      {categories && (
        <section className="pt-4">
          <h2 className="text-lg font-semibold text-[#102A43] mb-4">
            Tất cả danh mục từ hệ thống
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to="/items"
                search={{ categorySlug: cat.slug, categoryId: cat.id }}
                className="rounded-xl border border-[#D8E2EF] bg-white px-4 py-2 text-sm text-[#5B7083] hover:border-[#2563EB]/40 hover:text-[#2563EB] transition"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
