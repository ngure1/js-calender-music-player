document.addEventListener("DOMContentLoaded", function () {
	const homeLink = document.getElementById("home-link");
	const calendarLink = document.getElementById("calendar-link");
	const musicLink = document.getElementById("music-link");
	const todoLink = document.getElementById("todo-link");
	const homeSection = document.getElementById("home");
	const calendarSection = document.getElementById("calendar");
	const musicSection = document.getElementById("music");
	const todoSection = document.getElementById("todo");

	homeLink.addEventListener("click", showSection.bind(null, homeSection));
	calendarLink.addEventListener(
		"click",
		showSection.bind(null, calendarSection)
	);
	musicLink.addEventListener("click", showSection.bind(null, musicSection));
	todoLink.addEventListener("click", showSection.bind(null, todoSection));

	function showSection(section) {
		[homeSection, calendarSection, musicSection, todoSection].forEach(
			(s) => (s.style.display = "none")
		);
		section.style.display = "block";
		if (section === calendarSection) renderCalendar();
		if (section === todoSection) renderTodoList();
	}

	// Calendar functionality
	const prevMonthBtn = document.getElementById("prev-month");
	const nextMonthBtn = document.getElementById("next-month");
	const currentMonthYear = document.getElementById("current-month-year");
	const calendarGrid = document.getElementById("calendar-grid");
	const eventForm = document.getElementById("event-form");
	const eventFormTitle = document.getElementById("event-form-title");
	const eventTitle = document.getElementById("event-title");
	const eventDate = document.getElementById("event-date");
	const eventDescription = document.getElementById("event-description");
	const saveEventBtn = document.getElementById("save-event");
	const deleteEventBtn = document.getElementById("delete-event");
	const cancelEventBtn = document.getElementById("cancel-event");
	const eventList = document.getElementById("events");

	let currentDate = new Date();
	let events = JSON.parse(localStorage.getItem("events")) || {};
	let currentEditingEvent = null;

	function renderCalendar() {
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const daysInMonth = lastDay.getDate();

		currentMonthYear.textContent = `${firstDay.toLocaleString("default", {
			month: "long",
		})} ${year}`;

		calendarGrid.innerHTML = "";
		const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		dayNames.forEach((day) => {
			const dayHeader = document.createElement("div");
			dayHeader.textContent = day;
			dayHeader.classList.add("calendar-header");
			calendarGrid.appendChild(dayHeader);
		});

		for (let i = 0; i < firstDay.getDay(); i++) {
			calendarGrid.appendChild(document.createElement("div"));
		}

		for (let day = 1; day <= daysInMonth; day++) {
			const dateDiv = document.createElement("div");
			dateDiv.textContent = day;
			dateDiv.classList.add("calendar-day");
			const dateString = formatDate(new Date(year, month, day));
			if (events[dateString]) {
				dateDiv.classList.add("has-event");
				const eventIndicator = document.createElement("div");
				eventIndicator.classList.add("event-indicator");
				dateDiv.appendChild(eventIndicator);
			}
			dateDiv.addEventListener("click", () => showEventForm(dateString));
			calendarGrid.appendChild(dateDiv);
		}

		renderEventList();
	}

	function formatDate(date) {
		return date.toISOString().split("T")[0];
	}

	function showEventForm(date, event = null) {
		eventDate.value = date;
		if (event) {
			eventTitle.value = event.title;
			eventDescription.value = event.description;
			eventFormTitle.textContent = "Edit Event";
			deleteEventBtn.style.display = "inline-block";
			currentEditingEvent = event;
		} else {
			eventTitle.value = "";
			eventDescription.value = "";
			eventFormTitle.textContent = "Add Event";
			deleteEventBtn.style.display = "none";
			currentEditingEvent = null;
		}
		eventForm.style.display = "block";
	}

	function saveEvent() {
		const date = eventDate.value;
		const title = eventTitle.value.trim();
		const description = eventDescription.value.trim();

		if (title === "") {
			alert("Event title cannot be empty. Please enter a title.");
			return;
		}

		if (!events[date]) {
			events[date] = [];
		}

		if (currentEditingEvent) {
			// Edit existing event
			const index = events[date].indexOf(currentEditingEvent);
			events[date][index] = { title, description };
		} else {
			// Add new event
			events[date].push({ title, description });
		}

		localStorage.setItem("events", JSON.stringify(events));
		eventForm.style.display = "none";
		renderCalendar();
	}

	function deleteEvent() {
		if (currentEditingEvent) {
			const date = eventDate.value;
			const index = events[date].indexOf(currentEditingEvent);
			events[date].splice(index, 1);
			if (events[date].length === 0) {
				delete events[date];
			}
			localStorage.setItem("events", JSON.stringify(events));
			eventForm.style.display = "none";
			renderCalendar();
		}
	}

	function renderEventList() {
		eventList.innerHTML = "";
		const sortedDates = Object.keys(events).sort();
		for (const date of sortedDates) {
			for (const event of events[date]) {
				const li = document.createElement("li");
				li.textContent = `${date}: ${event.title}`;
				li.addEventListener("click", () => showEventForm(date, event));
				eventList.appendChild(li);
			}
		}
	}

	prevMonthBtn.addEventListener("click", () => {
		currentDate.setMonth(currentDate.getMonth() - 1);
		renderCalendar();
	});

	nextMonthBtn.addEventListener("click", () => {
		currentDate.setMonth(currentDate.getMonth() + 1);
		renderCalendar();
	});

	saveEventBtn.addEventListener("click", saveEvent);
	deleteEventBtn.addEventListener("click", deleteEvent);
	cancelEventBtn.addEventListener("click", () => {
		eventForm.style.display = "none";
	});

	renderCalendar();

	// To-do list functionality
	const todoList = document.getElementById("todo-list");
	const newTodoInput = document.getElementById("new-todo");
	const addTodoBtn = document.getElementById("add-todo");

	let todos = JSON.parse(localStorage.getItem("todos")) || [];

	function renderTodoList() {
		todoList.innerHTML = "";
		todos.forEach((todo, index) => {
			const li = document.createElement("li");
			li.innerHTML = `
                <span class="${todo.completed ? "completed" : ""}">${
				todo.text
			}</span>
                <button class="toggle-todo" data-index="${index}">${
				todo.completed ? "Undo" : "Complete"
			}</button>
                <button class="delete-todo" data-index="${index}">Delete</button>
            `;
			todoList.appendChild(li);
		});
	}

	function addTodo() {
		const todoText = newTodoInput.value.trim();
		if (todoText !== "") {
			todos.push({ text: todoText, completed: false });
			localStorage.setItem("todos", JSON.stringify(todos));
			newTodoInput.value = "";
			renderTodoList();
		}
	}

	function toggleTodo(index) {
		todos[index].completed = !todos[index].completed;
		localStorage.setItem("todos", JSON.stringify(todos));
		renderTodoList();
	}

	function deleteTodo(index) {
		todos.splice(index, 1);
		localStorage.setItem("todos", JSON.stringify(todos));
		renderTodoList();
	}

	addTodoBtn.addEventListener("click", addTodo);

	todoList.addEventListener("click", (e) => {
		if (e.target.classList.contains("toggle-todo")) {
			toggleTodo(e.target.dataset.index);
		} else if (e.target.classList.contains("delete-todo")) {
			deleteTodo(e.target.dataset.index);
		}
	});

	renderTodoList();

});
