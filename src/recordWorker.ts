// worker.js
self.onmessage = async (e) => {
  const { divHtml, width, height } = e.data;
  console.log("divHtml", divHtml);

  // Giả lập việc vẽ hoặc xử lý dữ liệu nặng trong worker
  // Vì html2canvas không chạy trực tiếp trong worker (nó cần DOM),
  // ta sẽ giả định bạn gửi dữ liệu thô hoặc xử lý logic nặng ở đây
  const processHeavyTask = () => {
    // Ví dụ: xử lý dữ liệu biểu đồ hoặc tính toán phức tạp từ FakeChart
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, width, height });
      }, 10); // Giả lập tác vụ nặng
    });
  };

  const result = await processHeavyTask();
  self.postMessage(result);
};
