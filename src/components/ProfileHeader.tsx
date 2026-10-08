import type { Profile } from "@/data/profile";

export default function ProfileHeader({ profile }: { profile: Profile }) {
  const avatarClass =
    "h-36 w-36 rounded-full object-cover ring-4 ring-white/80 shadow-[0_18px_40px_-12px_rgba(140,80,40,0.35)] dark:ring-white/10 dark:shadow-black/40";

  return (
    <div className="flex flex-col items-center text-center">
      {profile.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.imageUrl} alt={profile.name} className={avatarClass} />
      ) : (
        <div
          aria-hidden
          className={`${avatarClass} flex items-center justify-center bg-orange-200 text-5xl font-bold text-orange-700 dark:bg-stone-700 dark:text-stone-200`}
        >
          {profile.name.charAt(0)}
        </div>
      )}
      <h1 className="mt-6 text-xl font-bold tracking-tight">{profile.name}</h1>
      <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">{profile.bio}</p>
    </div>
  );
}
