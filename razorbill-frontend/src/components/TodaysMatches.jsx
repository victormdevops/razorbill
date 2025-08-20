import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import notifySound from "../assets/notify.mp3"; // adjust path as needed

const TodayMatches = () => {
  const [matchesBySport, setMatchesBySport] = useState({});
  const [sportsMap, setSportsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [notified, setNotified] = useState(
    () => JSON.parse(localStorage.getItem("notifiedMatches")) || []
  );
  const [activeToastMatchId, setActiveToastMatchId] = useState(null);

  useEffect(() => {
    const fetchSportsAndMatches = async () => {
      try {
        let sportsData = JSON.parse(localStorage.getItem("sportsData"));
        if (!sportsData) {
          const sportsResponse = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/api/sports`
          );
          if (!sportsResponse.ok) throw new Error("Failed to fetch sports.");
          sportsData = await sportsResponse.json();
          localStorage.setItem("sportsData", JSON.stringify(sportsData));
        }

        const sportsMap = {};
        sportsData.forEach((sport) => {
          sportsMap[sport.id] = sport.name;
        });
        setSportsMap(sportsMap);

        const matchesBySport = {};
        await Promise.all(
          sportsData.map(async (sport) => {
            const response = await fetch(
              `${import.meta.env.VITE_API_BASE_URL}/api/matches/${
                sport.id
              }/popular`
            );
            if (response.ok) {
              const data = await response.json();
              const today = new Date();
              const todayMatches = data.filter((match) => {
                const matchDate = new Date(match.date);
                return (
                  matchDate.getDate() === today.getDate() &&
                  matchDate.getMonth() === today.getMonth() &&
                  matchDate.getFullYear() === today.getFullYear()
                );
              });
              if (todayMatches.length > 0) {
                matchesBySport[sport.id] = todayMatches;
              }
            }
          })
        );

        setMatchesBySport(matchesBySport);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSportsAndMatches();
  }, []);

  const handleNotify = (matchId, matchTime) => {
    const updated = [...notified, matchId];
    setNotified(updated);
    localStorage.setItem("notifiedMatches", JSON.stringify(updated));

    setActiveToastMatchId(matchId);

    setTimeout(() => {
      setActiveToastMatchId(null);
    }, 5000);

    const matchDate = new Date(matchTime);
    const notifyTime = matchDate.getTime() - 10 * 60 * 1000;

    const now = new Date().getTime();
    const timeout = notifyTime - now;

    setTimeout(
      () => {
        new Audio(notifySound).play();
        alert("📢 Match starting soon!");
      },
      timeout > 0 ? timeout : 1000
    );
  };

  const isMatchNotified = (matchId) => notified.includes(matchId);

  if (loading)
    return (
      <div className="text-white text-center py-10">
        Loading today's matches...
      </div>
    );
  if (error)
    return <div className="text-red-500 text-center py-10">Error: {error}</div>;

  const filteredMatchesBySport = {};
  for (const [sportId, matches] of Object.entries(matchesBySport)) {
    const filtered = matches.filter((match) => {
      const home = match.teams?.home?.name?.toLowerCase() || "";
      const away = match.teams?.away?.name?.toLowerCase() || "";
      return home.includes(searchTerm) || away.includes(searchTerm);
    });
    if (filtered.length > 0) {
      filteredMatchesBySport[sportId] = filtered;
    }
  }

  const sortedEntries = Object.entries(filteredMatchesBySport).sort(
    ([aId], [bId]) => {
      const aName = sportsMap[aId]?.toLowerCase() || "";
      const bName = sportsMap[bId]?.toLowerCase() || "";
      if (aName === "football") return -1;
      if (bName === "football") return 1;
      return aName.localeCompare(bName);
    }
  );

  return (
    <div className="my-6 px-4 sm:px-6 lg:px-12 text-center">
      <div className="font-lora flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 text-center">
        <h2 className="font-playfair text-2xl sm:text-3xl lg:text-4xl text-yellow-400">
          Popular Matches Today
        </h2>
        <input
          type="text"
          placeholder="Search teams..."
          className="font-inter w-full sm:w-auto rounded-3xl border border-white/15 bg-transparent text-white px-4 py-2 focus:outline-none focus:border-white/25 focus:ring-2 focus:ring-white/5 transition duration-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
        />
      </div>

      {sortedEntries.length === 0 ? (
        <p className="font-lora text-center text-white">
          No popular matches today.
        </p>
      ) : (
        sortedEntries.map(([sportId, matches]) => (
          <div key={sportId} className="mb-10">
            <h3 className="font-lora text-xl sm:text-2xl text-white mb-4 font-semibold">
              {sportsMap[sportId] || "Other"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className="rounded-xl border border-white/15 bg-black/60 shadow-md p-6"
                >
                  {/* Local Toast on Card */}
                  {activeToastMatchId === match.id && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded shadow z-50 text-sm">
                      ✅ Notification set you will be notified 10 minutes before
                      the game!
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="flex flex-col items-center text-center">
                      <img
                        src={`https://streamed.su/api/images/badge/${match.teams?.home?.badge}.webp`}
                        alt={match.teams?.home?.name}
                        className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover"
                      />
                      <p className="font-lora text-white mt-2 text-sm sm:text-base">
                        {match.teams?.home?.name}
                      </p>
                    </div>

                    <div className="font-playfair text-white text-lg font-bold">
                      VS
                    </div>

                    <div className="flex flex-col items-center text-center">
                      <img
                        src={`https://streamed.su/api/images/badge/${match.teams?.away?.badge}.webp`}
                        alt={match.teams?.away?.name}
                        className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover"
                      />
                      <p className="font-lora text-white mt-2 text-sm sm:text-base">
                        {match.teams?.away?.name}
                      </p>
                    </div>
                  </div>

                  <div className="text-center mt-4">
                    <p className="text-white text-sm">
                      {new Date(match.date).toLocaleString()}
                    </p>
                    {match.sources && match.sources.length > 0 ? (
                      <div className="flex justify-center items-center mt-4 space-x-3">
                        <Link
                          to={`/matches/${match.id}`}
                          className="font-inter rounded-full bg-white/10 hover:bg-white hover:text-black focus:bg-white focus:text-black text-white font-medium px-6 py-3 transition duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        >
                          {" "}
                          Watch Now
                        </Link>
                        <button
                          onClick={() => handleNotify(match.id, match.date)}
                          disabled={isMatchNotified(match.id)}
                          className={`${
                            isMatchNotified(match.id)
                              ? "font-inter ml-4 text-sm text-gray-300 px-6 py-3 rounded-full transition duration-200 hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
                              : "font-inter ml-4 text-sm text-gray-300 px-6 py-3 rounded-full transition duration-200 hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
                          } px-4 py-2 rounded-full text-sm sm:text-base transition duration-200`}
                        >
                          {isMatchNotified(match.id) ? "Notified" : "Notify Me"}
                        </button>
                      </div>
                    ) : (
                      <p className="font-lora mt-2 text-white text-sm">
                        No live stream available.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TodayMatches;
