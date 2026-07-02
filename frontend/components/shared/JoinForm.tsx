"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";
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

const bloodTypes = ["A", "B", "AB", "O"] as const;

const joinSchema = z.object({
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

type JoinValues = z.infer<typeof joinSchema>;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function JoinForm() {
  const [selfie, setSelfie] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    setSelfie(file);
    setSelfiePreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<JoinValues>({ resolver: zodResolver(joinSchema) });

  // TODO: Wire up real Google Sign-In and set the resulting ID token here.
  const googleToken = "";

  // TODO: Replace with POST /register (see api_contract.json). Needs a
  // valid googleToken from Google Sign-In before it will succeed.
  const onSubmit = async (values: JoinValues) => {
    if (!googleToken) {
      toast.error("Sign in with Google before submitting.");
      return;
    }

    const motorbikeSelfieBlob = selfie ? await fileToBase64(selfie) : "";
    const payload = { ...values, motorbikeSelfieBlob, googleToken };
    console.log("Membership application", payload);
    toast.success("Application submitted!");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Button type="button" variant="outline" disabled className="self-start">
        Sign in with Google (coming soon)
      </Button>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" {...register("name")} />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input id="phoneNumber" type="tel" {...register("phoneNumber")} />
          {errors.phoneNumber && (
            <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="instagramUsername">Instagram Username</Label>
          <Input id="instagramUsername" {...register("instagramUsername")} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="placeOfBirth">Place of Birth</Label>
          <Input id="placeOfBirth" {...register("placeOfBirth")} />
          {errors.placeOfBirth && (
            <p className="text-sm text-destructive">{errors.placeOfBirth.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
          {errors.dateOfBirth && (
            <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Textarea id="address" rows={3} {...register("address")} />
          {errors.address && (
            <p className="text-sm text-destructive">{errors.address.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bloodType">Blood Type</Label>
          <Select onValueChange={(v) => setValue("bloodType", v as JoinValues["bloodType"])}>
            <SelectTrigger id="bloodType" className="w-full">
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
            <p className="text-sm text-destructive">Required</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="motorbikeName">Motorbike Name</Label>
          <Input id="motorbikeName" {...register("motorbikeName")} />
          {errors.motorbikeName && (
            <p className="text-sm text-destructive">{errors.motorbikeName.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
          <Input id="emergencyContactName" {...register("emergencyContactName")} />
          {errors.emergencyContactName && (
            <p className="text-sm text-destructive">{errors.emergencyContactName.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="emergencyContactPhoneNumber">Emergency Contact Phone</Label>
          <Input
            id="emergencyContactPhoneNumber"
            type="tel"
            {...register("emergencyContactPhoneNumber")}
          />
          {errors.emergencyContactPhoneNumber && (
            <p className="text-sm text-destructive">
              {errors.emergencyContactPhoneNumber.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Motorbike Selfie</Label>
        <div
          {...getRootProps()}
          className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground hover:bg-muted"
        >
          <input {...getInputProps()} />
          {selfiePreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selfiePreview}
              alt="Motorbike selfie preview"
              className="h-32 w-32 rounded-lg object-cover"
            />
          ) : (
            <>
              <UploadCloud className="size-6" />
              {isDragActive ? "Drop the photo here" : "Drag & drop or click to upload a photo"}
            </>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="self-start">
        {isSubmitting ? "Submitting..." : "Submit Application"}
      </Button>
    </form>
  );
}
