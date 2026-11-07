
// ======================================
// TASKIFY - PERSONAL PRODUCTIVITY APP
// ======================================

// 1. GET HTML ELEMENTS

const taskInput = document.getElementById("task-input");
const dueDateInput = document.getElementById("due-date-input");
const reminderInput = document.getElementById("reminder-input");
const addTaskButton = document.getElementById("add-task-btn");

const taskList = document.getElementById("task-list");
const deletedTaskList = document.getElementById("deleted-task-list");

const dashboardStats = document.getElementById("dashboard-stats");
const tasksPage = document.getElementById("tasks-page");
const deletedPage = document.getElementById("deleted-page");
const calendarPage = document.getElementById("calendar-page");
const remindersPage = document.getElementById("reminders-page");

const taskHeading = document.getElementById("task-heading");
const taskDescription = document.getElementById("task-description");


const pageTitle = document.getElementById("page-title");
const pageSubtitle = document.getElementById("page-subtitle");

const calendarGrid = document.getElementById("calendar-grid");
const calendarMonth = document.getElementById("calendar-month");
const selectedDateHeading = document.getElementById("selected-date-heading");
const calendarDayTasks = document.getElementById("calendar-day-tasks");

const reminderList = document.getElementById("reminder-list");
const notificationButton = document.getElementById("enable-notifications-btn");
const notificationStatus = document.getElementById("notification-status");

const previousMonthButton = document.getElementById("previous-month");
const nextMonthButton = document.getElementById("next-month");


// 2. SIDEBAR ELEMENTS

const dashboardMenu = document.getElementById("dashboard-menu");
const allMenu = document.getElementById("all-menu");
const pendingMenu = document.getElementById("pending-menu");
const completedMenu = document.getElementById("completed-menu");
const calendarMenu = document.getElementById("calendar-menu");
const remindersMenu = document.getElementById("reminders-menu");
const deletedMenu = document.getElementById("deleted-menu");


// 3. LOAD SAVED TASKS

let savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];

let deletedTasks = JSON.parse(localStorage.getItem("deletedTasks")) || [];


// Upgrade old tasks without removing existing data

function upgradeTask(task) {

    if (typeof task === "string") {
        task = {
            text: task,
            completed: false
        };
    }

    return {
        ...task,
        createdAt: task.createdAt || new Date().toISOString(),
        dueDate: task.dueDate || "",
        reminderAt: task.reminderAt || "",
        completedAt: task.completedAt || null,
        notified: task.notified || false
    };
}

let tasks = savedTasks.map(upgradeTask);

deletedTasks = deletedTasks.map(upgradeTask);


// 4. APP VARIABLES

let currentFilter = "all";

let currentMonth = new Date();
currentMonth.setDate(1);

let selectedDate = getTodayDate();


// 5. DATE FUNCTIONS

function getTodayDate() {

    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function formatDate(dateString) {

    if (!dateString) {
        return "Not set";
    }

    const parts = dateString.split("-");

    const date = new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
    );

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}


function formatDateTime(dateString) {

    if (!dateString) {
        return "Not set";
    }

    return new Date(dateString).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}


// 6. SAVE TASKS

function saveTasks() {

    localStorage.setItem("tasks", JSON.stringify(tasks));

    localStorage.setItem("deletedTasks", JSON.stringify(deletedTasks));
}


// 7. UPDATE DASHBOARD NUMBERS

function updateStats() {

    const total = tasks.length;

    const completed = tasks.filter(function(task) {
        return task.completed;
    }).length;

    const pending = total - completed;

    document.getElementById("total-tasks").textContent = total;

    document.getElementById("completed-tasks").textContent = completed;

    document.getElementById("pending-tasks").textContent = pending;
}


// 8. SHOW EMPTY MESSAGE

function showEmptyMessage(container, message) {

    const emptyMessage = document.createElement("p");

    emptyMessage.classList.add("empty-message");

    emptyMessage.textContent = message;

    container.appendChild(emptyMessage);
}


// 9. CREATE ACTIVE TASK CARD

function createTaskCard(task, container) {

    const index = tasks.indexOf(task);

    const taskItem = document.createElement("div");

    taskItem.classList.add("task-item");

    if (task.completed) {
        taskItem.classList.add("completed");
    }


    // Task main section

    const taskMain = document.createElement("div");

    taskMain.classList.add("task-main");


    // Checkbox

    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";

    checkbox.checked = task.completed;

    checkbox.addEventListener("change", function() {

        tasks[index].completed = checkbox.checked;

        tasks[index].completedAt = checkbox.checked
            ? new Date().toISOString()
            : null;

        saveTasks();

        displayTasks();

        displayCalendar();

        displayReminders();
    });


    // Task name

    const taskName = document.createElement("span");

    taskName.classList.add("task-name");

    taskName.textContent = task.text;

    // Edit task by clicking its name

taskName.style.cursor = "pointer";

taskName.addEventListener("click", function() {

    const updatedTask = prompt("Edit your task:", task.text);

    if (updatedTask === null) {
        return;
    }

    if (updatedTask.trim() === "") {
        alert("Task name cannot be empty!");
        return;
    }

    task.text = updatedTask.trim();

    saveTasks();

    displayTasks();

    displayCalendar();

    displayReminders();
});

    // Task status

    const status = document.createElement("span");

    status.classList.add("task-status");

    status.textContent = task.completed ? "Completed" : "Pending";


    taskMain.appendChild(checkbox);

    taskMain.appendChild(taskName);

    taskMain.appendChild(status);


    // Task dates

    const metadata = document.createElement("div");

    metadata.classList.add("task-meta");

    const createdDate = document.createElement("span");

    createdDate.textContent = "Created: " + formatDate(
        task.createdAt.slice(0, 10)
    );

    const dueDate = document.createElement("span");

    dueDate.textContent = "Due: " + formatDate(task.dueDate);

    metadata.appendChild(createdDate);

    metadata.appendChild(dueDate);


    if (task.reminderAt) {

        const reminderDate = document.createElement("span");

        reminderDate.textContent =
            "Reminder: " + formatDateTime(task.reminderAt);

        metadata.appendChild(reminderDate);
    }


    if (task.completedAt) {

        const completedDate = document.createElement("span");

        completedDate.textContent =
            "Completed: " + formatDateTime(task.completedAt);

        metadata.appendChild(completedDate);
    }


    // Delete button

    const actions = document.createElement("div");

    actions.classList.add("task-actions");

    const deleteButton = document.createElement("button");

    deleteButton.textContent = "Delete";

    deleteButton.classList.add("delete-btn");

    deleteButton.addEventListener("click", function() {

        deletedTasks.push(task);

        tasks.splice(index, 1);

        saveTasks();

        displayTasks();

        displayCalendar();

        displayReminders();
    });


    actions.appendChild(deleteButton);

    taskItem.appendChild(taskMain);

    taskItem.appendChild(metadata);

    taskItem.appendChild(actions);

    container.appendChild(taskItem);
}


// 10. DISPLAY ACTIVE TASKS

function displayTasks() {

    taskList.innerHTML = "";

    const filteredTasks = tasks.filter(function(task) {

        if (currentFilter === "pending") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });


    if (filteredTasks.length === 0) {

        showEmptyMessage(taskList, "No tasks to display yet.");

    } else {

        filteredTasks.forEach(function(task) {

            createTaskCard(task, taskList);

        });
    }

    updateStats();
}


// 11. DISPLAY DELETED TASKS

function displayDeletedTasks() {

    deletedTaskList.innerHTML = "";

    if (deletedTasks.length === 0) {

        showEmptyMessage(
            deletedTaskList,
            "No deleted tasks yet. Your deleted tasks will appear here!"
        );

        return;
    }


    deletedTasks.forEach(function(task, index) {

        const taskItem = document.createElement("div");

        taskItem.classList.add("task-item");


        const taskName = document.createElement("span");

        taskName.classList.add("task-name");

        taskName.textContent = task.text;


        const metadata = document.createElement("div");

        metadata.classList.add("task-meta");

        metadata.textContent =
            "Created: " + formatDate(task.createdAt.slice(0, 10));


        const actions = document.createElement("div");

        actions.classList.add("task-actions");


        // Restore button

        const restoreButton = document.createElement("button");

        restoreButton.textContent = "Restore";

        restoreButton.classList.add("restore-btn");

        restoreButton.addEventListener("click", function() {

            tasks.push(task);

            deletedTasks.splice(index, 1);

            saveTasks();

            displayTasks();

            displayDeletedTasks();

            displayCalendar();

            displayReminders();
        });


        // Permanent delete button

        const permanentDeleteButton = document.createElement("button");

        permanentDeleteButton.textContent = "Delete Permanently";

        permanentDeleteButton.classList.add("permanent-delete-btn");

        permanentDeleteButton.addEventListener("click", function() {

            const confirmDelete = confirm(
                "Are you sure you want to permanently delete this task?"
            );

            if (confirmDelete) {

                deletedTasks.splice(index, 1);

                saveTasks();

                displayDeletedTasks();
            }
        });


        actions.appendChild(restoreButton);

        actions.appendChild(permanentDeleteButton);

        taskItem.appendChild(taskName);

        taskItem.appendChild(metadata);

        taskItem.appendChild(actions);

        deletedTaskList.appendChild(taskItem);
    });
}


// 12. ADD NEW TASK

addTaskButton.addEventListener("click", function() {

    const taskText = taskInput.value.trim();

    const dueDate = dueDateInput.value;

    

    const reminderAt = reminderInput.value;


    if (taskText === "") {

        alert("Please enter a task!");

        taskInput.focus();

        return;
    }


    if (reminderAt) {

        const reminderDate = new Date(reminderAt);

        if (isNaN(reminderDate.getTime())) {

            alert("Please enter a valid reminder date and time.");

            return;
        }
    }


    const newTask = {

        text: taskText,

        completed: false,

        createdAt: new Date().toISOString(),

        dueDate: dueDate,

        reminderAt: reminderAt,

        completedAt: null,

        notified: false
    };


    tasks.push(newTask);

    saveTasks();

    displayTasks();

    displayCalendar();

    displayReminders();


    taskInput.value = "";

    dueDateInput.value = "";

    reminderInput.value = "";
});


// 13. DISPLAY CALENDAR

function displayCalendar() {

    calendarGrid.innerHTML = "";

    const year = currentMonth.getFullYear();

    const month = currentMonth.getMonth();


    const monthName = currentMonth.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric"
    });

    calendarMonth.textContent = monthName;


    const firstDay = new Date(year, month, 1).getDay();

    const daysInMonth = new Date(year, month + 1, 0).getDate();


    // Empty spaces before the first day

    for (let i = 0; i < firstDay; i++) {

        const emptyCell = document.createElement("div");

        emptyCell.classList.add("calendar-day", "empty");

        calendarGrid.appendChild(emptyCell);
    }


    // Create calendar dates

    for (let day = 1; day <= daysInMonth; day++) {

        const dateString =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;


        const dayButton = document.createElement("button");

        dayButton.classList.add("calendar-day");


        if (dateString === getTodayDate()) {
            dayButton.classList.add("today");
        }

        if (dateString === selectedDate) {
            dayButton.classList.add("selected");
        }


        const number = document.createElement("span");

        number.classList.add("calendar-day-number");

        number.textContent = day;

        dayButton.appendChild(number);


        // Check if this date has tasks or reminders

        const hasEvents = tasks.some(function(task) {

            return task.dueDate === dateString ||
                (task.reminderAt && task.reminderAt.startsWith(dateString));
        });


        if (hasEvents) {

            const dot = document.createElement("span");

            dot.classList.add("calendar-dot");

            dayButton.appendChild(dot);
        }


        dayButton.addEventListener("click", function() {

            selectedDate = dateString;

            displayCalendar();
        });


        calendarGrid.appendChild(dayButton);
    }


    displayCalendarDay();
}


// 14. SHOW TASKS FOR SELECTED CALENDAR DATE

function displayCalendarDay() {

    calendarDayTasks.innerHTML = "";

    selectedDateHeading.textContent =
        formatDate(selectedDate);


    const dayTasks = tasks.filter(function(task) {

        return task.dueDate === selectedDate ||
            (task.reminderAt && task.reminderAt.startsWith(selectedDate));
    });


    if (dayTasks.length === 0) {

        showEmptyMessage(
            calendarDayTasks,
            "No tasks or reminders scheduled for this date."
        );

        return;
    }


    dayTasks.forEach(function(task) {

        createTaskCard(task, calendarDayTasks);
    });
}


// 15. CHANGE CALENDAR MONTH

previousMonthButton.addEventListener("click", function() {

    currentMonth.setMonth(currentMonth.getMonth() - 1);

    displayCalendar();
});


nextMonthButton.addEventListener("click", function() {

    currentMonth.setMonth(currentMonth.getMonth() + 1);

    displayCalendar();
});


// 16. DISPLAY REMINDERS

function displayReminders() {

    reminderList.innerHTML = "";


    const reminderTasks = tasks
        .filter(function(task) {
            return task.reminderAt;
        })
        .sort(function(a, b) {
            return new Date(a.reminderAt) - new Date(b.reminderAt);
        });


    if (reminderTasks.length === 0) {

        showEmptyMessage(
            reminderList,
            "No reminders yet. Add a reminder while creating a task!"
        );

        return;
    }


    reminderTasks.forEach(function(task) {

        createTaskCard(task, reminderList);
    });
}


// 17. ENABLE BROWSER NOTIFICATIONS

function updateNotificationStatus() {

    if (!("Notification" in window)) {

        notificationStatus.textContent =
            "Your browser does not support notifications.";

        return;
    }


    if (Notification.permission === "granted") {

        notificationStatus.textContent =
            "Notifications are enabled! Taskify can remind you when this page is open.";

        notificationButton.textContent = "Notifications Enabled";

    } else if (Notification.permission === "denied") {

        notificationStatus.textContent =
            "Notifications are blocked in your browser settings.";

    } else {

        notificationStatus.textContent =
            "Notifications have not been enabled yet.";
    }
}


notificationButton.addEventListener("click", async function() {

    if (!("Notification" in window)) {

        alert("Your browser does not support notifications.");

        return;
    }


    const permission = await Notification.requestPermission();


    updateNotificationStatus();

    if (permission === "granted") {

        checkReminders();
    }
});


// 18. CHECK REMINDERS

function checkReminders() {

    if (!("Notification" in window)) {
        return;
    }

    if (Notification.permission !== "granted") {
        return;
    }


    const now = new Date();


    tasks.forEach(function(task) {

        if (!task.reminderAt || task.notified) {
            return;
        }


        const reminderDate = new Date(task.reminderAt);

        if (isNaN(reminderDate.getTime())) {
            return;
        }


        if (reminderDate <= now) {

            const notification = new Notification(
                "Taskify Reminder 🔔",
                {
                    body: "Don't forget: " + task.text
                }
            );


            notification.onclick = function() {

                window.focus();

                showPage("reminders");
            };


            task.notified = true;

            saveTasks();
        }
    });
}


// 19. SHOW SELECTED PAGE

function showPage(page) {

    dashboardStats.style.display = "none";

    tasksPage.style.display = "none";

    deletedPage.style.display = "none";

    calendarPage.style.display = "none";

    remindersPage.style.display = "none";


    document.querySelectorAll(".menu-item").forEach(function(item) {

        item.classList.remove("active");
    });


    if (page === "dashboard") {

        pageTitle.textContent = "Welcome Back!";

        pageSubtitle.textContent = "Let's make today productive.";

        dashboardStats.style.display = "grid";

        tasksPage.style.display = "block";

        taskHeading.textContent = "My Tasks";

        taskDescription.textContent =
            "Keep track of everything you need to do.";

        currentFilter = "all";

        dashboardMenu.classList.add("active");
    }


    if (page === "all") {

        pageTitle.textContent = "All Tasks";

        pageSubtitle.textContent = "Everything you need to get done.";

        tasksPage.style.display = "block";

        taskHeading.textContent = "All Tasks";

        taskDescription.textContent = "Your complete task list.";

        currentFilter = "all";

        allMenu.classList.add("active");
    }


    if (page === "pending") {

        pageTitle.textContent = "Pending Tasks";

        pageSubtitle.textContent = "Things still waiting to be completed.";

        tasksPage.style.display = "block";

        taskHeading.textContent = "Pending Tasks";

        taskDescription.textContent = "Your unfinished tasks.";

        currentFilter = "pending";

        pendingMenu.classList.add("active");
    }


    if (page === "completed") {

        pageTitle.textContent = "Completed Tasks";

        pageSubtitle.textContent = "Look at everything you've accomplished!";

        tasksPage.style.display = "block";

        taskHeading.textContent = "Completed Tasks";

        taskDescription.textContent = "Your finished tasks.";

        currentFilter = "completed";

        completedMenu.classList.add("active");
    }


    if (page === "calendar") {

        pageTitle.textContent = "My Calendar";

        pageSubtitle.textContent = "See your tasks and important dates.";

        calendarPage.style.display = "block";

        calendarMenu.classList.add("active");

        displayCalendar();
    }


    if (page === "reminders") {

        pageTitle.textContent = "My Reminders";

        pageSubtitle.textContent = "Don't forget the important things.";

        remindersPage.style.display = "block";

        remindersMenu.classList.add("active");

        displayReminders();

        updateNotificationStatus();
    }


    if (page === "deleted") {

        pageTitle.textContent = "Recently Deleted";

        pageSubtitle.textContent = "Your deleted tasks are kept here.";

        deletedPage.style.display = "block";

        deletedMenu.classList.add("active");

        displayDeletedTasks();
    }


    if (page === "dashboard" ||
        page === "all" ||
        page === "pending" ||
        page === "completed") {

        displayTasks();
    }
}


// 20. SIDEBAR CLICK EVENTS

dashboardMenu.addEventListener("click", function(event) {

    event.preventDefault();

    showPage("dashboard");
});


allMenu.addEventListener("click", function(event) {

    event.preventDefault();

    showPage("all");
});


pendingMenu.addEventListener("click", function(event) {

    event.preventDefault();

    showPage("pending");
});


completedMenu.addEventListener("click", function(event) {

    event.preventDefault();

    showPage("completed");
});


calendarMenu.addEventListener("click", function(event) {

    event.preventDefault();

    showPage("calendar");
});


remindersMenu.addEventListener("click", function(event) {

    event.preventDefault();

    showPage("reminders");
});


deletedMenu.addEventListener("click", function(event) {

    event.preventDefault();

    showPage("deleted");
});


// 21. INITIALIZE TASKIFY

saveTasks();

showPage("dashboard");

updateNotificationStatus();

checkReminders();


// Check for due reminders every 30 seconds while Taskify is open

setInterval(checkReminders, 30000);
