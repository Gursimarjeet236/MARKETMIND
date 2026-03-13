# Market-lens

Market-lens is a comprehensive financial market analysis platform designed to provide traders and investors with real-time insights, news, and predictive analytics. Built with a modern tech stack, it offers a seamless and interactive user experience.

## Features

- **📊 Interactive Dashboard**: Get a high-level overview of market performance and key metrics at a glance.
- **📈 Real-time Charts**: Advanced charting capabilities to track stock prices and market trends in real-time.
- **📰 Financial News**: Stay updated with the latest financial news and sentiment analysis to make informed decisions.
- **🔮 Market Predictions**: Leverage predictive analytics to anticipate market movements.
- **🤖 AI Assistant**: Context-aware AI assistant to answer your market-related queries.
- **🔐 Secure Authentication**: User accounts and secure login functionality.
- **🌓 Dark/Light Mode**: Fully responsive design with theme support.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express (inferred structure)
- **Database**: MongoDB (via Mongoose)
- **State Management**: React Context API
- **Routing**: React Router DOM

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (Node Package Manager)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd market-lens
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Setup:**
    
    Create a `.env` file in the root directory and add necessary environment variables (e.g., API keys, Database URLs).

4.  **Run the Development Server:**

    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:8080` (or similar, check console output).

## Scripts

- `npm run dev`: Start the development server.
- `npm run build`: Build the application for production.
- `npm run lint`: Run ESLint to check for code quality issues.
- `npm run preview`: Preview the production build locally.

## Project Structure

- `src/components`: Reusable UI components.
- `src/pages`: Application views/routes (Dashboard, News, Charts, etc.).
- `src/contexts`: React Context definitions (e.g., AuthContext).
- `server`: Backend server code (APIs, Models).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
