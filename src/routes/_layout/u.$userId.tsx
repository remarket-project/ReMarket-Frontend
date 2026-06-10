import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Clock3,
  MessageSquare,
  Package,
  Shield,
} from "lucide-react"

import {
  type ListingRead,
  ListingsService,
  ReviewsService,
  UsersService,
} from "@/client"
import StarRating from "@/components/Common/StarRating"
import { ListingCard } from "@/components/Listings/ListingCard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import useAuth from "@/hooks/useAuth"

function getSellerProfileQueryOptions(userId: string) {
  return {
    queryFn: async () => {
      const [profile, reviews, listingsResponse] = await Promise.all([
        UsersService.readUserPublicProfile({ userId }),
        ReviewsService.getUserReviewsApiV1ReviewsUserUserIdGet({ userId }),
        ListingsService.listListingsApiV1ListingsGet({
          sellerId: userId,
          skip: 0,
          limit: 30,
        }),
      ])

      return {
        profile,
        reviews,
        listings: listingsResponse.items ?? [],
      }
    },
    queryKey: ["seller-profile", userId],
    staleTime: 2 * 60 * 1000,
  }
}

function day(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Unknown"
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export const Route = createFileRoute("/_layout/u/$userId")({
  component: SellerProfilePage,
  head: () => ({
    meta: [{ title: "Hồ sơ người bán - ReMarket" }],
  }),
})

function SellerProfilePage() {
  const { userId } = Route.useParams()
  const { user } = useAuth()
  const { data, isLoading } = useQuery(getSellerProfileQueryOptions(userId))

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[#D8E2EF] bg-white p-8 text-[#5B7083]">
        Đang tải hồ sơ người bán...
      </div>
    )
  }

  if (!data) return null

  const profile = data.profile
  const trustScore = Number(profile.trust_score || 0)
  const rating = Number(profile.rating_avg || 0)
  const isOwnProfile = user?.id === profile.id
  const initials = profile.full_name.slice(0, 2).toUpperCase()

  return (
    <div className="rounded-3xl border border-[#D8E2EF] bg-white p-4 sm:p-6 md:p-8">
      <section className="mb-4 flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          className="border-[#D8E2EF] bg-white text-[#5B7083]"
          asChild
        >
          <Link to="/items">
            <ArrowLeft className="mr-1.5 size-4" />
            Quay lại
          </Link>
        </Button>
      </section>

      <section className="rounded-2xl border border-[#D8E2EF] bg-white p-5 md:p-7">
        <div className="flex flex-wrap items-start gap-4">
          <Avatar className="size-24 rounded-2xl border-2 border-[#D8E2EF]">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="rounded-2xl bg-[#EFF6FF] text-2xl font-bold text-[#2563EB]">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-[#102A43]">
                {profile.full_name}
              </h1>
              <Badge className="border-[#A7F3D0] bg-[#ECFDF5] text-[#059669]">
                <BadgeCheck className="mr-1 size-3" />
                Đã xác minh
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <StarRating value={rating} />
              <span className="text-sm text-[#5B7083]">
                {rating.toFixed(1)} · {profile.rating_count} đánh giá
              </span>
            </div>
            {profile.bio ? (
              <p className="text-sm text-[#5B7083]">{profile.bio}</p>
            ) : null}
            <div className="flex flex-wrap gap-4 text-xs text-[#5B7083]">
              <span>📅 Tham gia {day(profile.created_at)}</span>
              <span>✅ {profile.completed_orders} đơn đã hoàn tất</span>
            </div>
          </div>

          {!isOwnProfile ? (
            <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
              <MessageSquare className="mr-2 size-4" />
              Nhắn tin
            </Button>
          ) : null}
        </div>
      </section>

      <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-[#D8E2EF] bg-white">
          <CardContent className="p-4">
            <p className="text-xs text-[#5B7083]">Đã bán</p>
            <p className="text-xl font-bold text-[#102A43]">
              {profile.completed_orders}
            </p>
          </CardContent>
        </Card>
        <Card className="border-[#D8E2EF] bg-white">
          <CardContent className="p-4">
            <p className="text-xs text-[#5B7083]">Thời gian phản hồi</p>
            <p className="text-xl font-bold text-[#102A43]">~36 phút</p>
          </CardContent>
        </Card>
        <Card className="border-[#D8E2EF] bg-white">
          <CardContent className="p-4">
            <p className="text-xs text-[#5B7083]">Tỷ lệ đúng hạn</p>
            <p className="text-xl font-bold text-[#102A43]">98%</p>
          </CardContent>
        </Card>
        <Card className="border-[#D8E2EF] bg-white">
          <CardContent className="p-4">
            <p className="text-xs text-[#5B7083]">Đánh giá TB</p>
            <p className="text-xl font-bold text-[#102A43]">
              {rating.toFixed(1)}★
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card className="border-[#D8E2EF] bg-white">
          <CardHeader>
            <CardTitle className="text-[#102A43]">
              Tin đăng & Đánh giá
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="listings">
              <TabsList className="border border-[#D8E2EF] bg-white p-1">
                <TabsTrigger value="listings">Tin đăng</TabsTrigger>
                <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
              </TabsList>
              <TabsContent value="listings" className="mt-4">
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {data.listings.map((listing: ListingRead, index: number) => (
                    <ListingCard
                      key={listing.id}
                      item={listing}
                      animationDelay={index * 50}
                    />
                  ))}
                </div>
                {data.listings.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#D8E2EF] bg-white p-6 text-sm text-[#5B7083]">
                    Chưa có tin đăng nào.
                  </div>
                ) : null}
              </TabsContent>
              <TabsContent value="reviews" className="mt-4 space-y-3">
                {data.reviews.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#D8E2EF] bg-white p-6 text-sm text-[#5B7083]">
                    Người bán chưa có đánh giá nào.
                  </div>
                ) : (
                  data.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-xl border border-[#D8E2EF] bg-white p-4"
                    >
                      <div className="flex items-center gap-2">
                        <StarRating value={review.rating} size="sm" />
                        <span className="text-xs text-[#5B7083]">
                          {day(review.created_at)}
                        </span>
                      </div>
                      {review.comment ? (
                        <p className="mt-2 text-sm text-[#5B7083]">
                          "{review.comment}"
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-[#2563EB]">
                        — Người mua #{review.reviewer_id.slice(0, 8)}
                      </p>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="border-[#D8E2EF] bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#102A43]">
              <Shield className="size-4 text-[#2563EB]" />
              Điểm tin cậy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <p className="text-5xl font-bold text-[#102A43]">
                {trustScore.toFixed(0)}
              </p>
              <p className="text-xs text-[#5B7083]">/ 100</p>
            </div>
            <Progress value={trustScore} className="h-2" />
            <p className="text-center text-xs text-[#5B7083]">
              {trustScore >= 90
                ? "Xuất sắc"
                : trustScore >= 70
                  ? "Tốt"
                  : "Đang xây dựng"}
            </p>

            <div className="space-y-2 border-t border-[#D8E2EF] pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#5B7083]">Đơn đã hoàn tất</span>
                <span className="font-semibold text-[#102A43]">
                  {profile.completed_orders}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#5B7083]">Đánh giá TB</span>
                <span className="font-semibold text-[#102A43]">
                  {rating.toFixed(1)} ★
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#5B7083]">Tham gia</span>
                <span className="font-semibold text-[#102A43]">
                  {day(profile.created_at)}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-[#D8E2EF] bg-[#EFF6FF] p-3 text-xs text-[#5B7083]">
              <p className="flex items-center gap-2">
                <Package className="size-4 text-[#2563EB]" />
                Tin đang bán: {data.listings.length}
              </p>
              <p className="mt-1 flex items-center gap-2">
                <Clock3 className="size-4 text-[#2563EB]" />
                Phản hồi mục tiêu: dưới 1 giờ
              </p>
              <p className="mt-1 flex items-center gap-2">
                <CalendarDays className="size-4 text-[#2563EB]" />
                Đánh giá nhận được: {data.reviews.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
