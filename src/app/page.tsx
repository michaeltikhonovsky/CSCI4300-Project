import BusMap from "@/components/BusMap";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold text-center mb-8">UGA Bus Tracker</h1>
      <BusMap />
    </div>
  );
}
