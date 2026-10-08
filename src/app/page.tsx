import LinkCard from "@/components/LinkCard";
import ProfileHeader from "@/components/ProfileHeader";
import ThemeToggle from "@/components/ThemeToggle";
import { profile } from "@/data/profile";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-8 sm:px-8">
      <div className="flex justify-end">
        <ThemeToggle />
      </div>

      <div className="mt-10 flex flex-col gap-12">
        <ProfileHeader profile={profile} />

        <ul className="flex flex-col gap-4">
          {profile.links.map((link) => (
            <li key={link.id}>
              <LinkCard link={link} />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
