import { EditProfileForm } from "@/components/shared/EditProfileForm";

export default function EditProfilePage() {
  return (
    <div>
      <h1 className="font-heading text-3xl font-bold tracking-wide uppercase">
        Edit Profile
      </h1>

      <div className="mt-8 max-w-2xl">
        <EditProfileForm />
      </div>
    </div>
  );
}
