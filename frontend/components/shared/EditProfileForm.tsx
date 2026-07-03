"use client";

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
import { mockProfile } from "@/lib/mock-profile";

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

export function EditProfileForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: mockProfile,
  });

  // TODO: No self-service profile-update endpoint exists yet in
  // api_contract.json (only the admin-only "Update Member" for roles).
  // Wire this up once one is added.
  const onSubmit = async (values: EditProfileValues) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("Profile updated", values);
    toast.success("Profile updated");
    router.push("/dashboard/profile");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            {...register("name")}
          />
          {errors.name && (
            <p id="name-error" className="text-sm text-destructive">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            type="tel"
            aria-invalid={!!errors.phoneNumber}
            aria-describedby={errors.phoneNumber ? "phoneNumber-error" : undefined}
            {...register("phoneNumber")}
          />
          {errors.phoneNumber && (
            <p id="phoneNumber-error" className="text-sm text-destructive">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="instagramUsername">Instagram Username</Label>
          <Input id="instagramUsername" {...register("instagramUsername")} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="placeOfBirth">Place of Birth</Label>
          <Input
            id="placeOfBirth"
            aria-invalid={!!errors.placeOfBirth}
            aria-describedby={errors.placeOfBirth ? "placeOfBirth-error" : undefined}
            {...register("placeOfBirth")}
          />
          {errors.placeOfBirth && (
            <p id="placeOfBirth-error" className="text-sm text-destructive">
              {errors.placeOfBirth.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            aria-invalid={!!errors.dateOfBirth}
            aria-describedby={errors.dateOfBirth ? "dateOfBirth-error" : undefined}
            {...register("dateOfBirth")}
          />
          {errors.dateOfBirth && (
            <p id="dateOfBirth-error" className="text-sm text-destructive">
              {errors.dateOfBirth.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            rows={3}
            aria-invalid={!!errors.address}
            aria-describedby={errors.address ? "address-error" : undefined}
            {...register("address")}
          />
          {errors.address && (
            <p id="address-error" className="text-sm text-destructive">
              {errors.address.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bloodType">Blood Type</Label>
          <Select
            defaultValue={mockProfile.bloodType}
            onValueChange={(v) => setValue("bloodType", v as EditProfileValues["bloodType"])}
          >
            <SelectTrigger
              id="bloodType"
              className="w-full"
              aria-invalid={!!errors.bloodType}
              aria-describedby={errors.bloodType ? "bloodType-error" : undefined}
            >
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
          {errors.bloodType && (
            <p id="bloodType-error" className="text-sm text-destructive">
              Required
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="motorbikeName">Motorbike Name</Label>
          <Input
            id="motorbikeName"
            aria-invalid={!!errors.motorbikeName}
            aria-describedby={errors.motorbikeName ? "motorbikeName-error" : undefined}
            {...register("motorbikeName")}
          />
          {errors.motorbikeName && (
            <p id="motorbikeName-error" className="text-sm text-destructive">
              {errors.motorbikeName.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
          <Input
            id="emergencyContactName"
            aria-invalid={!!errors.emergencyContactName}
            aria-describedby={errors.emergencyContactName ? "emergencyContactName-error" : undefined}
            {...register("emergencyContactName")}
          />
          {errors.emergencyContactName && (
            <p id="emergencyContactName-error" className="text-sm text-destructive">
              {errors.emergencyContactName.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="emergencyContactPhoneNumber">Emergency Contact Phone</Label>
          <Input
            id="emergencyContactPhoneNumber"
            type="tel"
            aria-invalid={!!errors.emergencyContactPhoneNumber}
            aria-describedby={
              errors.emergencyContactPhoneNumber ? "emergencyContactPhoneNumber-error" : undefined
            }
            {...register("emergencyContactPhoneNumber")}
          />
          {errors.emergencyContactPhoneNumber && (
            <p id="emergencyContactPhoneNumber-error" className="text-sm text-destructive">
              {errors.emergencyContactPhoneNumber.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/profile")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
