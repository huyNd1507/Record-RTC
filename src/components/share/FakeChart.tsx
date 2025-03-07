// import { useEffect, useState } from "react";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

// const FakeChart = () => {
//   const [data, setData] = useState(
//     Array.from({ length: 50 }, (_, i) => ({
//       time: i,
//       value: 10 + Math.random() * 10,
//     }))
//   );

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setData((prevData) => {
//         const newPoint = {
//           time: prevData[prevData.length - 1].time + 1,
//           value:
//             prevData[prevData.length - 1].value + (Math.random() - 0.5) * 5,
//         };

//         return [...prevData.slice(1), newPoint];
//       });
//     }, 100);

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <LineChart width={900} height={500} data={data}>
//       <CartesianGrid strokeDasharray="3 3" />
//       <XAxis dataKey="time" />
//       <YAxis domain={["dataMin - 5", "dataMax + 5"]} />
//       <Line
//         type="monotone"
//         dataKey="value"
//         stroke="rgba(75, 192, 192, 1)"
//         strokeWidth={2}
//         dot={false}
//       />
//     </LineChart>
//   );
// };

// export default FakeChart;

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

const FakeChart = () => {
  const [data, setData] = useState(
    Array.from({ length: 50 }, (_, i) => ({
      time: i,
      value: 10 + Math.random() * 5, // Giảm biên độ khởi tạo
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prevData) => {
        const lastValue = prevData[prevData.length - 1].value;

        // Giới hạn biến động và phạm vi giá trị
        const newValue = Math.min(
          25,
          Math.max(
            5,
            lastValue + (Math.random() - 0.5) * 2 // Giảm biến động từ 5 -> 2
          )
        );

        return [
          ...prevData.slice(1),
          {
            time: prevData[prevData.length - 1].time + 1,
            value: newValue,
          },
        ];
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <LineChart width={900} height={400} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="time" />
      <YAxis
        domain={[0, 30]} // Cố định phạm vi hiển thị
        tick={{ fontSize: 12 }}
      />
      <Line
        type="monotone"
        dataKey="value"
        stroke="#4fa8ff"
        strokeWidth={1.5}
        dot={false}
        isAnimationActive={false} // Tắt animation cho mượt
      />
    </LineChart>
  );
};

export default FakeChart;
