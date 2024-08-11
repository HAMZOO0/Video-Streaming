.gitkeep use to track empty folder

use .gitignore genrators

---

we use pretter to formate code for team

---

npm i -D use to install dev depedences which are just use in developemnt side not in prodcution

---

![alt text](image.png)

- controllers use for functaionallty

- db for db connection

- middleware for middleware code

- routes for routes we write here not in main file

- models for db models

- utils ate utilities like file upload etc we use this again and again in our project

---

# DB learning

<p>1: DB cause the problem su always use try catch

2: DB is in another contenent so it take time for db tranfer and load etc , so we aysnc awit

</p>

---

## use dotenv thouigh import syntex

### "dev": "nodemon -r dotenv/config --experimental-json-modules src/index.js"

nodemon: A tool that automatically restarts your Node.js server whenever you make changes to your code. This means you don't have to stop and start the server manually every time you update your code.

-r dotenv/config: This part tells nodemon to load environment variables from a file named .env before running your code. Environment variables are special settings (like passwords or API keys) that you don't want to hard-code into your program.

--experimental-json-modules: This flag allows you to use a new feature in Node.js where you can import JSON files directly as modules. It's a bit experimental, meaning it's not fully finalized, but it lets you do some cool things with JSON data in your code.

src/index.js: This is the main file where your server code lives. nodemon will watch this file (and others in your project) for changes and restart the server when you make updates.

---

process.exit(0); // Success
process.exit(1); // General error
process.exit(2); // Misuse of shell builtins (according to Bash documentation)
// Custom codes can be used as well

---

### Aggregate Queries

: MongoDB mein, aggregate queries ek prakaar ke queries hote hain jo complex data analysis aur aggregation operations ke liye use hote hain. Ye queries data ko ek sath combine karte hain, filter karte hain, aur transformation karte hain.

### Pagination:

Pagination ek tarika hai jisse hum large data sets ko multiple pages mein divide karke dikhate hain, jisse user ko data ko manageable tarike se access karne mein madad milti hai.
