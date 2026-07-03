"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, type Profile } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useApiData } from "@/hooks/useApiData";

const bloodTypes = ["A", "B", "AB", "O"] as const;

const editProfileSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.email("Enter a valid email"),
  phoneNumber: z.string().min(8, "Enter a valid phone number"),
  placeOfBirth: z.string().min(2, "Required"),
  dateOfBirth: z.string().min(1, "Required"),
  address: z.string().min(5, "Required"),
  instagramUsername: z.string().optional(),
  bloodType: z.enum(bloodTypes),
  emergencyContactName: z.string().min(2, "Required"),
  emergencyContactPhoneNumber: z.string().min(8, "Enter a valid phone number"),
  motorbikeName: z.string().min(2, "Required"),
});

type EditProfileValues = z.infer<typeof editProfileSchema>;

function toDefaults(p: Profile): EditProfileValues {
  return {
    name: p.name,
    email: p.email,
    phoneNumber: p.phoneNumber,
    placeOfBirth: p.placeOfBirth,
    dateOfBirth: p.dateofBirth,
    address: p.address,
    instagramUsername: p.instagramUsername,
    bloodType: (bloodTypes as readonly string[]).includes(p.bloodType)
      ? (p.bloodType as EditProfileValues["bloodType"])
      : "O",
    emergencyContactName: p.emergencyContactName,
    emergencyContactPhoneNumber: p.emergencyContactPhoneNumber,
    motorbikeName: p.motorbikeName,
  };
}

export function EditProfileForm() {
  const { user } = useAuth();
  const memberId = user?.id;

  const { data: profile, loading, error } = useApiData(
    useCallback(() => {
      if (!memberId) return Promise.reject(new Error("Not signed in"));
      return api.getProfile(memberId);
    }, [memberId]),
    [memberId]
  );

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (error || !profile) return <p className="text-sm text-destructive">{error ?? "Profile not found."}</p>;

  return <InnerForm defaults={toDefaults(profile)} />;
}

function InnerForm({ defaults }: { defaults: EditProfileValues }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: defaults,
  });

  // NOTE: the backend has no self-service profile-update endpoint yet (only the
  // superadmin role update). This submit is a client-side stub until one exists.
  const onSubmit = async (values: EditProfileValues) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log("Profile updated (not persisted — no backend endpoint yet)", values);
    toast.info("Saving profiles isn't supported by the backend yet.");
    router.push("/dashboard/profile");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" aria-invalid={!!errors.email} {...register("email")} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input id="phoneNumber" type="tel" aria-invalid={!!errors.phoneNumber} {...register("phoneNumber")} />
          {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="instagramUsername">Instagram Username</Label>
          <Input id="instagramUsername" {...register("instagramUsername")} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="placeOfBirth">Place of Birth</Label>
          <Input id="placeOfBirth" aria-invalid={!!errors.placeOfBirth} {...register("placeOfBirth")} />
          {errors.placeOfBirth && <p className="text-sm text-destructive">{errors.placeOfBirth.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input id="dateOfBirth" type="date" aria-invalid={!!errors.dateOfBirth} {...register("dateOfBirth")} />
          {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Textarea id="address" rows={3} aria-invalid={!!errors.address} {...register("address")} />
          {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bloodType">Blood Type</Label>
          <Select
            defaultValue={defaults.bloodType}
            onValueChange={(v) => setValue("bloodType", v as EditProfileValues["bloodType"])}
          >
            <SelectTrigger id="bloodType" className="w-full" aria-invalid={!!errors.bloodType}>
              <SelectValue placeholder="Select blood type" />
            </SelectTrigger>
            <SelectContent>
              {bloodTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.bloodType && <p className="text-sm text-destructive">Required</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="motorbikeName">Motorbike Name</Label>
          <Input id="motorbikeName" aria-invalid={!!errors.motorbikeName} {...register("motorbikeName")} />
          {errors.motorbikeName && <p className="text-sm text-destructive">{errors.motorbikeName.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
          <Input
            id="emergencyContactName"
            aria-invalid={!!errors.emergencyContactName}
            {...register("emergencyContactName")}
          />
          {errors.emergencyContactName && (
            <p className="text-sm text-destructive">{errors.emergencyContactName.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="emergencyContactPhoneNumber">Emergency Contact Phone</Label>
          <Input
            id="emergencyContactPhoneNumber"
            type="tel"
            aria-invalid={!!errors.emergencyContactPhoneNumber}
            {...register("emergencyContactPhoneNumber")}
          />
          {errors.emergencyContactPhoneNumber && (
            <p className="text-sm text-destructive">{errors.emergencyContactPhoneNumber.message}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard/profile")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
