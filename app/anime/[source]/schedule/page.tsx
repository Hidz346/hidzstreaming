'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar, ChevronLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import AnimeCard3 from '../../components/AnimeCard3';
import Sidebar from '@/app/components/Sidebar';
import { getAnimeSchedule } from '@/lib/anime-api';

type ScheduleDay = {
  day: string;
  animeList: any[];
};

export default function AnimeSchedulePage() {
  const params = useParams();
  const router = useRouter();
  const source = (params?.source as string) || 'otakudesu';

  const [scheduleData, setScheduleData] = useState<ScheduleDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState('Semua');

  useEffect(() => {
    let cancelled = false;

    const fetchSchedule = async () => {
      try {
        const res = await getAnimeSchedule(source);
        const raw = res?.schedule || res?.schedules || [];

        let items: ScheduleDay[] = [];

        if (Array.isArray(raw)) {
          items = raw.map((item: any) => ({
            day: item.day || item.name || 'Jadwal',
            animeList: item.animeList || item.anime_list || item.list || [],
          }));
        } else if (raw && typeof raw === 'object') {
          items = Object.entries(raw).map(([day, value]) => ({
            day: day.charAt(0).toUpperCase() + day.slice(1),
            animeList: Array.isArray(value) ? value : [],
          }));
        }

        if (!cancelled) setScheduleData(items.filter((item) => item.animeList.length > 0));
      } catch (error) {
        console.error('Failed to fetch schedule', error);
        if (!cancelled) setScheduleData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSchedule();
    return () => {
      cancelled = true;
    };
  }, [source]);

  const days = useMemo(
    () => ['Semua', ...scheduleData.map((item) => item.day)],
    [scheduleData]
  );

  const totalAnime = useMemo(
    () => scheduleData.reduce((total, item) => total + item.animeList.length, 0),
    [scheduleData]
  );

  const filteredData =
    activeDay === 'Semua'
      ? scheduleData
      : scheduleData.filter((item) => item.day === activeDay);

  return (
    <>
      <div className="flex-1 flex flex-col min-h-screen text-white pb-24 font-sans w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-lg bg-[#2A2B3D] hover:bg-[#3b3c54] flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={18} className="text-zinc-400" />
          </button>
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-[#f40f25]" />
            <h1 className="text-lg sm:text-xl font-bold text-white">Jadwal Tayang</h1>
          </div>
        </div>

        <div className="flex overflow-x-auto custom-scrollbar gap-2 mb-8 pb-2">
          {days.map((day) => {
            const isActive = activeDay === day;
            const count =
              day === 'Semua'
                ? totalAnime
                : scheduleData.find((item) => item.day === day)?.animeList.length || 0;

            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-colors border ${
                  isActive
                    ? 'bg-amber-500 text-black shadow-md border-amber-500'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:bg-amber-600 hover:text-white hover:border-amber-500'
                }`}
              >
                {day}
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                    isActive ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : scheduleData.length === 0 ? (
            <div className="text-center py-20 text-zinc-500">
              Jadwal belum tersedia dari sumber API ini.
            </div>
          ) : (
            filteredData.map((dayData) => (
              <div key={dayData.day} className="flex flex-col gap-4">
                <div className="flex items-center gap-3 border-b border-zinc-800 pb-2">
                  <div className="w-1 h-6 bg-amber-500 rounded-full" />
                  <h2 className="text-lg font-bold text-white">{dayData.day}</h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
                  {dayData.animeList.map((anime, index) => (
                    <AnimeCard3
                      key={index}
                      item={anime}
                      href={`/anime/${source}/detail/${anime.animeId || anime.id || anime.slug || anime.endpoint}`}
                      type="schedule"
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Sidebar />
    </>
  );
}
