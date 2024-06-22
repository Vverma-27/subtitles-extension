document.getElementById("uploadButton").addEventListener("click", () => {
  const fileInput = document.getElementById("vttFile");
  const parentClass = document.getElementById("parentClass").value;
  const iframeContent = document.getElementById("iframeContent").value;
  if (fileInput.files.length === 0) {
    alert("Please select a VTT file.");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();
  reader.onload = function (event) {
    const vttContent = event.target.result;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          action: "addSubtitles",
          vttContent,
          parentClass,
          iframeContent,
          isIframe: iframeCheckbox.checked,
        },
        (response) => {
          console.log("🚀 ~ chrome.tabs.query ~ response:", response);
          alert(response?.result);
        }
      );
    });
  };
  reader.readAsText(file);
});
