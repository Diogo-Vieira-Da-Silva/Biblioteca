 📝 Development Process

The project began with the creation and configuration of the SQL database. During the initial implementation, structural and logical issues were identified due to the way the database schema and functions had been designed. As a result, adjustments were required to ensure proper behavior and compatibility with the system requirements.

To address these issues, the database structure was redesigned and optimized using previous projects as references. This approach helped establish a more reliable and scalable foundation for the application.

After stabilizing the database, development proceeded to the user authentication module. I first created the index.html, script.js and style.css and saved the project on github, after that I initialized on the terminal the method to make the connection with the sql work, with the commands "npm init -y" and "npm install express mysql2", after that, The login page interface was built using Bootstrap and CSS to ensure a clean layout, responsiveness, and an improved user experience. Once the visual components were completed, functional logic and validations were implemented, including constraints to prevent duplicate account creation.

Subsequently, the book registration feature was developed. Although initial progress was impacted by unexpected XAMPP failures, the development continued on alternative machines to maintain workflow continuity. The feature was successfully implemented, allowing proper association between users and registered books, following relational database principles.

By the end of the process, the system achieved full integration between front-end, back-end, and database components, resulting in a stable and functional application.

⚙️ Project Setup
📌 1. Database Configuration

Create and configure the MySQL database according to the project schema.

📌 2. Front-end Structure

Use Bootstrap and CSS to build a responsive and user-friendly interface for authentication and registration pages.

📌 3. Core Features

The system includes:

User authentication (login and registration)

Duplicate account validation

Book registration

User–book relationship management

▶️ Running the Application

Start the local server environment (e.g., XAMPP), then run the project to test all features and integrations.