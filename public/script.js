// Define a variable to hold the selected date
let selectedDate = null;

document.addEventListener('DOMContentLoaded', function() {
    var simplemde = new SimpleMDE({ element: document.getElementById("journal") });

    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        height: 'auto',
        dateClick: function(info) {
            // Update the selectedDate variable with the clicked date
            selectedDate = info.dateStr;
            // Load the journal entry for the clicked date
            loadJournalEntry(info.dateStr, simplemde);
        }
    });
    calendar.render();

    // Load today's journal entry or a placeholder
    var today = new Date().toISOString().split('T')[0];
    loadJournalEntry(today, simplemde);

    document.getElementById('saveButton').addEventListener('click', function() {
        if (selectedDate) {
            const content = simplemde.value();

            fetch('/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ date: selectedDate, content }),
            })
            .then(response => response.json())
            .then(data => console.log('Entry saved with ID:', data.id))
            .catch((error) => {
                console.error('Error:', error);
            });
        } else {
            console.error('No date selected');
        }
    });
});

function loadJournalEntry(date, simplemde) {
    fetch(`/get-entry?date=${date}`)
    .then(response => {
        if (response.ok) {
            return response.json();
        } else if (response.status === 404) {
            // If a 404 is returned, no entry exists for this date
            // Set the editor to a default new entry template
            throw new Error('Entry not found');
        } else {
            // For any other errors, throw an error to be caught by the catch block
            throw new Error('Failed to load entry');
        }
    })
    .then(data => {
        // Assuming the server response includes the entry content
        // under a property named 'content'
        simplemde.value(data.content);
    })
    .catch(error => {
        if (error.message === 'Entry not found') {
            // If no entry exists for the selected date, clear the editor
            // or set a default template for a new entry
            simplemde.value("# Journal Entry for " + date + "\n\nStart writing here...");
        } else {
            // Handle other errors, perhaps show a message to the user
            console.error('Error loading journal entry:', error);
        }
    });
}


const resizer = document.querySelector('.resizer');
let isResizing = false;

resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', () => {
        isResizing = false;
        document.removeEventListener('mousemove', handleMouseMove);
    });
});

function handleMouseMove(e) {
    if (!isResizing) return;
    const newWidth = e.clientX;
    document.querySelector('.calendar-column').style.width = `${newWidth}px`;
}


