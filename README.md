# BigQuery Release Pulse

An elegant, responsive dashboard for viewing, searching, filtering, and sharing the latest Google Cloud BigQuery release notes in real-time. Built using a **Python Flask** backend and clean **Vanilla HTML5, CSS3, and ES6 JavaScript**.

## ✨ Key Features
*   **Split Atom parsing**: Parses daily consolidated updates into individual categorized items.
*   **Color-Coded Classification**: Highlights updates using custom styled badges (`Feature`, `Change`, `Breaking`, `Announcement`, `Issue`, `General`).
*   **Pulsing Alert Boundaries**: Draws attention to critical `Breaking` change updates using a animated glow.
*   **Responsive Timeline**: Grouped chronologically under bold dates, fully responsive from desktops down to mobile screens.
*   **Instant Search & Filters**: Search description text, dates, or filter cards by category client-side.
*   **Twitter/X Intent Integration**: Custom draft composer modal that automatically parses and prepares a formatted tweet snippet, complete with hashtags, source documentation links, and character validation (max 280).
*   **Light & Dark Themes**: Sleek glassmorphic dark interface by default, with an animated toggle for a clean light layout (preferences are synchronized to `localStorage`).

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
4.  **Share to Twitter / X**:
    *   Find an update card and click the **Share** button.
    *   The composer modal will overlay displaying the formatted draft.
    *   Modify the text inside the text area. The count at the bottom helps verify you stay within the 280-character limit.
    *   Click **Tweet** to open the Twitter/X Web Intent composer in a new tab.
5.  **Toggle Theme**: Click the theme toggle icon (Sun/Moon) in the header to switch between Dark and Light mode.
