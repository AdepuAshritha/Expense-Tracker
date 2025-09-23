// Select elements
const form = document.getElementById('expense-form');
const desc = document.getElementById('desc');
const amount = document.getElementById('amount');
const dateInput = document.getElementById('date');
const category = document.getElementById('category');
const listEl = document.getElementById('expenses-list');
const totalEl = document.getElementById('total');
const filterCategory = document.getElementById('filter-category');
const searchTextInput = document.getElementById('search-text');

const STORAGE_KEY = 'my_expenses_v1';
let expenses = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

let expenseChart; // Chart.js instance

// Render expenses list
function renderExpenses() {
  listEl.innerHTML = '';
  let total = 0;

  const selectedCategory = filterCategory.value;
  const searchText = searchTextInput.value.toLowerCase();

  expenses.forEach((exp, index) => {
    // Apply filters
    if (selectedCategory !== 'All' && exp.category !== selectedCategory) return;
    if (!exp.desc.toLowerCase().includes(searchText)) return;

    total += exp.amount;

    const item = document.createElement('div');
    item.className = 'expense-item';
    item.innerHTML = `
      ${exp.date} - ${exp.desc} - ₹${exp.amount.toFixed(2)} [${exp.category}]
      <div style="display:inline-flex; gap:6px; margin-left:8px;">
        <button onclick="startEdit(${index})">✏️</button>
        <button onclick="deleteExpense(${index})">❌</button>
      </div>
    `;

    // Category colors
    let color = '';
    switch(exp.category) {
      case 'Food': color = '#d4edda'; break;
      case 'Transport': color = '#d1ecf1'; break;
      case 'Shopping': color = '#f8d7da'; break;
      case 'Bills': color = '#fff3cd'; break;
      case 'Other': color = '#e2e3e5'; break;
    }
    item.style.backgroundColor = color;
    item.style.borderRadius = '4px';
    item.style.padding = '6px 8px';
    
    listEl.appendChild(item);
  });

  totalEl.textContent = `Total: ₹${total.toFixed(2)}`;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));

  updateChart(); // Update chart each time
}

// Add new expense
form.addEventListener('submit', (event) => {
  event.preventDefault();

  const newExpense = {
    desc: desc.value,
    amount: parseFloat(amount.value),
    date: dateInput.value,
    category: category.value
  };

  expenses.push(newExpense);
  renderExpenses();
  form.reset();
});

// Delete expense
function deleteExpense(index) {
  expenses.splice(index, 1);
  renderExpenses();
}

// Filters
filterCategory.addEventListener('change', renderExpenses);
searchTextInput.addEventListener('input', renderExpenses);

// Chart.js
function updateChart() {
  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Other'];
  const counts = categories.map(cat =>
    expenses.filter(exp => exp.category === cat)
            .reduce((sum, e) => sum + e.amount, 0)
  );

  const ctx = document.getElementById('expense-chart').getContext('2d');

  if (expenseChart) expenseChart.destroy();

  expenseChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: categories,
      datasets: [{
        label: 'Expenses by Category',
        data: counts,
        backgroundColor: ['#d4edda','#d1ecf1','#f8d7da','#fff3cd','#e2e3e5']
      }]
    },
    options: { responsive: true }
  });
}

// Initial render
renderExpenses();
