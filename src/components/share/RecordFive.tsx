import { Button } from "@/components/ui/button";
import FakeChart from "./FakeChart";

const RecordFive = () => {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div>
          <FakeChart />
        </div>
        <div className="flex gap-2 justify-center">
          <Button className="cursor-pointer bg-black text-white">
            Start Record
          </Button>
          <Button className="cursor-pointer bg-black text-white">
            Stop Record
          </Button>
        </div>
      </main>
    </div>
  );
};

export default RecordFive;
