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

let expenseChart;
let editingIndex = -1;

function renderExpenses() {
  listEl.innerHTML = '';
  let total = 0;
  const selectedCategory = filterCategory.value;
  const searchText = searchTextInput.value.toLowerCase();

  expenses.forEach((exp, index) => {
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
  updateChart();
}

function startEdit(index) {
  const exp = expenses[index];
  desc.value = exp.desc;
  amount.value = exp.amount;
  dateInput.value = exp.date;
  category.value = exp.category;
  editingIndex = index;
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.textContent = "Update Expense";
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const newExpense = {
    desc: desc.value,
    amount: parseFloat(amount.value),
    date: dateInput.value,
    category: category.value
  };

  if (editingIndex >= 0) {
    expenses[editingIndex] = newExpense;
    editingIndex = -1;
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = "Add Expense";
  } else {
    expenses.push(newExpense);
  }

  renderExpenses();
  form.reset();
});

function deleteExpense(index) {
  expenses.splice(index, 1);
  renderExpenses();
}

filterCategory.addEventListener('change', renderExpenses);
searchTextInput.addEventListener('input', renderExpenses);

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

renderExpenses();
