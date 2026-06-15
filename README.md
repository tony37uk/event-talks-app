# BigQuery Release Pulse

An elegant, responsive dashboard for viewing, searching, filtering, and sharing the latest Google Cloud BigQuery release notes in real-time. Built using a **Python Flask** backend and clean **Vanilla HTML5, CSS3, and ES6 JavaScript**.

## ✨ Key Features
*   **Split Atom Parsing**: Parses daily consolidated updates into individual categorized items.
*   **Color-Coded Classification**: Highlights updates using custom styled badges (`Feature`, `Change`, `Breaking`, `Announcement`, `Issue`, `General`).
*   **Pulsing Alert Boundaries**: Draws attention to critical `Breaking` change updates using an animated glow.
*   **Responsive Timeline**: Grouped chronologically under bold dates, fully responsive from desktops down to mobile screens.
*   **Instant Search & Filters**: Search description text, dates, or filter cards by category client-side.
*   **Copy to Clipboard**: Quick copy button on each card that captures the update summary and source link with a 2-second visual confirmation ("Copied!").
*   **Export to CSV**: Client-side CSV generator that downloads the currently filtered/searched list of updates.
*   **Sliding Theme Switcher Toggle**: Pill-shaped custom toggle switch in the header that swaps color schemes (light/dark) by dynamically overriding CSS root variables (saves configuration to `localStorage`).
*   **Twitter/X Intent Integration**: Custom draft composer modal that automatically parses and prepares a formatted tweet snippet, complete with hashtags, source documentation links, and character validation (max 280).

---

## 🛠️ Tech Stack
*   **Backend**: Python, Flask (lightweight proxies and RSS/Atom XML parsers)
*   **Frontend**: Plain HTML5, Vanilla CSS3, Vanilla ES6 JavaScript (zero dependency)
*   **Data Source**: Official Google Cloud [BigQuery Release Notes XML Feed](https://docs.cloud.google.com/feeds/bigquery-release-notes.xml)

---

## 📂 File Layout
```text
bq_release_notes_app/
├── app.py                  # Core Flask server, routing, and feed parsing
├── requirements.txt        # Python pip dependency manifest
├── .gitignore              # Ignored cache, virtual environment, and system logs
├── README.md               # Getting started instructions and feature breakdown
├── templates/
│   └── index.html          # Semantic HTML5 base dashboard layout
└── static/
    ├── style.css           # Glassmorphic layout styles and theme tokens
    └── app.js              # State management, UI actions, and Twitter sharing callbacks
```

---

## 🚀 Getting Started

### 📋 Prerequisites
*   Python 3.8 or higher installed on your machine.

### ⚙️ Installation & Setup
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/tony37uk/event-talks-app.git
    cd event-talks-app
    ```
2.  **Create a Virtual Environment**:
    *   **Windows**:
        ```bash
        python -m venv .venv
        ```
    *   **macOS/Linux**:
        ```bash
        python3 -m venv .venv
        ```
3.  **Activate the Environment**:
    *   **Windows (Command Prompt)**:
        ```cmd
        .venv\Scripts\activate.bat
        ```
    *   **Windows (PowerShell)**:
        ```powershell
        .venv\Scripts\Activate.ps1
        ```
    *   **macOS/Linux**:
        ```bash
        source .venv/bin/activate
        ```
4.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

### ⚡ Running the Application
Start the development server:
```bash
python app.py
```
Open **[http://127.0.0.1:5000](http://127.0.0.1:5000)** in your web browser.

---

## 📘 How to Use
1.  **Refresh Feed**: Click the **Refresh Feed** button in the header. The spinner will rotate as the server fetches live updates from Google Cloud.
2.  **Search Notes**: Type key phrases like "Gemini", "UDF", or "Materialized View" in the search bar. The timeline will filter instantly as you type.
3.  **Category Filtering**: Select specific pills (e.g. `Breaking`, `Features`) to view updates matching that category.
4.  **Copy Card**: Click the **Copy** button on any release note card. The button will momentarily display a green "Copied!" check to confirm the formatted summary is in your clipboard.
5.  **Export CSV**: Click the **Export CSV** button in the header actions to download a sanitized spreadsheet of the currently filtered view.
6.  **Share to Twitter / X**:
    *   Click the **Share** button on any card.
    *   The composer modal will overlay displaying the formatted draft.
    *   Modify the text. The count at the bottom ensures you stay within the 280-character limit.
    *   Click **Tweet** to open the Twitter/X Web Intent composer in a new tab.
7.  **Toggle Theme**: Toggle the sliding switch in the header to transition between Dark and Light mode.
