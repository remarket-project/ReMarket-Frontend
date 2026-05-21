import { zodResolver } from "@hookform/resolvers/zod"
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
  Sparkles,
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

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
    .min(1, "At least 1 image required"),
  confirmAccuracy: z
    .boolean()
    .refine((value) => value, "Please confirm your listing accuracy."),
  agreeTerms: z
    .boolean()
    .refine(
      (value) => value,
      "Please agree to seller terms before publishing.",
    ),
})

type ListingFormData = z.infer<typeof listingFormSchema>

const steps = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Description" },
  { id: 3, label: "Images" },
  { id: 4, label: "Location" },
  { id: 5, label: "Review" },
]

const conditionLabel: Record<ListingFormData["conditionGrade"], string> = {
  brand_new: "Brand New",
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {steps.map((step, idx) => (
        <div key={step.id} className="flex items-center gap-2">
          <div
            className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
              currentStep > step.id
                ? "bg-emerald-500 text-white"
                : currentStep === step.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-500"
            }`}
          >
            {currentStep > step.id ? <Check className="size-4" /> : step.id}
          </div>
          <span className="hidden whitespace-nowrap text-xs text-blue-900/75 sm:block">
            {step.label}
          </span>
          {idx < steps.length - 1 && (
            <div className="h-px w-5 bg-gray-200 sm:w-8" />
          )}
        </div>
      ))}
    </div>
  )
}

function CreateListingPage() {
  const navigate = useNavigate()
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
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?"
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
      const created = await ListingsService.createListingApiV1ListingsPost({
        requestBody: {
          title: data.title.trim(),
          description: data.description.trim(),
          price: data.price,
          is_negotiable: data.isNegotiable,
          condition_grade: data.conditionGrade,
          category_id: data.categoryId,
        },
      })

      const uploadTargets = data.images.filter((img) => img.file)
      if (uploadTargets.length > 0) {
        const uploadResults = await Promise.allSettled(
          uploadTargets.map((img) =>
            ListingsService.uploadListingImageApiV1ListingsListingIdImagesPost({
              listingId: created.id,
              isPrimary: img.isPrimary,
              formData: { file: img.file as any },
            }),
          ),
        )

        const failedUploads = uploadResults.filter(
          (result) => result.status === "rejected",
        ).length
        if (failedUploads > 0) {
          toast.warning(
            `Listing published, but ${failedUploads} image(s) failed to upload.`,
          )
        }
      }

      localStorage.removeItem(DRAFT_KEY)
      toast.success("Listing published successfully.")

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
        error?.body?.detail || "Failed to publish listing. Please try again.",
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

  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-200/60 bg-white/70 p-4 shadow-2xl shadow-blue-100/60 backdrop-blur-sm sm:p-6 md:p-8">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="rmk-wave-layer rmk-wave-back" />
        <div className="rmk-wave-layer rmk-wave-front" />
        <div className="rmk-grid-fade" />
      </div>

      <section className="mb-6 rounded-3xl border border-blue-200/70 bg-white/85 p-5 shadow-xl shadow-blue-100/70 md:p-7">
        <Button
          variant="outline"
          size="sm"
          className="mb-4 border-blue-200 bg-white/90"
          onClick={() => navigate({ to: "/items" })}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Items
        </Button>
        <Badge
          variant="outline"
          className="border-blue-200 bg-blue-50 text-blue-700"
        >
          <Sparkles className="mr-1.5 size-3" />
          Seller Wizard
        </Badge>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-blue-950 md:text-3xl">
          List New Item
        </h1>
        <p className="mt-1 text-sm text-blue-900/75 md:text-base">
          Step {currentStep} of {totalSteps}: {steps[currentStep - 1].label}
        </p>
        <div className="mt-4">
          <StepIndicator currentStep={currentStep} />
        </div>
        <Progress value={progress} className="rmk-progress mt-4 h-2" />
      </section>

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
        <Card className="border-blue-200/80 bg-white/95 shadow-lg shadow-blue-100/70">
          <CardHeader>
            <CardTitle className="text-blue-950">
              {steps[currentStep - 1].label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && <CreateListingStep1 form={form} />}
            {currentStep === 2 && <CreateListingStep2 form={form} />}
            {currentStep === 3 && <CreateListingStep3 form={form} />}
            {currentStep === 4 && <CreateListingStep3Location form={form} />}
            {currentStep === 5 && <CreateListingStep4 form={form} />}

            <div className="mt-8 flex justify-between border-t border-blue-100 pt-6">
              <Button
                variant="outline"
                className="border-blue-200 bg-white/90"
                onClick={handlePreviousStep}
                disabled={currentStep === 1}
                type="button"
              >
                ← Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  className="rmk-glow-button"
                  onClick={handleNextStep}
                  type="button"
                >
                  Next <ChevronRight className="ml-2 size-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Rocket className="mr-2 size-4" />
                      Publish Listing
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="sticky top-4 h-fit border-blue-200/80 bg-white/95 shadow-lg shadow-blue-100/70">
          <CardHeader>
            <CardTitle className="text-lg text-blue-950">Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {images[0]?.url ? (
              <img
                src={images[0].url}
                className="h-48 w-full rounded-lg object-cover"
                alt="Primary preview"
              />
            ) : (
              <div className="flex h-48 w-full items-center justify-center rounded-lg bg-blue-50">
                <Package className="size-10 text-blue-300" />
              </div>
            )}

            {title && <p className="font-semibold text-blue-950">{title}</p>}
            {price > 0 && (
              <p className="text-lg font-bold text-emerald-700">
                ${price.toFixed(2)} {isNegotiable ? "(Negotiable)" : ""}
              </p>
            )}
            {condition && (
              <Badge
                variant="outline"
                className="border-blue-200 bg-blue-50 text-blue-700"
              >
                {conditionLabel[condition]}
              </Badge>
            )}
            {province && (
              <p className="text-xs text-blue-900/60">📍 Location selected</p>
            )}

            <div className="space-y-1">
              <p className="text-xs font-semibold text-blue-900/70">
                Listing completeness
              </p>
              <Progress value={completeness} className="h-1.5" />
              <p className="text-xs text-blue-900/60">
                {completeness}% complete
              </p>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Success Dialog */}
      <Dialog
        open={showSuccessModal}
        onOpenChange={(open) => {
          if (!open) {
            navigate({ to: "/items" })
          }
        }}
      >
        <DialogContent className="max-w-md border-emerald-100 bg-white p-6 dark:bg-zinc-950 text-center rounded-2xl shadow-2xl">
          <DialogHeader className="flex flex-col items-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/50 mb-4 animate-bounce">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-500" />
            </div>
            <DialogTitle className="text-2xl font-bold text-zinc-900 dark:text-white">
              Listing Published!
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Congratulations! Your item is now live on ReMarket's escrow-backed
              marketplace.
            </DialogDescription>
          </DialogHeader>

          <div className="my-6 border-t border-b border-zinc-100 dark:border-zinc-800 py-4 flex flex-col gap-3">
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2 rounded-xl py-5"
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
              View Your Listing
            </Button>

            <Button
              variant="outline"
              className="w-full border-zinc-200 text-zinc-700 dark:text-zinc-300 font-semibold flex items-center justify-center gap-2 rounded-xl py-5 bg-white hover:bg-zinc-50"
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
              Create Another Listing
            </Button>
          </div>

          <div className="text-xs text-zinc-400">
            Or click outside to return to the marketplace.
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export const Route = createFileRoute("/_layout/items/create")({
  component: CreateListingPage,
  head: () => ({
    meta: [
      {
        title: "Create Listing - ReMarket",
      },
      {
        name: "description",
        content: "List a new item for sale on ReMarket",
      },
    ],
  }),
})
