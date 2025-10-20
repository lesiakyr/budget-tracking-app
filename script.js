// Budget Tracker App JavaScript

// Global variables
let expenses = [];
let reminders = [];
let monthlyBudget = 0;
let currentSort = 'date-desc'; // Default sort by date, newest first
let currentFilter = 'all'; // Default filter shows all categories

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateDashboard();
    setupEventListeners();
});

// Load data from localStorage
function loadData() {
    const savedExpenses = localStorage.getItem('budgetTrackerExpenses');
    const savedReminders = localStorage.getItem('budgetTrackerReminders');
    const savedBudget = localStorage.getItem('budgetTrackerBudget');
    
    if (savedExpenses) {
        expenses = JSON.parse(savedExpenses);
    }
    
    if (savedReminders) {
        /*jshint -W041 */
        reminders = JSON.parse(savedReminders);
    }
    
    if (savedBudget) {
        monthlyBudget = parseFloat(savedBudget);
    }
    
    renderExpenses();
    renderReminders();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('budgetTrackerExpenses', JSON.stringify(expenses));
    localStorage.setItem('budgetTrackerReminders', JSON.stringify(reminders));
    localStorage.setItem('budgetTrackerBudget', monthlyBudget.toString());
}

// Setup event listeners
function setupEventListeners() {
    // Expense form
    document.getElementById('expenseForm').addEventListener('submit', addExpense);
    
    // Budget form
    document.getElementById('budgetForm').addEventListener('submit', setBudget);
    
    // Reminder form
    document.getElementById('reminderForm').addEventListener('submit', addReminder);
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        const budgetModal = document.getElementById('budgetModal');
        const reminderModal = document.getElementById('reminderModal');
        
        if (event.target === budgetModal) {
            closeBudgetModal();
        }
        if (event.target === reminderModal) {
            closeReminderModal();
        }
    });
}

// Add expense
function addExpense(event) {
    event.preventDefault();
    
    const description = document.getElementById('expenseDescription').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const category = document.getElementById('expenseCategory').value;
    
    if (!description || !amount || !category) {
        alert('Please fill in all fields');
        return;
    }
    
    const expense = {
        id: Date.now(),
        description: description,
        amount: amount,
        category: category,
        date: new Date().toISOString().split('T')[0]
    };
    
    expenses.unshift(expense); // Add to beginning of array
    saveData();
    renderExpenses();
    updateDashboard();
    
    // Clear form
    document.getElementById('expenseForm').reset();
    
    // Show success message
    showNotification('Expense added successfully!', 'success');
}

// Set budget
function setBudget(event) {
    event.preventDefault();
    
    const budget = parseFloat(document.getElementById('monthlyBudget').value);
    
    if (!budget || budget <= 0) {
        alert('Please enter a valid budget amount');
        return;
    }
    
    monthlyBudget = budget;
    saveData();
    updateDashboard();
    closeBudgetModal();
    
    showNotification('Budget set successfully!', 'success');
}

// Add reminder
function addReminder(event) {
    event.preventDefault();
    
    const name = document.getElementById('reminderName').value;
    const amount = parseFloat(document.getElementById('reminderAmount').value);
    const date = document.getElementById('reminderDate').value;
    const frequency = document.getElementById('reminderFrequency').value;
    
    if (!name || !amount || !date || !frequency) {
        alert('Please fill in all fields');
        return;
    }
    
    const reminder = {
        id: Date.now(),
        name: name,
        amount: amount,
        date: date,
        frequency: frequency,
        created: new Date().toISOString().split('T')[0]
    };
    
    reminders.unshift(reminder);
    saveData();
    renderReminders();
    closeReminderModal();
    
    // Clear form
    document.getElementById('reminderForm').reset();
    
    showNotification('Reminder added successfully!', 'success');
}

// Delete expense
function deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
        expenses = expenses.filter(expense => expense.id !== id);
        saveData();
        renderExpenses();
        updateDashboard();
        showNotification('Expense deleted!', 'info');
    }
}

// Delete reminder
function deleteReminder(id) {
    if (confirm('Are you sure you want to delete this reminder?')) {
        reminders = reminders.filter(reminder => reminder.id !== id);
        saveData();
        renderReminders();
        showNotification('Reminder deleted!', 'info');
    }
}

// Apply both filters and sorting
function applyFiltersAndSort() {
    const sortBy = document.getElementById('sortBy').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    currentSort = sortBy;
    currentFilter = categoryFilter;
    
    // First filter expenses by category
    let filteredExpenses = expenses;
    if (categoryFilter !== 'all') {
        filteredExpenses = expenses.filter(expense => expense.category === categoryFilter);
    }
    
    // Then sort the filtered expenses
    const sortedExpenses = filteredExpenses.sort((a, b) => {
        switch(sortBy) {
            case 'date-desc':
                return new Date(b.date) - new Date(a.date);
            case 'date-asc':
                return new Date(a.date) - new Date(b.date);
            case 'amount-desc':
                return b.amount - a.amount;
            case 'amount-asc':
                return a.amount - b.amount;
            default:
                return new Date(b.date) - new Date(a.date);
        }
    });
    
    renderExpensesList(sortedExpenses);
}

// Legacy function for backward compatibility
function sortExpenses() {
    applyFiltersAndSort();
}

// Render expenses list with given array
function renderExpensesList(expensesToRender) {
    const expensesList = document.getElementById('expensesList');
    
    if (expensesToRender.length === 0) {
        expensesList.innerHTML = '<div class="no-expenses">No expenses added yet. Start tracking your spending!</div>';
        return;
    }
    
    expensesList.innerHTML = expensesToRender.map(expense => `
        <div class="expense-item category-${expense.category}">
            <div class="expense-info">
                <div class="expense-description">${expense.description}</div>
                <div class="expense-category">${expense.category}</div>
                <div class="expense-date">${formatDate(expense.date)}</div>
            </div>
            <div class="expense-amount">$${expense.amount.toFixed(2)}</div>
            <button class="btn btn-danger" onclick="deleteExpense(${expense.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

// Render expenses (main function)
function renderExpenses() {
    // Apply current filters and sorting
    applyFiltersAndSort();
}

// Render reminders
function renderReminders() {
    const remindersList = document.getElementById('remindersList');
    
    if (reminders.length === 0) {
        remindersList.innerHTML = '<div class="no-reminders">No reminders set. Add your recurring bills!</div>';
        return;
    }
    
    remindersList.innerHTML = reminders.map(reminder => {
        const daysUntilDue = getDaysUntilDue(reminder.date);
        const isOverdue = daysUntilDue < 0;
        const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;
        
        let statusClass = '';
        let statusText = '';
        
        if (isOverdue) {
            statusClass = 'overdue';
            statusText = `Overdue by ${Math.abs(daysUntilDue)} days`;
        } else if (isDueSoon) {
            statusClass = 'due-soon';
            statusText = `Due in ${daysUntilDue} days`;
        } else {
            statusText = `Due in ${daysUntilDue} days`;
        }
        
        return `
            <div class="reminder-item ${statusClass}">
                <div class="reminder-info">
                    <div class="reminder-name">${reminder.name}</div>
                    <div class="reminder-details">
                        ${statusText} • ${reminder.frequency} • ${formatDate(reminder.date)}
                    </div>
                </div>
                <div class="reminder-amount">$${reminder.amount.toFixed(2)}</div>
                <button class="btn btn-danger" onclick="deleteReminder(${reminder.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');
}

// Update dashboard
function updateDashboard() {
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remaining = monthlyBudget - totalSpent;
    
    document.getElementById('budgetAmount').textContent = `$${monthlyBudget.toFixed(2)}`;
    document.getElementById('totalSpent').textContent = `$${totalSpent.toFixed(2)}`;
    document.getElementById('remainingAmount').textContent = `$${remaining.toFixed(2)}`;
    
    // Update remaining amount color based on spending percentage
    const remainingElement = document.getElementById('remainingAmount');
    const spendingPercentage = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;
    
    // Remove any existing color classes
    remainingElement.classList.remove('remaining-green', 'remaining-yellow', 'remaining-red');
    
    if (remaining < 0) {
        // Over budget - red
        remainingElement.classList.add('remaining-red');
    } else if (spendingPercentage >= 50) {
        // Spent 50% or more - yellow
        remainingElement.classList.add('remaining-yellow');
    } else {
        // Spent less than 50% - green
        remainingElement.classList.add('remaining-green');
    }
}

// Modal functions
function openBudgetModal() {
    document.getElementById('budgetModal').style.display = 'block';
    document.getElementById('monthlyBudget').value = monthlyBudget;
}

function closeBudgetModal() {
    document.getElementById('budgetModal').style.display = 'none';
}

function openReminderModal() {
    document.getElementById('reminderModal').style.display = 'block';
    // Set default date to today
    document.getElementById('reminderDate').value = new Date().toISOString().split('T')[0];
}

function closeReminderModal() {
    document.getElementById('reminderModal').style.display = 'none';
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getDaysUntilDue(dateString) {
    const today = new Date();
    const dueDate = new Date(dateString);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    // Set background color based on type
    switch(type) {
        case 'success':
            notification.style.backgroundColor = '#4CAF50';
            break;
        case 'error':
            notification.style.backgroundColor = '#f44336';
            break;
        case 'warning':
            notification.style.backgroundColor = '#ff9800';
            break;
        default:
            notification.style.backgroundColor = '#2196F3';
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .reminder-item.overdue {
        border-left: 4px solid #f44336;
        background-color: #ffebee;
    }
    
    .reminder-item.due-soon {
        border-left: 4px solid #ff9800;
        background-color: #fff3e0;
    }
`;
document.head.appendChild(notificationStyles);

// Check for overdue reminders on page load
function checkOverdueReminders() {
    const overdueReminders = reminders.filter(reminder => getDaysUntilDue(reminder.date) < 0);
    
    if (overdueReminders.length > 0) {
        showNotification(`You have ${overdueReminders.length} overdue bill(s)!`, 'warning');
    }
}

// Call checkOverdueReminders when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(checkOverdueReminders, 1000);
});
