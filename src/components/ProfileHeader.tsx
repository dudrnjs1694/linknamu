import type { Profile } from "@/data/profile";

export default function ProfileHeader({ profile }: { profile: Profile }) {
  const avatarClass =
    "h-40 w-40 rounded-full object-cover ring-4 ring-white shadow-md dark:ring-stone-800";

  return (
    <div className="flex flex-col items-center text-center">
      {profile.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.imageUrl} alt={profile.name} className={avatarClass} />
      ) : (
        <div
          aria-hidden
          className={`${avatarClass} flex items-center justify-center bg-stone-300 text-5xl font-bold text-stone-600 dark:bg-stone-700 dark:text-stone-200`}
        >
          {profile.name.charAt(0)}
        </div>
      )}
      <h1 className="mt-4 text-xl font-bold">{profile.name}</h1>
      <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{profile.bio}</p>
    </div>
  );
}
