import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import FakeChart1 from "./FakeChart1";
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

  // Hàm bắt đầu ghi
  const startRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Lấy stream từ canvas
    const stream = canvas.captureStream(120); // 120 FPS
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
  // useEffect(() => {
  //   const canvas = canvasRef.current;
  //   const div = document.querySelector("#chart-data") as HTMLElement;

  //   if (!canvas || !div) return;

  //   const ctx = canvas.getContext("2d");
  //   if (!ctx) return;

  //   // Đặt kích thước canvas bằng kích thước của div
  //   const rect = div.getBoundingClientRect();
  //   canvas.width = rect.width;
  //   canvas.height = rect.height;

  //   // Hàm vẽ nội dung của div vào canvas
  //   const draw = () => {
  //     if (div && ctx) {
  //       // Xóa canvas trước khi vẽ
  //       ctx.clearRect(0, 0, canvas.width, canvas.height);

  //       // Vẽ nội dung của div vào canvas
  //       const children = Array.from(div.children);
  //       children.forEach((child) => {
  //         if (child instanceof HTMLElement) {
  //           const { left, top } = child.getBoundingClientRect();
  //           ctx.drawImage(
  //             child as unknown as CanvasImageSource,
  //             left - rect.left,
  //             top - rect.top
  //           );
  //         }
  //       });

  //       // Yêu cầu vẽ lại trong frame tiếp theo
  //       requestAnimationFrame(draw);
  //     }
  //   };

  //   draw();
  // }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const div = document.querySelector("#chart-data") as HTMLElement;

    if (!canvas || !div) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Hàm vẽ nội dung của div vào canvas
    const draw = async () => {
      if (div && ctx) {
        // Chụp ảnh div bằng html2canvas
        const capture = await html2canvas(div, {
          useCORS: true, // Nếu có hình ảnh cross-origin
          scale: 1, // Tỷ lệ chụp
          logging: false, // Tắt log để tăng performance
        });

        // Đặt kích thước canvas bằng kích thước ảnh chụp
        canvas.width = capture.width;
        canvas.height = capture.height;

        // Vẽ ảnh chụp lên canvas
        ctx.drawImage(capture, 0, 0);

        // Yêu cầu vẽ lại trong frame tiếp theo
        requestAnimationFrame(draw);
      }
    };

    draw();
  }, []);

  // Thay đổi phần useEffect vẽ canvas
  // useEffect(() => {
  //   const canvas = canvasRef.current;
  //   const chartDiv = document.querySelector("#chart-data") as HTMLElement;
  //   const chartCanvas = chartDiv.querySelector("canvas");

  //   if (!canvas || !chartCanvas) return;

  //   const ctx = canvas.getContext("2d");
  //   if (!ctx) return;

  //   // 1. Thêm flag để kiểm soát animation
  //   let isDrawing = true;

  //   // 2. Thêm hàm convert SVG sang Canvas (nếu Recharts dùng SVG)
  //   const convertSVGtoCanvas = async () => {
  //     const svgElement = chartDiv.querySelector("svg");
  //     if (!svgElement) return;

  //     const svgString = new XMLSerializer().serializeToString(svgElement);
  //     const img = new Image();
  //     img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  //       svgString
  //     )}`;

  //     await new Promise((resolve) => (img.onload = resolve));

  //     ctx.clearRect(0, 0, canvas.width, canvas.height);
  //     ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  //   };

  //   // 3. Cập nhật kích thước và vẽ
  //   const draw = async () => {
  //     if (!isDrawing) return;

  //     const rect = chartDiv.getBoundingClientRect();
  //     if (canvas.width !== rect.width || canvas.height !== rect.height) {
  //       canvas.width = rect.width;
  //       canvas.height = rect.height;
  //     }

  //     // Kiểm tra nếu Recharts render bằng SVG
  //     if (chartDiv.querySelector("svg")) {
  //       await convertSVGtoCanvas();
  //     } else {
  //       ctx.clearRect(0, 0, canvas.width, canvas.height);
  //       ctx.drawImage(chartCanvas, 0, 0, canvas.width, canvas.height);
  //     }

  //     // 4. Thêm manual requestFrame để đảm bảo sync
  //     setTimeout(() => {
  //       requestAnimationFrame(draw);
  //     }, 1000 / 30); // Giới hạn 30 FPS
  //   };

  //   draw();

  //   return () => {
  //     isDrawing = false;
  //   };
  // }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        {/* Div cần ghi */}
        <div
          id="chart-data"
          className="pt-[40px]  pb-[40px] pr-[40px] border-[1px] border-[#ccc]"
        >
          <FakeChart />
        </div>

        {/* Canvas để vẽ nội dung của div */}
        <canvas ref={canvasRef} className="hidden"></canvas>

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
