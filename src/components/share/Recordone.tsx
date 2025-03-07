import { useState, useRef } from "react";
import RecordRTC from "recordrtc";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import FakeChart from "./FakeChart";

type RecordRTCOptions = {
  type: "video" | "gif";
  mimeType:
    | "video/mp4"
    | "video/webm"
    | "audio/webm"
    | "audio/webm;codecs=pcm"
    | "video/webm;codecs=vp9"
    | "video/webm;codecs=vp8"
    | "video/webm;codecs=h264"
    | "video/x-matroska;codecs=avc1"
    | "video/mpeg"
    | "audio/wav"
    | "audio/ogg"
    | undefined;
  timeSlice?: number;
  onTimeSlice?: (blob: Blob) => void;
};

const RecordOne = () => {
  const [recordingType, setRecordingType] = useState("full-screen");
  const [outputFormat, setOutputFormat] = useState("default");
  const [useTimeSlice, setUseTimeSlice] = useState(false);
  const [resolution, setResolution] = useState("default-resolution");
  const [frameRate, setFrameRate] = useState("default");
  const [bitrate, setBitrate] = useState("default");
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  console.log(resolution);
  console.log(frameRate);
  console.log(bitrate);

  const recorderRef = useRef<RecordRTC | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      let stream: MediaStream;

      if (recordingType === "full-screen" || recordingType === "micro-screen") {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: recordingType === "micro-screen",
        });
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          video: recordingType === "micro-camera",
          audio: true,
        });
      }

      streamRef.current = stream;

      // Sử dụng kiểu tùy chỉnh RecordRTCOptions thay vì any
      const options: RecordRTCOptions = {
        type: outputFormat === "gif" ? "gif" : "video",
        mimeType:
          outputFormat === "vp8"
            ? "video/webm;codecs=vp8"
            : outputFormat === "vp9"
            ? "video/webm;codecs=vp9"
            : outputFormat === "h264"
            ? "video/webm;codecs=h264"
            : outputFormat === "mkv"
            ? "video/x-matroska;codecs=avc1"
            : "video/webm",
      };

      if (useTimeSlice) {
        options.timeSlice = 1000; // 1 second
        options.onTimeSlice = (blob: Blob) => {
          // Xử lý từng phần của bản ghi
          console.log("Time slice:", blob);
        };
      }

      recorderRef.current = new RecordRTC(stream, options);
      recorderRef.current.startRecording();
      setIsRecording(true);
      setIsPaused(false);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stopRecording(() => {
        const blob = recorderRef.current?.getBlob();
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `recording.${outputFormat === "gif" ? "gif" : "webm"}`;
          a.click();
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        setIsRecording(false);
      });
    }
  };

  const pauseRecording = () => {
    if (recorderRef.current) {
      if (isPaused) {
        recorderRef.current.resumeRecording();
        setIsPaused(false);
      } else {
        recorderRef.current.pauseRecording();
        setIsPaused(true);
      }
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div>
          <FakeChart />
        </div>
        <div className="flex items-center gap-2">
          <Select onValueChange={(value: any) => setRecordingType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Recording Type" />
            </SelectTrigger>
            <SelectContent className="z-10 bg-white">
              <SelectItem value="micro-camera">Microphone + Camera</SelectItem>
              <SelectItem value="micro">Microphone</SelectItem>
              <SelectItem value="full-screen">Full Screen</SelectItem>
              <SelectItem value="micro-screen">Microphone + Screen</SelectItem>
            </SelectContent>
          </Select>
          <p>into</p>
          <Select onValueChange={(value: any) => setOutputFormat(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Output Format" />
            </SelectTrigger>
            <SelectContent className="z-10 bg-white">
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="vp8">Vp8</SelectItem>
              <SelectItem value="vp9">vp9</SelectItem>
              <SelectItem value="h264">h264</SelectItem>
              <SelectItem value="mkv">mkv</SelectItem>
              <SelectItem value="gif">gif</SelectItem>
            </SelectContent>
          </Select>
          <div className="items-top flex space-x-2 ml-2">
            <Checkbox
              id="terms1"
              checked={useTimeSlice}
              onCheckedChange={(checked: any) => setUseTimeSlice(!!checked)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="terms1"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Use timeSlice
              </label>
            </div>
          </div>
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
          <Select onValueChange={(value: any) => setResolution(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Resolution" />
            </SelectTrigger>
            <SelectContent className="z-10 bg-white">
              <SelectItem value="defaut-resolution">
                Default Resolutions
              </SelectItem>
              <SelectItem value="1080p">1080p</SelectItem>
              <SelectItem value="720p">720p</SelectItem>
              <SelectItem value="480p">480p</SelectItem>
              <SelectItem value="4K">4K Ultra HD(3840x2160)</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={(value: any) => setFrameRate(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Frame Rate" />
            </SelectTrigger>
            <SelectContent className="z-10 bg-white">
              <SelectItem value="default">Default Framerates</SelectItem>
              <SelectItem value="5fps">5 fps</SelectItem>
              <SelectItem value="15fps">15 fps</SelectItem>
              <SelectItem value="24fps">24 fps</SelectItem>
              <SelectItem value="30fps">30 fps</SelectItem>
              <SelectItem value="60fps">60 fps</SelectItem>
              <SelectItem value="120fps">120 fps</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={(value: any) => setBitrate(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Bitrate" />
            </SelectTrigger>
            <SelectContent className="z-10 bg-white">
              <SelectItem value="default">Default Bitrates</SelectItem>
              <SelectItem value="1GB-bps">1 GB bps</SelectItem>
              <SelectItem value="100MB-bps">100 MB bps</SelectItem>
              <SelectItem value="1MB-bps">1 MB bps</SelectItem>
              <SelectItem value="100KB-bps">100 KB bps</SelectItem>
              <SelectItem value="1KB-bps">1 KB bps</SelectItem>
              <SelectItem value="100byte-bps">100 Bytes KB bps</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </main>
    </div>
  );
};
export default RecordOne;
