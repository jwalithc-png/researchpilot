# ResearchPilot — Autonomous AI Research Intelligence Platform 🚀

[![Live Demo](https://img.shields.io/badge/Demo-Firebase_Live-0284c7?style=for-the-badge&logo=firebase)](https://researchpilot-d6b95.web.app)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-3D_Visuals-black?style=for-the-badge&logo=threedotjs)](https://threejs.org/)
[![n8n](https://img.shields.io/badge/n8n-Workflow_Automation-EA4B71?style=for-the-badge&logo=n8n)](https://n8n.io/)
[![Ollama](https://img.shields.io/badge/Ollama-gemma4:31b-white?style=for-the-badge&logo=ollama)](https://ollama.com/)

**ResearchPilot** is an autonomous multi-agent research intelligence platform designed to turn complex research questions into structured scientific intelligence dossiers, multi-dimensional comparative matrices, potential research gaps, and actionable experimental directions.

---

## 🌟 Key Features

### 1. Dual-Mode Multi-Agent Pipeline
* **🏠 Localhost (`http://localhost:3000`):** Automatically routes to your local **n8n Autonomous Workflow Engine** (`http://localhost:5678`), orchestrating 12 sequential agent reasoning nodes.
* **☁️ Cloud (`Firebase Hosting`):** Runs the high-speed direct cloud AI engine powered by **Google Gemini** and **Ollama**, executing all sequential stages in ~12 seconds with sub-second generation.

### 2. Autonomous Multi-Agent Reasoning Chain
1. **Research Question & Context Builder:** Gathers title, hypothesis question, domain, objective, documents, and web links.
2. **Research Planner Agent:** Formulates structured investigation areas, analytical decomposition, and workflow milestones.
3. **Paper & Document Analyzer Agent:** Analyzes provided documents, datasets, methodologies, and limitations with anti-hallucination guards.
4. **Research Comparison Agent:** Cross-evaluates methodologies, datasets, findings, and trade-offs.
5. **Relationship Discovery Agent:** Maps theoretical links, methodological affinities, and benchmark overlaps.
6. **Potential Research Gap Detection Agent:** Detects candidate gaps using calibrated confidence scores ($0.0$ to $1.0$).
7. **Research Direction Generator Agent:** Generates actionable titles, descriptions, reasoning, and evidence citations.
8. **Research Validation Agent & Gatekeeper:** Verifies empirical consistency and checks for ungrounded claims.

### 3. Interactive Copilot Chatbot (Ollama)
* **Model:** Powered by `gemma4:31b` via the Ollama Cloud API.
* **Context-Aware:** Automatically injects the active workspace's title, hypothesis question, domain, objective, and synthesized findings.
* **Features:** Floating launcher, quick prompt chips, real-time typing indicators, markdown formatting, copy-to-clipboard, and conversation reset.

### 4. Interactive 3D Visualizations (Three.js)
* **Welcome Page:** Constellation knowledge network with orbital particles and mouse parallax.
* **Authentication Page:** Dual-ring orbiting portal with smooth geometry transitions.
* **Workspace Construction:** Molecular assembly that builds nodes dynamically as you fill the workspace form.
* **Research Hub:** 8-node elliptical intelligence network orbiting a pulsing central core with particle flow simulation.

---

## 🏗️ 4-Page Architecture

1. **Welcome / Landing Page** (`src/pages/WelcomePage.tsx`) — Hero presentation with interactive 3D constellation.
2. **Login / Registration** (`src/pages/AuthPage.tsx`) — Firebase Authentication with session persistence.
3. **Create Research Workspace** (`src/pages/CreateWorkspacePage.tsx`) — Project configuration with dynamic 3D molecular assembly.
4. **Research Workspace** (`src/pages/ResearchWorkspacePage.tsx`) — Synthesized dossier, 2x4 intelligence grid, interactive 3D hub, and Ollama copilot chatbot.

---

## 🚀 Quick Start Guide

### Prerequisites
* Node.js 18+ installed
* (Optional for local n8n mode) n8n running on port `5678`

### Installation
```bash
# Clone the repository
git clone https://github.com/jwalithc-png/researchpilot.git
cd researchpilot

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Configure `.env`
Add your API keys to `.env`:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# AI Model Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GEMINI_MODEL=gemini-flash-lite-latest

# Ollama AI Configuration (Chatbot)
OLLAMA_API_KEY=your_ollama_api_key
VITE_OLLAMA_API_KEY=your_ollama_api_key
VITE_OLLAMA_MODEL=gemma4:31b
```

### Running Locally
```bash
# Start Vite development server
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Building for Production
```bash
npm run build
```

---

## 🔒 Security & Privacy

* No private keys or secrets are stored in the git repository or exposed client-side.
* Firebase Authentication protects research workspace data.
* Workspace documents and intelligence are scoped to the authenticated user UID via Firestore security rules and LocalStorage persistence.

---

## 📄 License
MIT License. © 2026 ResearchPilot. All rights reserved.
