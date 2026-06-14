<div align="center">

# 🌍 EcoNova

### AI-Powered Sustainability Intelligence Platform

**EcoNova helps individuals understand, track, and reduce their carbon footprint through AI-powered sustainability insights, habit-building systems, and personalized climate intelligence.**

[![Live Demo](https://img.shields.io/badge/Demo-Live-brightgreen?style=for-the-badge&logo=vercel)](https://eco-nova23.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/Code-Repository-blue?style=for-the-badge&logo=github)](https://github.com/anuragak-23/EcoNova)

<br/>

[![Status: Active](https://img.shields.io/badge/Status-Active-emerald?style=flat-square)](#)
[![Deployment: Vercel](https://img.shields.io/badge/Deployment-Vercel-black?style=flat-square)](#)

</div>

---

## 📱 Product Preview

Here is a preview of the EcoNova interface in action:

| **Landing Page** | **Carbon Calculator** |
|:---:|:---:|
| ![Landing Page](screenshots/landing-page.png) | ![Carbon Calculator](screenshots/calculator.png) |

| **Dashboard** | **AI Climate Coach** |
|:---:|:---:|
| ![Dashboard](screenshots/dashboard.png) | ![AI Coach](screenshots/ai-coach.png) |

| **Climate Profile** |
|:---:|
| ![Climate Profile](screenshots/profile.png) |

---

## 💡 Why EcoNova?

Climate change is one of the defining challenges of our generation. 

While most carbon calculators provide information, they rarely help users build sustainable habits. They tell you your score, but leave you feeling overwhelmed and unmotivated to change.

**EcoNova was created to bridge the gap between awareness and action.** We turn passive data into active habits, helping you make sustainable choices every day.

---

## ⚡ What Makes EcoNova Different?

EcoNova redesigns carbon accounting from the ground up, contrasting traditional static tools with a dynamic, habit-forming experience:

| **Traditional Carbon Calculators** | **EcoNova** |
| :--- | :--- |
|  **Static calculations** done once a year | 🔄 **Dynamic tracking** that updates in real time |
|  **Generic recommendations** list | 🤖 **AI Sustainability Coach** with tailored advice |
|  **No engagement** or incentive | 🏆 **Gamified progression** with points & streaks |
|  **Awareness only** | 🌱 **Habit formation** built around loggable actions |

---

## ✨ Key Features

<div align="center">

### 🤖 AI Sustainability Coach
Receive personalized recommendations and real-time carbon-reduction strategies powered by Google Gemini.

### 📊 Carbon Analytics Dashboard
Visualize your emissions breakdown and track savings trends over time using interactive Chart.js widgets.

### 🧮 Carbon Footprint Calculator
Assess your emissions across transportation, energy, food, and lifestyle in under 3 minutes.

### 🌱 Climate Profile
Track your sustainability journey, monitor your Evolving Carbon Avatar rank, and showcase your carbon rank.

### 🏆 Gamification
Stay motivated with achievements, daily logging streaks (with audio celebrations), levels, and points rewards.

### 📈 Progress Tracking
Monitor long-term environmental impacts and visualize 10-year emissions projections.

</div>

---

## 🔄 How EcoNova Works

EcoNova is built around a continuous cycle of carbon reduction and behavioral science:

```
[ Step 1: Calculate Footprint ] 
              │
              ▼
[ Step 2: Get AI Coach Insights ] 
              │
              ▼
[ Step 3: Take Eco-Friendly Actions ] 
              │
              ▼
[ Step 4: Build Daily Log Streaks ] 
              │
              ▼
[ Step 5: Track Long-Term Progress ]
```

---

## 🌍 Impact Vision

Individual actions, when scaled, can change the planet. 

> [!IMPORTANT]
> If **one million users** reduce their carbon footprint by **only 10%** using EcoNova, the collective impact could save **millions of tonnes of CO₂ annually**—equivalent to taking hundreds of thousands of internal combustion engine vehicles off the road.
> 
> We believe in the power of collective micro-actions to drive massive global impact.

---

## 📸 Screenshots Gallery

| **Interface** | **Preview Link** |
| :--- | :--- |
| **Landing Page** | [View Screen](screenshots/landing-page.png) |
| **Dashboard** | [View Screen](screenshots/dashboard.png) |
| **AI Coach** | [View Screen](screenshots/ai-coach.png) |
| **Calculator** | [View Screen](screenshots/calculator.png) |
| **Climate Profile** | [View Screen](screenshots/profile.png) |

> [!NOTE]
> Contributors: Please place screenshots of the interface inside the `/screenshots` directory.

---

## 🛠️ Technology Stack

*   **Frontend**: HTML5, Vanilla CSS3 (Custom properties/transitions), ES6+ JavaScript.
*   **AI**: Google Gemini 1.5 Flash (via secure backend REST endpoints).
*   **Authentication**: Firebase Authentication with dynamic demo fallback.
*   **Visualization**: Chart.js (custom gradients & animated trend lines).
*   **Deployment**: Vercel (Static hosting + Node.js Serverless Functions).
*   **Storage**: LocalStorage API for offline persistence and session state.

---

## ⚙️ System Architecture

EcoNova is engineered as a secure, fast, and modern static application powered by Serverless backend routes:

```mermaid
graph TD

    User[User] --> EcoNova[EcoNova Client App]

    subgraph Frontend
        Auth[Dual-Mode Auth]
        Calculator[Carbon Calculator]
        Dashboard[Analytics Dashboard]
        AICoach[AI Climate Coach]
        Avatar[Carbon Avatar]

        EcoNova --> Auth
        EcoNova --> Calculator
        EcoNova --> Dashboard
        EcoNova --> AICoach
        EcoNova --> Avatar
    end

    subgraph Backend
        FirebaseProxy[Firebase Config API]
        GeminiProxy[Gemini API Route]
        GeminiAPI[Google Gemini API]

        Auth --> FirebaseProxy
        AICoach --> GeminiProxy
        GeminiProxy --> GeminiAPI
    end
```
---

## 🚀 Getting Started

### Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/anuragak-23/EcoNova.git
   cd EcoNova
   ```
2. **Configure environment variables**: Copy `.env.local.example` to `.env.local` and add your `GEMINI_API_KEY` (and optional Firebase credentials).
3. **Run a local server**:
   ```bash
   python -m http.server 8000
   ```

### Vercel Deployment

1. **Import project**: Connect your GitHub repository to [Vercel](https://vercel.com).
2. **Configure environment variables**: Add your `GEMINI_API_KEY` in Vercel's **Environment Variables** settings.
3. **Deploy**: Click **Deploy** to automatically build and launch the static client and serverless API endpoints.

---

## 🔮 Roadmap

### Near-Term
*   👥 **Community Challenges**: Launch collaborative group challenges.
*   🧠 **Advanced AI Insights**: Multi-variable prompt personalization.
*   🔮 **Carbon Forecasting**: Future emission scenarios modeling.

### Long-Term
*   🔌 **Smart Meter Integration**: Auto-sync utility consumption.
*   📡 **IoT Sustainability Tracking**: Real-time smart plug load measurements.
*   📱 **Mobile App**: Native iOS/Android clients (PWA widgets).
*   🌱 **Carbon Offset Marketplace**: Link verified offsetting projects.

---


---

**Built with 💚 for a greener planet**
