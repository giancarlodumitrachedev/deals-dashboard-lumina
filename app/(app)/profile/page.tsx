import { requireSession } from "@/lib/auth";
import { ProfileEditor } from "./ProfileEditor";
import { ROLE_LABEL } from "@/lib/i18n/it";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireSession();
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-lg font-semibold">Profilo</h1>
      <ProfileEditor
        fullName={session.fullName}
        email={session.email}
        role={ROLE_LABEL[session.role]}
      />
    </div>
  );
}
