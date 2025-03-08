import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FakeChart from "./FakeChart";
import html2canvas from "html2canvas";

const RecordThree = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordDuration, setRecordDuration] = useState<number | null>(null);
  const [outputFormat, setOutputFormat] = useState("webm");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const workerRef = useRef<Worker | null>(null);

  // Khởi tạo Web Worker
  useEffect(() => {
    workerRef.current = new Worker("/worker.js"); // Đường dẫn tới file worker.js
    workerRef.current.onmessage = (e) => {
      const { success, width, height } = e.data;
      if (success && canvasRef.current) {
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        // Có thể thêm logic vẽ từ dữ liệu worker nếu cần
      }
    };

    return () => {
      workerRef.current?.terminate(); // Dọn dẹp worker khi component unmount
    };
  }, []);

  const startRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scale = 4; // Tăng scale để có chất lượng cao hơn
    canvas.width = canvas.clientWidth * scale;
    canvas.height = canvas.clientHeight * scale;

    const stream = canvas.captureStream(120); // FPS
    const options = {
      mimeType: `video/${outputFormat}; codecs=vp9`,
      videoBitsPerSecond: 5000000,
    };

    mediaRecorderRef.current = new MediaRecorder(stream, options);
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) recordedChunksRef.current.push(event.data);
    };
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, {
        type: `video/${outputFormat}`,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recording.${outputFormat}`;
      a.click();
      recordedChunksRef.current = [];
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
    setIsPaused(false);

    setTimeout(() => {
      if (recordDuration) {
        setTimeout(stopRecording, recordDuration * 1000);
      }
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

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

  useEffect(() => {
    const canvas = canvasRef.current;
    const div = document.querySelector("#chart-data") as HTMLElement;
    if (!canvas || !div) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const draw = async () => {
      if (div && ctx) {
        const capture = await html2canvas(div, {
          useCORS: true,
          scale: 4,
          logging: false,
        });
        canvas.width = capture.width;
        canvas.height = capture.height;
        ctx.drawImage(capture, 0, 0);

        // Gửi dữ liệu sang worker nếu cần xử lý thêm
        workerRef.current?.postMessage({
          divHtml: div.innerHTML,
          width: capture.width,
          height: capture.height,
        });

        // Chỉ vẽ lại nếu đang ghi
        if (isRecording) {
          animationFrameId = requestAnimationFrame(draw);
        }
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId); // Hủy vòng lặp khi unmount
    };
  }, [isRecording]); // Chỉ chạy lại khi isRecording thay đổi

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div
          id="chart-data"
          className="pt-[40px] pb-[40px] pr-[40px] border-[1px] border-[#ccc]"
        >
          <FakeChart />
        </div>
        <canvas ref={canvasRef} className="hidden"></canvas>
        <div className="flex items-center gap-2">
          <Select
            onValueChange={(value: string) => setRecordDuration(Number(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Record Duration" />
            </SelectTrigger>
            <SelectContent className="z-10 bg-white">
              <SelectItem value="10">10 seconds</SelectItem>
              <SelectItem value="15">15 seconds</SelectItem>
              <SelectItem value="30">30 seconds</SelectItem>
              <SelectItem value="60">60 seconds</SelectItem>
              <SelectItem value="120">2 Minute</SelectItem>
              <SelectItem value="300">5 Minute</SelectItem>
              <SelectItem value="600">10 Minute</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={(value: string) => setOutputFormat(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Output Format" />
            </SelectTrigger>
            <SelectContent className="z-10 bg-white">
              <SelectItem value="webm">WebM</SelectItem>
              <SelectItem value="mp4">MP4</SelectItem>
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
      </main>
    </div>
  );
};

export default RecordThree;
