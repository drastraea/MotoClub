"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { LogIn, UploadCloud } from "lucide-react";
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
import { cn } from "@/lib/utils";

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

type GoogleAccount = { name: string; email: string };

function StepIndicator({ step }: { step: 1 | 2 }) {
  const steps = ["Sign in with Google", "Your details"];
  return (
    <ol className="flex items-center gap-4 text-sm font-medium">
      {steps.map((label, i) => {
        const n = (i + 1) as 1 | 2;
        const active = n === step;
        const done = n < step;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full text-xs",
                done && "bg-primary text-primary-foreground",
                active && "bg-primary/10 text-primary ring-1 ring-primary",
                !done && !active && "bg-muted text-muted-foreground"
              )}
            >
              {n}
            </span>
            <span className={active ? "text-foreground" : "text-muted-foreground"}>
              {label}
            </span>
            {i < steps.length - 1 && <span className="mx-2 h-px w-8 bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}

export function JoinForm() {
  const [account, setAccount] = useState<GoogleAccount | null>(null);
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

  // TODO: Replace with real Google Identity Services sign-in. The
  // resulting ID token is what /register needs as `googleToken`.
  const handleGoogleSignIn = () => {
    const mockAccount = { name: "Jordan Rider", email: "jordan.rider@example.com" };
    setAccount(mockAccount);
    setValue("name", mockAccount.name);
    setValue("email", mockAccount.email);
    toast.success("Signed in with Google (mock)");
  };

  // TODO: Replace with POST /register. The real Go handler
  // (backend/internal/handler/auth_handler.go) expects
  // `motorbikeSelfieLinkPath` - a path/URL to an already-hosted image, not
  // a raw upload - and /register itself is unauthenticated. There's no
  // visible public endpoint yet for an unauthenticated applicant to upload
  // a selfie and get that link back, so this can't be wired for real until
  // the backend adds one. Currently base64-encoding the file client-side
  // as a placeholder for that missing link.
  const onSubmit = async (values: JoinValues) => {
    const motorbikeSelfieLinkPath = selfie ? await fileToBase64(selfie) : "";
    const payload = { ...values, motorbikeSelfieLinkPath, googleToken: "mock-google-id-token" };
    console.log("Membership application", payload);
    toast.success("Application submitted!");
  };

  if (!account) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <StepIndicator step={1} />
        <div>
          <h2 className="font-heading text-xl font-semibold tracking-wide uppercase">
            Sign in to start your application
          </h2>
          <p className="mt-2 max-w-sm text-muted-foreground">
            We use your Google account to verify your identity before you fill out
            the membership form.
          </p>
        </div>
        <Button onClick={handleGoogleSignIn}>
          <LogIn className="size-4" />
          Sign in with Google
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StepIndicator step={2} />
        <p className="text-sm text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{account.email}</span>
          {" · "}
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => setAccount(null)}
          >
            Switch account
          </button>
        </p>
      </div>

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
            <Select onValueChange={(v) => setValue("bloodType", v as JoinValues["bloodType"])}>
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
    </div>
  );
}
