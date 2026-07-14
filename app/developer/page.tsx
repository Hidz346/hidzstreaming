import { BadgeCheck } from 'lucide-react';

export const metadata = {
  title: 'Developer | HidzStreaming',
  description: 'Kenalan dengan developer di balik HidzStreaming.',
};

export default function DeveloperPage() {
  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-16 px-4 md:px-8 w-full">
      <div className="max-w-3xl mx-auto">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

          {/* Banner */}
          <div className="relative h-36 sm:h-48 w-full bg-gradient-to-br from-blue-950 via-zinc-900 to-indigo-950">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 20% 30%, rgba(96,165,250,0.35), transparent 40%), radial-gradient(circle at 80% 70%, rgba(129,140,248,0.3), transparent 45%)',
              }}
            ></div>
          </div>

          {/* Avatar + content */}
          <div className="px-6 sm:px-8 pb-8">
            <div className="-mt-12 sm:-mt-14 mb-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-zinc-900 bg-zinc-800 overflow-hidden shadow-xl">
                <img src="/logo.png" alt="Hidz" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="flex items-center gap-1.5 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Hidz</h1>
              <BadgeCheck size={22} className="text-zinc-900 fill-[#60a5fa] shrink-0" />
            </div>
            <p className="text-zinc-500 text-sm mb-5">@hidzstreaming</p>

            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-6">
              Developer &amp; pembuat HidzStreaming — platform untuk nonton anime, donghua, baca komik, dan novel dalam satu tempat. Fokus membangun pengalaman streaming yang cepat, rapi, dan nyaman dipakai dari HP maupun desktop, serta terus dikembangkan agar makin lengkap dari waktu ke waktu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
