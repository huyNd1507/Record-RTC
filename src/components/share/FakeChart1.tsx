import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const FakeChart1 = () => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        // Khởi tạo biểu đồ
        chartInstance.current = new Chart(ctx, {
          type: "line",
          data: {
            labels: [] as number[],
            datasets: [
              {
                label: "Fake Stock Price",
                data: [] as number[],
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 2,
                fill: false,
              },
            ],
          },
          options: {
            scales: {
              x: {
                type: "linear",
                position: "bottom",
              },
              y: {
                beginAtZero: false,
              },
            },
          },
        });

        // Hàm cập nhật dữ liệu
        const updateChart = () => {
          if (chartInstance.current) {
            const chart = chartInstance.current;
            const data = chart.data.datasets[0].data as number[];
            const labels = chart.data.labels as number[];

            // Thêm dữ liệu mới
            const lastDataPoint = data.length > 0 ? data[data.length - 1] : 100;
            const newDataPoint = lastDataPoint + (Math.random() - 0.5) * 10;
            data.push(newDataPoint);
            labels.push(labels.length);

            // Giới hạn số lượng điểm dữ liệu hiển thị
            if (data.length > 50) {
              data.shift();
              labels.shift();
            }

            // Cập nhật biểu đồ
            chart.update();
          }
        };

        // Cập nhật biểu đồ mỗi giây
        const interval = setInterval(updateChart, 1000);

        // Cleanup function để hủy biểu đồ và dừng interval khi component unmount
        return () => {
          clearInterval(interval); // Dừng interval
          if (chartInstance.current) {
            chartInstance.current.destroy(); // Hủy biểu đồ
          }
        };
      }
    }
  }, []);

  return <canvas ref={chartRef} width="900" height="350"></canvas>;
};

export default FakeChart1;
