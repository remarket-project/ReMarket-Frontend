import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Import step components
import CreateListingStep1 from "@/components/Items/Step1BasicInfo";
import CreateListingStep2 from "@/components/Items/Step2Description";
import CreateListingStep3 from "@/components/Items/Step3Images";
import CreateListingStep3Location from "@/components/Items/Step3Location";
import CreateListingStep4 from "@/components/Items/Step4Review";

// Form schema for multi-step form
const listingFormSchema = z.object({
  title: z.string().min(10).max(100),
  categoryId: z.string().uuid(),
  conditionGrade: z.enum(["MINT", "LIKE_NEW", "GOOD", "FAIR", "POOR"]),
  price: z.number().positive(),
  isNegotiable: z.boolean().default(false),
  description: z.string().min(20).max(2000),
  province: z.string().min(1),
  district: z.string().min(1),
  ward: z.string().min(1),
  addressDetail: z.string().optional(),
  images: z.array(z.object({
    file: z.instanceof(File).optional(),
    url: z.string().optional(),
    isPrimary: z.boolean().default(false),
  })).min(1, "At least 1 image required"),
});

type ListingFormData = z.infer<typeof listingFormSchema>;

function CreateListingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      categoryId: "",
      conditionGrade: "GOOD",
      price: 0,
      isNegotiable: false,
      description: "",
      province: "",
      district: "",
      ward: "",
      addressDetail: "",
      images: [],
    },
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const handleNextStep = async () => {
    // Validate current step before moving to next
    let isValid = true;

    if (currentStep === 1) {
      isValid = await form.trigger([
        "title",
        "categoryId",
        "conditionGrade",
        "price",
      ]);
    } else if (currentStep === 2) {
      isValid = await form.trigger(["description"]);
    } else if (currentStep === 3) {
      isValid = await form.trigger(["images"]);
    } else if (currentStep === 4) {
      isValid = await form.trigger(["province", "district", "ward"]);
    }

    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onSubmit = async (data: ListingFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Submit to API
      console.log("Submitting form data:", data);
      // await ListingsService.createListingApiV1ListingsPost(data);
      // navigate({ to: "/items" });
    } catch (error) {
      console.error("Error creating listing:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Basic Information";
      case 2:
        return "Description & Details";
      case 3:
        return "Images & Media";
      case 4:
        return "Location";
      case 5:
        return "Review & Publish";
      default:
        return "List New Item";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4"
            onClick={() => navigate({ to: "/items" })}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Items
          </Button>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {currentStep === totalSteps ? "Review Listing" : "List New Item"}
          </h1>

          {currentStep < totalSteps && (
            <p className="text-gray-600 dark:text-gray-400">
              Step {currentStep} of {totalSteps}: {getStepTitle()}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <Progress value={progress} className="mb-8 h-2" />

        {/* Form Container */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>{getStepTitle()}</CardTitle>
              </CardHeader>
              <CardContent>
                {currentStep === 1 && <CreateListingStep1 form={form} />}
                {currentStep === 2 && <CreateListingStep2 form={form} />}
                {currentStep === 3 && <CreateListingStep3 form={form} />}
                {currentStep === 4 && <CreateListingStep3Location form={form} />}
                {currentStep === 5 && <CreateListingStep4 form={form} />}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePreviousStep}
                    disabled={currentStep === 1}
                    type="button"
                  >
                    ← Previous
                  </Button>

                  {currentStep < totalSteps ? (
                    <Button onClick={handleNextStep} type="button">
                      Next <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? "Publishing..." : "Publish Listing"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {form.watch("title") && (
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Title
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {form.watch("title")}
                        </p>
                      </div>
                    )}

                    {form.watch("price") > 0 && (
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Price
                        </div>
                        <p className="font-semibold text-green-600 dark:text-green-400 text-lg">
                          ${form.watch("price").toFixed(2)}
                        </p>
                        {form.watch("isNegotiable") && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            (Negotiable)
                          </span>
                        )}
                      </div>
                    )}

                    {form.watch("conditionGrade") && (
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Condition
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {form.watch("conditionGrade")}
                        </p>
                      </div>
                    )}

                    {form.watch("province") && (
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Location
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {form.watch("province")}
                        </p>
                      </div>
                    )}

                    {form.watch("images")?.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          Images ({form.watch("images").length})
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {form.watch("images").map((img: any, idx: number) => (
                            <div
                              key={idx}
                              className="relative bg-gray-200 dark:bg-gray-700 aspect-square rounded overflow-hidden"
                            >
                              {img.url && (
                                <img
                                  src={img.url}
                                  alt={`Preview ${idx}`}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
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
});
