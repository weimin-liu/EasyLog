# EasyLog

This is a simple journal application built with JavaScript and Node.js. The application allows users to create and view journal entries on a calendar.

## How It Works

The application uses a SQLite database to store journal entries. Each entry is associated with a date. The front-end of the application is a calendar built with FullCalendar. Users can click on a date to view the journal entry for that date. If no entry exists, they can create a new one.

## Features

- View a calendar of journal entries
- Click on a date to view the journal entry for that date
- Create a new journal entry for a date
- Edit an existing journal entry
- View a list of all journal entries

## How to Run

1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Install the necessary npm packages using `npm install`.
4. Start the server using `node server.js`.
5. Open a web browser and navigate to `http://localhost:3000` to view the application.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)