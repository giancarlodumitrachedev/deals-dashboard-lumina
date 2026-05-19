import { redirect } from "next/navigation";
import { requireSession, roleLandingPath } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const session = await requireSession();
  redirect(roleLandingPath(session.role));
}
