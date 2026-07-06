"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { UploadCloud, CheckCircle2 } from "lucide-react";
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
import { GoogleSignInButton } from "@/components/shared/GoogleSignInButton";
import { api, ApiError } from "@/lib/api";
import { decodeJwtPayload } from "@/lib/session";
import { completeGoogleLogin } from "@/lib/auth-flow";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const bloodTypes = ["A", "B", "AB", "O"] as const;

const joinSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.email("Enter a valid email"),
  phoneNumber: z.string().min(8, "Enter a valid phone number"),
  placeOfBirth: z.string().min(2, "Required"),
  dateOfBirth: z.string().min(1, "Required"),
  address: z.string().min(5, "Required"),
  instagramUsername: z.string().min(1, "Required"),
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
  const router = useRouter();
  const { login } = useAuth();
  const [account, setAccount] = useState<GoogleAccount | null>(null);
  const [googleToken, setGoogleToken] = useState("");
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

  // Step 1: a real Google ID token is what /register needs as `googleToken`.
  // Decode it for the email/name, advance to step 2, and prefill those fields.
  const handleCredential = useCallback(
    (idToken: string) => {
      const claims = decodeJwtPayload<{ email: string; name?: string }>(idToken);
      if (!claims?.email) {
        toast.error("Could not read your Google account email.");
        return;
      }
      setGoogleToken(idToken);
      setAccount({ name: claims.name ?? "", email: claims.email });
      setValue("email", claims.email, { shouldValidate: true });
      if (claims.name) setValue("name", claims.name, { shouldValidate: true });
    },
    [setValue]
  );

  const switchAccount = () => {
    setAccount(null);
    setGoogleToken("");
  };

  // POST /register. The backend expects `motorbikeSelfieLinkPath` (a link to an
  // already-hosted image). There is no public upload endpoint yet, so the image
  // is sent as a base64 data URI placeholder for that link. `email` must match
  // the verified Google token's email.
  const onSubmit = async (values: JoinValues) => {
    if (!googleToken) {
      toast.error("Sign in with Google before submitting.");
      return;
    }
    if (!selfie) {
      toast.error("Please upload a motorbike selfie.");
      return;
    }
    const motorbikeSelfieLinkPath = await fileToBase64(selfie);
    try {
      await api.register({
        name: values.name,
        email: values.email,
        phoneNumber: values.phoneNumber,
        placeOfBirth: values.placeOfBirth,
        dateofBirth: values.dateOfBirth,
        address: values.address,
        instagramUsername: values.instagramUsername,
        bloodType: values.bloodType,
        emergencyContactName: values.emergencyContactName,
        emergencyContactPhoneNumber: values.emergencyContactPhoneNumber,
        motorbikeName: values.motorbikeName,
        motorbikeSelfieLinkPath,
        googleToken,
      });
      toast.success("Application submitted! You can sign in once an admin approves it.");
      router.push("/login");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // Already registered - we already have a verified Google credential
        // from step 1, so just sign them in instead of making them click
        // "Sign in with Google" again on a separate page.
        toast.info("This Google account is already registered. Signing you in...");
        try {
          await completeGoogleLogin(values.email, googleToken, account?.name, login, router);
        } catch (loginErr) {
          toast.error(loginErr instanceof Error ? loginErr.message : "Sign in failed");
          router.push("/login");
        }
        return;
      }
      toast.error(err instanceof Error ? err.message : "Submission failed");
    }
  };

  // Step 1 — sign in with Google before showing the form.
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
        <GoogleSignInButton onCredential={handleCredential} text="continue_with" />
      </div>
    );
  }

  // Step 2 — the details form.
  return (
    <div className="flex flex-col gap-6">
      <StepIndicator step={2} />

      <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
        <span className="flex items-center gap-2">
          <CheckCircle2 className="size-4 text-primary" />
          Signed in as <span className="font-medium text-foreground">{account.email}</span>
        </span>
        <Button type="button" variant="ghost" size="sm" onClick={switchAccount}>
          Switch account
        </Button>
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
              readOnly
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
            <Input
              id="instagramUsername"
              aria-invalid={!!errors.instagramUsername}
              aria-describedby={errors.instagramUsername ? "instagramUsername-error" : undefined}
              {...register("instagramUsername")}
            />
            {errors.instagramUsername && (
              <p id="instagramUsername-error" className="text-sm text-destructive">
                {errors.instagramUsername.message}
              </p>
            )}
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
