import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FakeChart1 from "./FakeChart1";

const RecordThree = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordDuration, setRecordDuration] = useState<number | null>(null);
  const [outputFormat, setOutputFormat] = useState("webm");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Hàm bắt đầu ghi
  const startRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Lấy stream từ canvas
    const stream = canvas.captureStream(120); // 30 FPS
    const options = { mimeType: `video/${outputFormat}; codecs=vp9` };

    mediaRecorderRef.current = new MediaRecorder(stream, options);

    // Lưu trữ các chunk dữ liệu ghi được
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    // Khi kết thúc ghi
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, {
        type: `video/${outputFormat}`,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recording.${outputFormat}`;
      a.click();
      recordedChunksRef.current = []; // Reset chunks
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
    setIsPaused(false);

    // Tự động dừng ghi sau khoảng thời gian đã chọn
    if (recordDuration) {
      setTimeout(() => {
        stopRecording();
      }, recordDuration * 1000);
    }
  };

  // Hàm dừng ghi
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Hàm tạm dừng/tiếp tục ghi
  const pauseRecording = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  // Vẽ nội dung của div vào canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const div = document.querySelector("#chart-data") as HTMLElement;

    if (!canvas || !div) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Đặt kích thước canvas bằng kích thước của div
    const rect = div.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Hàm vẽ nội dung của div vào canvas
    const draw = () => {
      if (div && ctx) {
        // Xóa canvas trước khi vẽ
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Vẽ nội dung của div vào canvas
        const children = Array.from(div.children);
        children.forEach((child) => {
          if (child instanceof HTMLElement) {
            const { left, top } = child.getBoundingClientRect();
            ctx.drawImage(
              child as unknown as CanvasImageSource,
              left - rect.left,
              top - rect.top
            );
          }
        });

        // Yêu cầu vẽ lại trong frame tiếp theo
        requestAnimationFrame(draw);
      }
    };

    draw();
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        {/* Div cần ghi */}
        <div id="chart-data" className="p-[40px] border-[1px] border-[#ccc]">
          <FakeChart1 />
        </div>

        {/* Canvas để vẽ nội dung của div */}
        <canvas ref={canvasRef} className="hidden"></canvas>

        <div className="flex items-center gap-2">
          <Select onValueChange={(value: string) => setOutputFormat(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Output Format" />
            </SelectTrigger>
            <SelectContent className="z-10 bg-white">
              <SelectItem value="webm">WebM</SelectItem>
              <SelectItem value="mp4">MP4</SelectItem>
              <SelectItem value="gif">GIF</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            className="cursor-pointer bg-black text-white"
            onClick={startRecording}
            disabled={isRecording}
          >
            Start Record
          </Button>
          <Button
            className="cursor-pointer bg-black text-white"
            onClick={stopRecording}
            disabled={!isRecording}
          >
            Stop Record
          </Button>
          <Button
            className="cursor-pointer bg-black text-white"
            onClick={pauseRecording}
            disabled={!isRecording}
          >
            {isPaused ? "Resume" : "Pause"}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Select
            onValueChange={(value: string) => setRecordDuration(Number(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Record Duration" />
            </SelectTrigger>
            <SelectContent className="z-10 bg-white">
              <SelectItem value="5">5 seconds</SelectItem>
              <SelectItem value="10">10 seconds</SelectItem>
              <SelectItem value="15">15 seconds</SelectItem>
              <SelectItem value="30">30 seconds</SelectItem>
              <SelectItem value="60">60 seconds</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </main>
    </div>
  );
};
export default RecordThree;
