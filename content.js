chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "addSubtitles") {
    console.log(
      "🚀 ~ chrome.runtime.onMessage.addListener ~ request:",
      request
    );

    // Function to add subtitles to video elements
    const addSubtitlesToVideos = (videos) => {
      if (videos.length > 0) {
        var blob = new Blob([request.vttContent], { type: "text/vtt" });
        const track = document.createElement("track");
        Object.assign(track, {
          kind: "subtitles",
          label: "language",
          default: true,
          src: window.URL.createObjectURL(blob),
        });
        videos.forEach((video) => {
          video.appendChild(track);
        });
        return true;
      }
      return false;
    };

    // Find video elements directly on the page
    const videos = document.querySelectorAll("video");
    let subtitlesAdded = addSubtitlesToVideos(videos);

    // Function to add subtitles to video elements inside iframes
    const addSubtitlesToIframeVideos = (iframe) => {
      const iframeDocument =
        iframe.contentDocument || iframe.contentWindow.document;
      const iframeVideos = iframeDocument.querySelectorAll("video");
      const success = addSubtitlesToVideos(iframeVideos);
      return success;
    };

    // Function to handle if iframe is checked
    const handleIframe = () => {
      const parentClass = request.parentClass;
      const iframeContent = request.iframeContent;

      // Parse the iframe content into a document
      const parser = new DOMParser();
      const doc = parser.parseFromString(iframeContent, "text/html");

      // Add subtitles to video elements inside the parsed iframe content
      const iframeVideos = doc.querySelectorAll("video");
      const success = addSubtitlesToVideos(iframeVideos);

      if (success) {
        // Find the parent element using the parentClass
        const parentElement = document.querySelector(
          parentClass ? `.${parentClass}` : "body"
        );
        if (parentElement) {
          // Create a new iframe element with the modified content
          const newIframe = document.createElement("iframe");
          newIframe.srcdoc = doc.documentElement.outerHTML;

          // Replace the old iframe with the new iframe
          const oldIframe = parentElement.querySelector("iframe");
          if (oldIframe) {
            parentElement.removeChild(oldIframe);
            parentElement.appendChild(newIframe);
          }
        }
      }

      return success;
    };

    // Check if iframe handling is required
    if (request.isIframe) {
      subtitlesAdded = handleIframe();
    } else {
      // Function to search for video elements inside iframes
      const searchIframes = () => {
        const iframes = document.querySelectorAll("iframe");
        iframes.forEach((iframe) => {
          try {
            const iframeVideos = addSubtitlesToIframeVideos(iframe);
            subtitlesAdded = subtitlesAdded || iframeVideos;
          } catch (e) {
            console.error("Error accessing iframe contents:", e);
          }
        });
      };

      // Check for iframes and search for video elements inside them
      searchIframes();
    }

    if (subtitlesAdded) {
      sendResponse({ result: "Subtitle track added to videos" });
    } else {
      sendResponse({
        result: "No video elements found on the page or in iframes",
      });
    }
  } else {
    sendResponse({ result: "error" });
  }
});
