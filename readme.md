# Fetch Lake Levels 🎣

**A Capstone IT Solution for Strategic Fishing in Texas Drought Conditions**

## 📖 Overview
**Fetch Lake Levels** is a custom web application designed to assist avid fishermen in selecting the best fishing locations based on real-time water level data.

With current drought conditions in Texas, many lake sections become inaccessible or "out of water," making it difficult to launch boats or access prime fishing spots. This IT solution aggregates daily water level data from various reservoirs to provide a single, easy-to-read dashboard for strategic decision-making.

## ✨ IT Solution & Features
This project provides a no/low-cost solution that eliminates the need for manual data tracking across multiple government websites.
* **Data Aggregation:** Automatically ingests daily water level data for key Texas reservoirs (e.g., Canyon, Amistad, Choke Canyon, O.H. Ivie, Travis).
* **Historical Comparison:** Displays a tabular view comparing today's levels against historical data points (1, 2, 7, 30, 90, 180, and 365 days ago).
* **Visual Trend Indicators:** Instantly identifies if water levels are rising (▲) or falling (▼) with color-coded indicators (Red/Green).
* **Data Visualization:** Interactive multi-line charts showing "Percent Full" trends over time using chart rendering libraries.

## 🛠️ Tech Stack
* **Platform:** Web-based Application
* **Programming Language:** JavaScript (Node.js & Vanilla JS)
* **Backend Architecture:**
    * **Data Ingestion:** Utilizes a `scheduled` handler to fetch and store daily metrics.
    * **Data Visualization:** Utilizes a `fetch` handler to serve formatted JSON to the frontend.
* **Frontend:** HTML5, CSS3, JavaScript.
* **Localization:** `Intl.DateTimeFormat` (en-CA) for standardized date/time formatting.

## 🗺️ Project Phases

### Phase 1: Analysis and Design Phase
This phase focuses on identifying the core problem—accessing viable fishing water during severe drought—and designing a low-cost architecture to solve it. Requirements gathering included identifying specific lakes of interest and defining the metrics (Elevation, Percent Full) required for the dashboard.

### Phase 2: Implementation
Current development involves coding the backend `scheduled` handlers for data scraping and building the frontend visualization logic (tables and line charts).

### Phase 3: Testing & Deployment
Future work includes user acceptance testing to verify data accuracy against official USGS/water sources and final deployment to the hosting platform.