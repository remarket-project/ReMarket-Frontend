import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import confetti from "canvas-confetti"
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Package,
  PlusCircle,
  Rocket,
  ShoppingBag,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { ListingsService } from "@/client"
import CreateListingStep1 from "@/components/Items/Step1BasicInfo"
import CreateListingStep2 from "@/components/Items/Step2Description"
import CreateListingStep3 from "@/components/Items/Step3Images"
import CreateListingStep3Location from "@/components/Items/Step3Location"
import CreateListingStep4 from "@/components/Items/Step4Review"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { Progress } from "@/components/ui/progress"
import useAuth from "@/hooks/useAuth"
import { extractErrorMessage } from "@/utils"

function formatVND(value: number) {
  if (!value || Number.isNaN(value) || value <= 0) return "0 ₫"
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

const DRAFT_KEY = "rmk-create-listing-draft-v1"

const listingFormSchema = z.object({
  title: z.string().min(10).max(100),
  categoryId: z.string().uuid(),
  conditionGrade: z.enum(["brand_new", "like_new", "good", "fair", "poor"]),
  price: z.number().positive(),
  isNegotiable: z.boolean(),
  description: z.string().min(20).max(2000),
  province: z.string().min(1),
  district: z.string().min(1),
  ward: z.string().min(1),
  addressDetail: z.string().optional(),
  images: z
    .array(
      z.object({
        file: z.instanceof(File).optional(),
        url: z.string().optional(),
        isPrimary: z.boolean(),
      }),
    )
    .min(1, "Yêu cầu ít nhất 1 ảnh"),
  confirmAccuracy: z
    .boolean()
    .refine(
      (value) => value,
      "Vui lòng xác nhận tính chính xác của thông tin đăng bán.",
    ),
  agreeTerms: z
    .boolean()
    .refine(
      (value) => value,
      "Vui lòng đồng ý với các điều khoản của người bán trước khi đăng.",
    ),
})

type ListingFormData = z.infer<typeof listingFormSchema>

const steps = [
  { id: 1, label: "Thông tin cơ bản", shortLabel: "Cơ bản" },
  { id: 2, label: "Mô tả", shortLabel: "Mô tả" },
  { id: 3, label: "Ảnh", shortLabel: "Ảnh" },
  { id: 4, label: "Địa điểm", shortLabel: "Địa chỉ" },
  { id: 5, label: "Xem lại", shortLabel: "Xem lại" },
]

const conditionLabel: Record<ListingFormData["conditionGrade"], string> = {
  brand_new: "Mới nguyên hộp",
  like_new: "Như mới",
  good: "Tốt",
  fair: "Khá",
  poor: "Kém",
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:gap-2">
      {steps.map((step, idx) => {
        const isDone = currentStep > step.id
        const isActive = currentStep === step.id
        return (
          <div key={step.id} className="flex items-center gap-1 sm:gap-2">
            <div
              className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${
                isDone
                  ? "bg-[#059669] text-white"
                  : isActive
                    ? "bg-[#2563EB] text-white"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {isDone ? <Check className="size-4" /> : step.id}
            </div>
            {/* Short label on mobile, full label on tablet+ */}
            <span
              className={`text-xs font-semibold whitespace-nowrap transition-colors duration-300 ${
                isActive
                  ? "text-[#2563EB]"
                  : isDone
                    ? "text-[#059669]"
                    : "text-muted-foreground"
              }`}
            >
              <span className="sm:hidden">{step.shortLabel}</span>
              <span className="hidden sm:block">{step.label}</span>
            </span>
            {idx < steps.length - 1 && (
              <div
                className={`h-px w-4 sm:w-8 transition-colors duration-300 ${
                  isDone ? "bg-[#059669]" : "bg-border"
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function CreateListingPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdListingId, setCreatedListingId] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      categoryId: "",
      conditionGrade: "good",
      price: 0,
      isNegotiable: false,
      description: "",
      province: "",
      district: "",
      ward: "",
      addressDetail: "",
      images: [],
      confirmAccuracy: false,
      agreeTerms: false,
    },
  })

  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return
    try {
      const draft = JSON.parse(raw)
      form.reset({
        ...form.getValues(),
        ...draft,
        images: Array.isArray(draft.images)
          ? draft.images.map((img: any) => ({
              file: undefined,
              url: img.url,
              isPrimary: Boolean(img.isPrimary),
            }))
          : [],
      })
    } catch {
      localStorage.removeItem(DRAFT_KEY)
    }
  }, [form])

  useEffect(() => {
    const subscription = form.watch((value) => {
      const draft = {
        ...value,
        images: (value.images ?? []).map((img) => ({
          url: img?.url,
          isPrimary: Boolean(img?.isPrimary),
        })),
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Warning on page reload / tab close when form is dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty && !showSuccessModal) {
        e.preventDefault()
        e.returnValue = "Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời trang?"
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [form.formState.isDirty, showSuccessModal])

  const totalSteps = 5
  const progress = (currentStep / totalSteps) * 100
  const watchedValues = form.watch()

  const completeness = useMemo(() => {
    const values = watchedValues
    const checks = [
      values.title.length >= 10,
      Boolean(values.categoryId),
      values.price > 0,
      values.description.length >= 20,
      values.images.length > 0,
      Boolean(values.province && values.district && values.ward),
    ]
    const done = checks.filter(Boolean).length
    return Math.round((done / checks.length) * 100)
  }, [watchedValues])

  const handleNextStep = async () => {
    let isValid = true
    if (currentStep === 1) {
      isValid = await form.trigger([
        "title",
        "categoryId",
        "conditionGrade",
        "price",
      ])
    } else if (currentStep === 2) {
      isValid = await form.trigger(["description"])
    } else if (currentStep === 3) {
      isValid = await form.trigger(["images"])
    } else if (currentStep === 4) {
      isValid = await form.trigger(["province", "district", "ward"])
    }

    if (!isValid) return
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const onSubmit = async (data: ListingFormData) => {
    setIsSubmitting(true)
    try {
      const cachedProvinces =
        queryClient.getQueryData<Array<{ code: number; name: string }>>([
          "vn-provinces",
        ]) ?? []
      const provinceName =
        cachedProvinces.find((p) => String(p.code) === data.province)?.name ??
        data.province
      const cachedDistricts =
        queryClient.getQueryData<Array<{ code: number; name: string }>>([
          "vn-districts",
          data.province,
        ]) ?? []
      const districtName =
        cachedDistricts.find((d) => String(d.code) === data.district)?.name ??
        data.district
      const cachedWards =
        queryClient.getQueryData<Array<{ code: number; name: string }>>([
          "vn-wards",
          data.district,
        ]) ?? []
      const wardName =
        cachedWards.find((w) => String(w.code) === data.ward)?.name ?? data.ward
      const locationParts = [
        data.addressDetail,
        wardName,
        districtName,
        provinceName,
      ].filter(Boolean)
      const locationSummary = locationParts.join(", ")

      const created = await ListingsService.createListingApiV1ListingsPost({
        requestBody: {
          title: data.title.trim(),
          description: data.description.trim(),
          price: data.price,
          is_negotiable: data.isNegotiable,
          condition_grade: data.conditionGrade,
          category_id: data.categoryId,
          location_summary: locationSummary,
        } as any,
      })

      const uploadTargets = data.images.filter((img) => img.file || img.url)
      if (uploadTargets.length > 0) {
        const files = await Promise.all(
          uploadTargets.map(async (img) => {
            let file = img.file
            if (!file && img.url) {
              const response = await fetch(img.url)
              const blob = await response.blob()
              const ext = blob.type.split("/")[1] || "jpg"
              file = new File([blob], `image.${ext}`, { type: blob.type })
            }
            return file as File
          }),
        )
        const primaryFlags = uploadTargets.map((img) => img.isPrimary)

        try {
          const formData = new FormData()
          files.forEach((f) => formData.append("files", f))
          primaryFlags.forEach((f) =>
            formData.append("is_primary", String(f)),
          )

          const apiBase = (
            import.meta.env.VITE_API_URL || ""
          )
            .replace(/\/+$/, "")
            .replace(/\/api\/v1$/i, "")

          const token = localStorage.getItem("access_token")
          const res = await fetch(
            `${apiBase}/api/v1/listings/${created.id}/images/bulk`,
            {
              method: "POST",
              headers: token
                ? { Authorization: `Bearer ${token}` }
                : ({} as HeadersInit),
              body: formData,
            },
          )

          if (!res.ok) {
            const errBody = await res.json().catch(() => ({}))
            throw new Error(errBody.detail || "Upload failed")
          }
        } catch {
          toast.warning("Tin đã được đăng, nhưng ảnh tải lên thất bại.")
        }
      }

      localStorage.removeItem(DRAFT_KEY)
      toast.success("Đăng tin thành công.")
      queryClient.invalidateQueries({ queryKey: ["admin-pending-listings"] })
      queryClient.invalidateQueries({ queryKey: ["my-listings"] })

      // Fire confetti
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
      })

      setCreatedListingId(created.id)
      setShowSuccessModal(true)
    } catch (error: any) {
      toast.error(
        extractErrorMessage(error, "Đăng tin thất bại. Vui lòng thử lại."),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const title = form.watch("title")
  const price = form.watch("price")
  const province = form.watch("province")
  const images = form.watch("images")
  const condition = form.watch("conditionGrade")
  const isNegotiable = form.watch("isNegotiable")

  // ─── Auto-fill địa chỉ từ hồ sơ cá nhân ─────────────────────────────
  const { user } = useAuth()

  useEffect(() => {
    if (currentStep !== 4) return
    if (!user?.province) return
    const alreadyFilled = ["province", "district", "ward"].every((k) =>
      form.getValues(k as keyof ListingFormData),
    )
    if (alreadyFilled) return

    console.log("🔄 Auto-fill address starting...", {
      province: user.province,
      district: user.district,
      ward: user.ward,
    })

    const doAutoFill = async () => {
      try {
        const res = await fetch("https://provinces.open-api.vn/api/p/")
        const provinces: Array<{ code: number; name: string }> =
          await res.json()
        queryClient.setQueryData(["vn-provinces"], provinces)

        const pMatch = provinces.find(
          (p) => p.name.toLowerCase() === user.province!.toLowerCase(),
        )
        console.log("🏙️ Province match:", pMatch)
        if (!pMatch) return

        form.setValue("province", String(pMatch.code), { shouldDirty: true })

        const dRes = await fetch(
          `https://provinces.open-api.vn/api/p/${pMatch.code}?depth=2`,
        )
        const dData = await dRes.json()
        const dists: Array<{ code: number; name: string }> =
          dData.districts || []
        console.log("📍 Districts loaded:", dists.length)
        queryClient.setQueryData(["vn-districts", String(pMatch.code)], dists)

        if (user.district) {
          const dMatch = dists.find(
            (d) => d.name.toLowerCase() === user.district!.toLowerCase(),
          )
          console.log(
            "📍 District match:",
            dMatch,
            "looking for:",
            user.district,
          )
          if (dMatch) {
            // Yield so React commits the province change + districts useQuery activates
            await new Promise((r) => setTimeout(r, 0))
            form.setValue("district", String(dMatch.code), {
              shouldDirty: true,
            })

            const wRes = await fetch(
              `https://provinces.open-api.vn/api/d/${dMatch.code}?depth=2`,
            )
            const wData = await wRes.json()
            const wds: Array<{ code: number; name: string }> = wData.wards || []
            console.log("🏘️ Wards loaded:", wds.length)
            queryClient.setQueryData(["vn-wards", String(dMatch.code)], wds)

            if (user.ward) {
              const wMatch = wds.find(
                (w) => w.name.toLowerCase() === user.ward!.toLowerCase(),
              )
              console.log("🏘️ Ward match:", wMatch, "looking for:", user.ward)
              if (wMatch) {
                // Yield so React commits the district change + wards useQuery activates
                await new Promise((r) => setTimeout(r, 0))
                form.setValue("ward", String(wMatch.code), {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            }
          }
        }

        if (user.address_detail) {
          form.setValue("addressDetail", user.address_detail, {
            shouldDirty: true,
          })
        }
      } catch (err) {
        console.error("Auto-fill address failed:", err)
      }
    }

    doAutoFill()
  }, [currentStep, user, form, queryClient.setQueryData])

  return (
    <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 md:p-8 shadow-sm text-card-foreground">
      <section className="mb-6 rounded-2xl border border-border bg-card p-5 md:p-7 shadow-sm">
        <Button
          variant="outline"
          size="sm"
          className="mb-4 border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
          onClick={() => navigate({ to: "/items" })}
        >
          <ArrowLeft className="mr-1.5 size-4" />
          Quay lại
        </Button>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Đăng tin mới
        </h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          Bước {currentStep}/{totalSteps}: {steps[currentStep - 1].label}
        </p>
        <div className="mt-4 border-t border-border/50 pt-4">
          <StepIndicator currentStep={currentStep} />
        </div>
        <Progress value={progress} className="mt-4 h-2 bg-muted" />
      </section>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]"
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              event.currentTarget instanceof HTMLFormElement &&
              event.target instanceof HTMLElement &&
              event.target.tagName !== "TEXTAREA" &&
              currentStep < totalSteps
            ) {
              event.preventDefault()
              void handleNextStep()
            }
          }}
        >
          <Card className="border-border bg-card shadow-sm rounded-2xl text-card-foreground">
            <CardHeader>
              <CardTitle className="text-foreground">
                {steps[currentStep - 1].label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentStep === 1 && <CreateListingStep1 form={form} />}
              {currentStep === 2 && <CreateListingStep2 form={form} />}
              {currentStep === 3 && <CreateListingStep3 form={form} />}
              {currentStep === 4 && <CreateListingStep3Location form={form} />}
              {currentStep === 5 && <CreateListingStep4 form={form} />}

              <div className="mt-8 flex justify-between border-t border-border pt-6">
                <Button
                  variant="outline"
                  className="border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  onClick={handlePreviousStep}
                  disabled={currentStep === 1}
                  type="button"
                >
                  <ArrowLeft className="mr-1.5 size-4" />
                  Quay lại
                </Button>

                {currentStep < totalSteps ? (
                  <Button
                    className="bg-[#2563EB] text-white hover:bg-[#1D4ED8] cursor-pointer"
                    onClick={handleNextStep}
                    type="button"
                  >
                    Tiếp theo
                    <ChevronRight className="ml-1.5 size-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#059669] text-white hover:bg-[#047857] font-semibold min-w-[140px] cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Đang đăng...
                      </>
                    ) : (
                      <>
                        <Rocket className="mr-2 size-4" />
                        Đăng tin ngay
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="sticky top-20 h-fit border-border bg-card shadow-sm rounded-2xl text-card-foreground">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold text-foreground">
                Xem trước
              </CardTitle>
              {/* Auto-save badge */}
              <span className="flex items-center gap-1 text-[10px] text-[#059669] font-semibold bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="size-3" />
                Đã lưu nháp
              </span>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 border-t border-border">
              {/* Image preview */}
              <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-muted">
                {images[0]?.url ? (
                  <img
                    src={images[0].url}
                    className="h-full w-full object-cover"
                    alt="Ảnh chính"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2">
                    <Package className="size-10 text-[#D8E2EF]" />
                    <span className="text-xs text-muted-foreground font-medium">
                      Chưa có ảnh
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              {title ? (
                <p className="font-bold text-foreground text-sm line-clamp-2 leading-relaxed">
                  {title}
                </p>
              ) : (
                <p className="text-muted-foreground/60 text-xs italic">
                  Chưa nhập tiêu đề
                </p>
              )}

              {price > 0 ? (
                <p className="text-base font-extrabold text-[#2563EB]">
                  {formatVND(price)}{" "}
                  {isNegotiable && (
                    <span className="text-xs font-normal text-muted-foreground">
                      (Có thương lượng)
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-muted-foreground/60 text-xs italic">
                  Chưa nhập giá
                </p>
              )}

              {condition && (
                <span className="inline-flex rounded-full bg-[#EFF6FF] dark:bg-[#EFF6FF]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#2563EB] dark:text-blue-400 uppercase tracking-wider">
                  {conditionLabel[condition]}
                </span>
              )}
              {province && (
                <p className="text-xs text-muted-foreground font-medium">
                  📍 {province}
                </p>
              )}

              {/* Completeness */}
              <div className="space-y-2 border-t border-border pt-3 mt-4">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-medium">
                    Mức độ hoàn thiện
                  </span>
                  <span
                    className={`font-bold ${completeness >= 80 ? "text-[#059669]" : "text-[#D97706]"}`}
                  >
                    {completeness}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      completeness >= 80 ? "bg-[#059669]" : "bg-[#2563EB]"
                    }`}
                    style={{ width: `${completeness}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>

      {/* Success Dialog */}
      <Dialog
        open={showSuccessModal}
        onOpenChange={(open) => {
          if (!open) {
            navigate({ to: "/items" })
          }
        }}
      >
        <DialogContent className="max-w-md border-emerald-200 dark:border-emerald-900/50 bg-card p-6 text-center rounded-2xl shadow-2xl text-card-foreground">
          <DialogHeader className="flex flex-col items-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#ECFDF5] dark:bg-emerald-950/30 mb-4 shadow-inner">
              <CheckCircle2 className="h-12 w-12 text-[#059669] animate-[scale-in_0.3s_ease-out]" />
            </div>
            <DialogTitle className="text-2xl font-extrabold text-foreground tracking-tight">
              🎉 Đăng tin thành công!
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Tin của bạn đang chờ kiểm duyệt. Chúng tôi sẽ gửi thông báo ngay
              khi tin của bạn được duyệt hiển thị trên chợ.
            </DialogDescription>
          </DialogHeader>

          <div className="my-6 border-t border-border py-4 flex flex-col gap-3">
            <Button
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-95 transition-transform text-white font-bold flex items-center justify-center gap-2 rounded-xl py-5 shadow-lg shadow-blue-500/10 cursor-pointer"
              onClick={() => {
                if (createdListingId) {
                  navigate({
                    to: "/items/$listingId",
                    params: { listingId: createdListingId },
                  })
                }
              }}
            >
              <ShoppingBag className="w-4 h-4" />
              Xem tin đã đăng
            </Button>

            <Button
              variant="outline"
              className="w-full border-border text-muted-foreground font-bold flex items-center justify-center gap-2 rounded-xl py-5 bg-card hover:bg-accent hover:text-accent-foreground cursor-pointer"
              onClick={() => {
                setShowSuccessModal(false)
                setCreatedListingId(null)
                setCurrentStep(1)
                form.reset({
                  title: "",
                  categoryId: "",
                  conditionGrade: "good",
                  price: 0,
                  isNegotiable: false,
                  description: "",
                  province: "",
                  district: "",
                  ward: "",
                  addressDetail: "",
                  images: [],
                  confirmAccuracy: false,
                  agreeTerms: false,
                })
                localStorage.removeItem(DRAFT_KEY)
              }}
            >
              <PlusCircle className="w-4 h-4" />
              Đăng tin khác
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            Nhấn ra ngoài để quay lại chợ.
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export const Route = createFileRoute("/_protected/items/create")({
  component: CreateListingPage,
  head: () => ({
    meta: [
      {
        title: "Đăng tin - ReMarket",
      },
      {
        name: "description",
        content: "Đăng tin bán hàng trên ReMarket",
      },
    ],
  }),
})
