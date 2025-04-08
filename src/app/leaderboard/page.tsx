import Link from "next/link";

const leaderboardData = [
  {
    id: 1,
    image: "https://pbs.twimg.com/media/Gec6HW7WgAEbePh?format=jpg&name=medium",
    title: "BusGuessr",
    score: 1500,
  },
  {
    image: "https://pbs.twimg.com/media/GfGZmYTXEAAkZp0?format=jpg&name=medium",
    id: 2,
    title: "john101202",
    score: 1200,
  },
  {
    id: 3,
    image: "https://pbs.twimg.com/media/GjsLBmhWYAAqBMb?format=jpg&name=medium",
    title: "jake_the_dog",
    score: 900,
  },
];

const LeaderboardItem = ({
  image,
  title,
  score,
}: {
  image: string;
  title: string;
  score: number;
}) => {
  return (
    <div className="group relative flex items-center gap-4 overflow-hidden rounded-lg border-2 border-purple-500 bg-black/50 p-4 text-white transition-all">
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-950/50 to-transparent opacity-0 transition-opacity" />
      <img
        src={image}
        alt={title}
        className="h-16 w-16 rounded-full object-cover"
      />
      <div className="flex flex-1 items-center justify-between">
        <h3 className="text-2xl font-bold">{title}</h3>
        <span className="text-xl text-purple-400">{score} points</span>
      </div>
    </div>
  );
};

const Leaderboard = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Background Image with Vignette */}
      <div className="fixed inset-0">
        <img
          src="/uga_campus_art.png"
          alt="UGA Campus"
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen flex-col p-8">
        <header className="flex items-center gap-4 mb-8">
          <Link href="/">
            <img
              src="/uga_bus_logo.png"
              alt="UGA Bus Logo"
              className="h-16 w-16 rounded-full object-cover border-2 border-white hover:border-blue-400 transition-colors"
            />
          </Link>
          <h1 className="text-4xl font-bold text-white">Leaderboard</h1>
        </header>

        <div className="mx-auto w-full max-w-3xl space-y-4">
          {leaderboardData.map((item) => (
            <LeaderboardItem
              key={item.id}
              image={item.image}
              title={item.title}
              score={item.score}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
