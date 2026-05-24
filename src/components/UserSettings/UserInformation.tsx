import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Camera, MapPin, Sparkles } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { UsersService, type UserUpdateMe } from "@/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import { Textarea } from "@/components/ui/textarea"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { cn } from "@/lib/utils"
import { handleError } from "@/utils"

// Beautiful modern avatar presets
const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80",
]

const formSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(30)
    .optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(15, "Phone number is too long").optional(),
  bio: z.string().max(200, "Bio cannot exceed 200 characters").optional(),
  avatar_url: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  ward: z.string().optional(),
  address_detail: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

const UserInformation = () => {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [editMode, setEditMode] = useState(false)
  const { user: currentUser } = useAuth()
  const [showPresets, setShowPresets] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      full_name: currentUser?.full_name ?? "",
      email: currentUser?.email ?? "",
      phone: currentUser?.phone ?? "",
      bio: currentUser?.bio ?? "",
      avatar_url: currentUser?.avatar_url ?? "",
      province: currentUser?.province ?? "",
      district: currentUser?.district ?? "",
      ward: currentUser?.ward ?? "",
      address_detail: currentUser?.address_detail ?? "",
    },
  })

  const toggleEditMode = () => {
    setEditMode(!editMode)
    setShowPresets(false)
  }

  const mutation = useMutation({
    mutationFn: (data: UserUpdateMe) =>
      UsersService.updateUserMe({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Profile updated successfully")
      toggleEditMode()
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  const onSubmit = (data: FormData) => {
    const updateData: UserUpdateMe = {}

    // Only include updated fields
    if (data.full_name !== currentUser?.full_name)
      updateData.full_name = data.full_name
    if (data.phone !== currentUser?.phone) updateData.phone = data.phone
    if (data.bio !== currentUser?.bio) updateData.bio = data.bio
    if (data.avatar_url !== currentUser?.avatar_url)
      updateData.avatar_url = data.avatar_url
    if (data.province !== currentUser?.province)
      updateData.province = data.province
    if (data.district !== currentUser?.district)
      updateData.district = data.district
    if (data.ward !== currentUser?.ward) updateData.ward = data.ward
    if (data.address_detail !== currentUser?.address_detail)
      updateData.address_detail = data.address_detail

    mutation.mutate(updateData)
  }

  const onCancel = () => {
    form.reset()
    toggleEditMode()
  }

  const initials = (currentUser?.full_name || "RM").slice(0, 2).toUpperCase()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-blue-100 pb-4">
        <div>
          <h3 className="font-display text-lg font-bold text-blue-950">
            User Profile
          </h3>
          <p className="text-xs text-blue-900/60">
            Update your avatar, bio, location, and credentials.
          </p>
        </div>
        {!editMode && (
          <Button
            type="button"
            onClick={toggleEditMode}
            className="rmk-glow-button h-9 px-4 text-xs"
          >
            Edit Profile
          </Button>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative">
              <Avatar className="size-20 border-2 border-blue-200 shadow-md">
                <AvatarImage src={form.watch("avatar_url") || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-sky-100 text-lg font-bold text-blue-700">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {editMode && (
                <button
                  type="button"
                  onClick={() => setShowPresets(!showPresets)}
                  className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border border-blue-200 bg-white shadow-md hover:bg-blue-50"
                  title="Choose preset avatar"
                >
                  <Camera className="size-3.5 text-blue-700" />
                </button>
              )}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-blue-950">
                  Profile Photo
                </p>
                {editMode && (
                  <Badge
                    variant="outline"
                    className="border-blue-200 bg-blue-50 text-[10px] text-blue-700"
                  >
                    <Sparkles className="mr-1 size-2.5" /> Preset Available
                  </Badge>
                )}
              </div>
              <p className="text-xs text-blue-900/60">
                Choose a stunning preset or provide a custom image URL.
              </p>

              {editMode && (
                <div className="space-y-3 pt-1">
                  {showPresets && (
                    <div className="flex flex-wrap gap-2 rounded-xl border border-blue-100 bg-blue-50/40 p-2">
                      {PRESET_AVATARS.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            form.setValue("avatar_url", url, {
                              shouldDirty: true,
                            })
                          }
                          className={cn(
                            "size-10 overflow-hidden rounded-full border-2 transition hover:scale-105",
                            form.watch("avatar_url") === url
                              ? "border-blue-600 scale-105"
                              : "border-transparent",
                          )}
                        >
                          <img
                            src={url}
                            alt={`Preset ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                  <FormField
                    control={form.control}
                    name="avatar_url"
                    render={({ field }) => (
                      <FormItem className="max-w-md">
                        <FormControl>
                          <Input
                            placeholder="Or paste image URL here..."
                            type="url"
                            className="h-8 text-xs"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Full Name */}
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-blue-900/70 uppercase">
                    Full name
                  </FormLabel>
                  <FormControl>
                    {editMode ? (
                      <Input
                        placeholder="Enter your full name"
                        {...field}
                        className="border-blue-100 bg-white/50 focus:bg-white"
                      />
                    ) : (
                      <div className="rounded-xl border border-blue-100 bg-blue-50/20 px-3 py-2 text-sm text-blue-950 font-medium">
                        {field.value || "N/A"}
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email (Always Read-only with verified status) */}
            <FormItem>
              <FormLabel className="text-xs font-bold text-blue-900/70 uppercase">
                Email address
              </FormLabel>
              <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/20 px-3 py-2 text-sm text-blue-950 font-medium">
                <span className="truncate">{currentUser?.email}</span>
                <Badge className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700 font-semibold">
                  Verified
                </Badge>
              </div>
              <FormDescription className="text-[10px] text-blue-900/50">
                Used for transactional notifications and account recovery.
              </FormDescription>
            </FormItem>

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-blue-900/70 uppercase">
                    Phone number
                  </FormLabel>
                  <FormControl>
                    {editMode ? (
                      <Input
                        placeholder="+84 90 123 4567"
                        {...field}
                        className="border-blue-100 bg-white/50 focus:bg-white"
                      />
                    ) : (
                      <div className="rounded-xl border border-blue-100 bg-blue-50/20 px-3 py-2 text-sm text-blue-950 font-medium">
                        {field.value || "Not configured"}
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bio */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-xs font-bold text-blue-900/70 uppercase">
                    Bio / Description
                  </FormLabel>
                  <FormControl>
                    {editMode ? (
                      <div className="relative">
                        <Textarea
                          placeholder="Tell potential buyers about yourself or your store..."
                          {...field}
                          maxLength={200}
                          className="min-h-[80px] border-blue-100 bg-white/50 focus:bg-white pr-10"
                        />
                        <span className="absolute bottom-2 right-3 text-[10px] text-blue-900/40 font-mono">
                          {(field.value || "").length}/200
                        </span>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-blue-100 bg-blue-50/20 px-3 py-2 text-sm text-blue-950 whitespace-pre-wrap min-h-[50px]">
                        {field.value || "No bio description configured yet."}
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Location details */}
          <div className="space-y-4 border-t border-blue-100 pt-6">
            <div className="flex items-center gap-1.5 text-blue-950 font-semibold">
              <MapPin className="size-4 text-blue-700" />
              <span className="text-sm font-bold">Trading Location</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {/* Province */}
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold text-blue-900/70 uppercase">
                      Province / City
                    </FormLabel>
                    <FormControl>
                      {editMode ? (
                        <Input
                          placeholder="e.g. Hồ Chí Minh"
                          {...field}
                          className="border-blue-100 bg-white/50 focus:bg-white"
                        />
                      ) : (
                        <div className="rounded-xl border border-blue-100 bg-blue-50/20 px-3 py-2 text-xs text-blue-950 font-medium">
                          {field.value || "N/A"}
                        </div>
                      )}
                    </FormControl>
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
                    <FormLabel className="text-[10px] font-bold text-blue-900/70 uppercase">
                      District
                    </FormLabel>
                    <FormControl>
                      {editMode ? (
                        <Input
                          placeholder="e.g. Quận 1"
                          {...field}
                          className="border-blue-100 bg-white/50 focus:bg-white"
                        />
                      ) : (
                        <div className="rounded-xl border border-blue-100 bg-blue-50/20 px-3 py-2 text-xs text-blue-950 font-medium">
                          {field.value || "N/A"}
                        </div>
                      )}
                    </FormControl>
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
                    <FormLabel className="text-[10px] font-bold text-blue-900/70 uppercase">
                      Ward
                    </FormLabel>
                    <FormControl>
                      {editMode ? (
                        <Input
                          placeholder="e.g. Phường Bến Nghé"
                          {...field}
                          className="border-blue-100 bg-white/50 focus:bg-white"
                        />
                      ) : (
                        <div className="rounded-xl border border-blue-100 bg-blue-50/20 px-3 py-2 text-xs text-blue-950 font-medium">
                          {field.value || "N/A"}
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Address detail */}
            <FormField
              control={form.control}
              name="address_detail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold text-blue-900/70 uppercase">
                    Street Address Detail
                  </FormLabel>
                  <FormControl>
                    {editMode ? (
                      <Input
                        placeholder="e.g. 123 Nguyễn Huệ"
                        {...field}
                        className="border-blue-100 bg-white/50 focus:bg-white"
                      />
                    ) : (
                      <div className="rounded-xl border border-blue-100 bg-blue-50/20 px-3 py-2 text-sm text-blue-950 font-medium">
                        {field.value || "N/A"}
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Form Actions */}
          {editMode && (
            <div className="flex gap-3 border-t border-blue-100 pt-4">
              <LoadingButton
                type="submit"
                loading={mutation.isPending}
                disabled={!form.formState.isDirty}
                className="rmk-glow-button px-6 text-xs h-9"
              >
                Save Changes
              </LoadingButton>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={mutation.isPending}
                className="border-blue-200 bg-white text-xs h-9"
              >
                Cancel
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  )
}

export default UserInformation
