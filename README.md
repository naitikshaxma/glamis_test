AI Interviewer for GLA University
Welcome to the AI Interviewer project for GLA University! This project aims to provide students with a realistic interview practice platform, emulating real-world interview scenarios using state-of-the-art AI technologies.

Table of Contents
Introduction
Features
Technologies Used
Installation
Usage
Contributing
License
Contact
Introduction
The AI Interviewer project is designed to help students at GLA University prepare for job interviews. By leveraging advanced AI models, the platform simulates a real interview environment, allowing students to practice and improve their interview skills.

Features
Realistic Interview Simulation: Emulates real-world interview scenarios with AI.
Frontend: Built with React and styled using React-Tailwind.
Backend:
Node/Express for handling normal operations.
Django for managing machine learning models.
AI Integration: Utilizes OpenAI's API keys for Whisper and Turbo-4 to conduct the interviews.
Interactive UI: A user-friendly interface to ensure a seamless experience.
Technologies Used
Frontend
React: A JavaScript library for building user interfaces.
Vite: A modern frontend build tool for fast development.
React-Tailwind: A utility-first CSS framework for styling.
Backend
Node.js: JavaScript runtime built on Chrome's V8 JavaScript engine.
Express: Fast, unopinionated, minimalist web framework for Node.js.
Django: A high-level Python web framework that encourages rapid development.
OpenAI API: Utilized for AI interview simulations using Whisper and Turbo-4.
Installation
To get started with the project, follow these steps:

Clone the repository

bash
Copy code
git clone https://github.com/your-username/ai-interviewer-gla.git
cd ai-interviewer-gla
Install frontend dependencies

bash
Copy code
cd frontend
npm install
Install backend dependencies

bash
Copy code
cd backend
npm install
Install Django dependencies

bash
Copy code
cd ml-models
pip install -r requirements.txt
Set up environment variables

Create a .env file in the root directory and add your OpenAI API keys and other necessary configurations.
Usage
To run the project, you need to start both the frontend and backend servers:

Start the frontend server

bash
Copy code
cd frontend
npm run dev
Start the backend server

bash
Copy code
cd backend
npm start
Start the Django server

bash
Copy code
cd ml-models
python manage.py runserver
Contributing
We welcome contributions from the community! To contribute:

Fork the repository.
Create a new branch.
Make your changes and commit them.
Push to your fork and submit a pull request.
Please ensure your code adheres to our coding standards and includes relevant tests.

License
This project is licensed under the MIT License. See the LICENSE file for details.

Contact
For any questions or inquiries, please contact:

Project Lead: Your Name
GitHub Issues: Issues Page
We hope this project helps you in your interview preparations! Happy coding!


