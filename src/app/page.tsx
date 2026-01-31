import Sidebar from "@/components/Sidebar";
import MapClient from "@/components/MapClient";
import BottomBar from "@/components/BottomBar";

export default function Home() {
  return (
    <div className="h-screen w-screen flex">
      <Sidebar />
      <main className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <MapClient />
        </div>
        <BottomBar />
      </main>
    </div>
  );
}
