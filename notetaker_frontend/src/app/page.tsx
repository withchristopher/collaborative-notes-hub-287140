import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to /notes for main list view
  redirect("/notes");
}
