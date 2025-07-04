# de(con)struction

`de(con)struction` is a Chrome Extension that gradually erodes the visual structure of a website. Made using Gemini. 

---

## Installation

[Find it here](https://mcnoose.com/deconstruction/)

## How to Use

1.  Go to a website.
2.  Click the **de(con)struction** extension icon.

## How It Works (Technical Breakdown)

1.  **Disarming:** The script's first action is to clone and replace the entire `<body>` tag. This is an aggressive but effective method for stripping all dynamically attached JavaScript event listeners that could otherwise interfere or "fight back" against the deconstruction.
2.  **Shadow DOM Traversal:** It recursively finds every Shadow DOM on the page. This is critical for accessing and dismantling encapsulated web components, which are invisible to standard DOM queries.
3.  **Phased Erosion:** The script removes different element types in phases: scripts, styles, structure, lists & tables, media & images.
4.  **Action Bursts:** Within each phase, it processes elements in timed, rhythmic bursts.

## License

[MIT](https://choosealicense.com/licenses/mit/)