🎙️ Conversational Voice AI

An AI-powered voice assistant that lets users interact with artificial intelligence through natural voice conversations.

✨ Features

- 🎤 Real-time voice interaction
- 🤖 AI-powered conversational responses
- 🔊 Audio input and output
- 🎨 Interactive visual interface
- ⚡ Fast and responsive experience
- 💬 Natural conversational experience

🛠️ Technologies Used

- React
- TypeScript
- Vite
- Google Gemini API
- HTML
- CSS

📸 Project Preview

Screenshots coming soon!

🚀 Getting Started

Follow these steps to run the project locally.

1. Clone the repository

git clone https://github.com/rohith2325/Conversational-Voice-AI.git

2. Open the project folder

cd Conversational-Voice-AI

3. Install dependencies

npm install

4. Configure your API key

Create a ".env.local" file in the project root and add:

VITE_GEMINI_API_KEY=your_gemini_api_key

Replace "your_gemini_api_key" with your own Gemini API key.

Security note: The current browser-based API key setup is suitable only for local experimentation. Vite exposes "VITE_" variables in browser code. For public deployment, use a secure backend or server-side token approach. Never publish your private API key.

5. Start the development server

npm run dev

Open the local URL displayed in your terminal.

📁 Project Structure

Conversational-Voice-AI/
│
├── components/
│   ├── SettingsControls.tsx
│   └── Visualizer.tsx
│
├── hooks/
│   └── useLiveAPI.ts
│
├── utils/
│   └── audio.ts
│
├── App.tsx
├── index.html
├── index.tsx
├── package.json
├── tsconfig.json
└── vite.config.ts

🔐 Environment Variables

The ".env.local" file contains your private development configuration.

It should never be uploaded to GitHub.

👨‍💻 Author

Rohith

GitHub: https://github.com/rohith2325