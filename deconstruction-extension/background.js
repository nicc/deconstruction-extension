// Listen for when the user clicks the extension's action icon (the icon in the toolbar).
chrome.action.onClicked.addListener((tab) => {
  // Use the 'scripting' API to execute a script in the context of the current tab.
  // This is the modern, secure way to inject code in Manifest V3.
  chrome.scripting.executeScript({
    target: { tabId: tab.id }, // Specify the target tab
    files: ['content.js']      // Specify the file to inject
  });
});