import { createFileRoute } from "@tanstack/react-router";
import {
  BadgeCheck,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Wallet,
} from "lucide-react";

import ChangePassword from "@/components/UserSettings/ChangePassword";
import DeleteAccount from "@/components/UserSettings/DeleteAccount";
import UserInformation from "@/components/UserSettings/UserInformation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useAuth from "@/hooks/useAuth";

const tabsConfig = [
  { value: "my-profile", title: "My profile", component: UserInformation },
  { value: "password", title: "Password", component: ChangePassword },
  { value: "danger-zone", title: "Danger zone", component: DeleteAccount },
];

export const Route = createFileRoute("/_layout/settings")({
  component: UserSettings,
  head: () => ({
    meta: [
      {
        title: "Settings - ReMarket",
      },
    ],
  }),
});

function UserSettings() {
  const { user: currentUser } = useAuth();
  if (!currentUser) {
    return (
      <div className="rounded-3xl border border-blue-200/70 bg-white/85 p-8 text-blue-900">
        Loading account profile...
      </div>
    );
  }

  const profile = currentUser;
  const finalTabs =
    profile.role === "admin" ? tabsConfig.slice(0, 3) : tabsConfig;

  const trustRows = [
    {
      icon: ShieldCheck,
      label: "Profile completeness",
      value: "82%",
      tone: "border-blue-200 bg-blue-50 text-blue-700",
    },
    {
      icon: BadgeCheck,
      label: "Verification status",
      value: "Pending",
      tone: "border-amber-200 bg-amber-50 text-amber-700",
    },
    {
      icon: Star,
      label: "Marketplace rating",
      value: "4.8 (120)",
      tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    {
      icon: Wallet,
      label: "Escrow completion",
      value: "99.1%",
      tone: "border-sky-200 bg-sky-50 text-sky-700",
    },
  ] as const;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-200/60 bg-white/70 p-4 shadow-2xl shadow-blue-100/60 backdrop-blur-sm sm:p-6 md:p-8">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="rmk-wave-layer rmk-wave-back" />
        <div className="rmk-wave-layer rmk-wave-front" />
        <div className="rmk-grid-fade" />
      </div>

      <section className="rounded-3xl border border-blue-200/70 bg-white/85 p-5 shadow-xl shadow-blue-100/70 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Badge
              className="border-blue-200 bg-blue-50 text-blue-700"
              variant="outline"
            >
              <Sparkles className="mr-1.5 size-3" />
              Identity and Security
            </Badge>
            <h1 className="font-display text-2xl font-bold tracking-tight text-blue-950 md:text-3xl">
              Account Settings
            </h1>
            <p className="max-w-2xl text-sm text-blue-900/75 md:text-base">
              Manage your profile, credentials, and trust signals so buyers and
              sellers can transact with confidence.
            </p>
          </div>
          <div className="rounded-2xl border border-blue-200/80 bg-blue-50/60 px-4 py-3 text-xs text-blue-900/75">
            Member since {new Date(profile.created_at).getFullYear()}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <Card className="border-blue-200/80 bg-white/90 shadow-lg shadow-blue-100/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-blue-950">Profile Snapshot</CardTitle>
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-50 text-blue-700"
            >
              Live summary
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-blue-200/70 bg-white/80 p-3">
                <p className="text-xs text-blue-900/65">Display name</p>
                <p className="text-sm font-semibold text-blue-950">
                  {profile.full_name || "ReMarket User"}
                </p>
              </div>
              <div className="rounded-xl border border-blue-200/70 bg-white/80 p-3">
                <p className="text-xs text-blue-900/65">Primary email</p>
                <p className="text-sm font-semibold text-blue-950">
                  {profile.email}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-blue-900/80">
              <p className="flex items-center gap-2">
                <Mail className="size-4 text-blue-700" />
                Keep your email current to receive escrow and order alerts.
              </p>
              <p className="flex items-center gap-2">
                <Phone className="size-4 text-blue-700" />
                Add phone verification to improve trust and faster deal closing.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200/80 bg-white/90 shadow-lg shadow-blue-100/60">
          <CardHeader>
            <CardTitle className="text-blue-950">Trust Signals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {trustRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between rounded-xl border border-blue-200/70 bg-white/85 p-2.5"
              >
                <span className="flex items-center gap-2 text-blue-900/80">
                  <row.icon className="size-4 text-blue-700" />
                  {row.label}
                </span>
                <Badge className={row.tone}>{row.value}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Tabs defaultValue="my-profile" className="mt-6 space-y-4">
        <TabsList className="h-auto w-full justify-start border border-blue-200/70 bg-white/85 p-1.5">
          {finalTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:rmk-glow-button"
            >
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {finalTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <div className="rounded-2xl border border-blue-200/75 bg-white/92 p-4 shadow-lg shadow-blue-100/60">
              <tab.component />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
