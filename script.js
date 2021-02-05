const modal = {
    overlay: document.querySelector(".modal-overlay"),
    cancelBtn: document.querySelector('.cancel'),

    open() {
       this.overlay.classList.add("active");
    },

    close(e=event) {
        const permitedToClose = e.target === this.overlay || e.target === this.cancelBtn || e.type === "submit";

        if (permitedToClose) {
            this.overlay.classList.remove("active");
        }                   
    } 
};

const storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions));
    },
}

const transaction = {
    all: storage.get(),

    add(t){
        transaction.all.unshift(t);
        app.reload();
    },

    remove(index){
        transaction.all.splice(index, 1);
        app.reload();
    },

    incomes () {
        let income = 0;

        transaction.all.forEach((transaction) => {
            if(transaction.amount > 0) {
                income += transaction.amount; 
            }
        })
        return income;
    },

    expenses() {
        let expense = 0;

        transaction.all.forEach((transaction) => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        })
        return expense;
    },

    total() {
        return this.incomes() + this.expenses();
    }
};

const DOM = {
    transactionsContainer: document.querySelector("#data-table tbody"),

    addTransaction(transaction, index) {
        const tr = document.createElement("tr");
        tr.innerHTML = DOM.innerHTMLTransaction(transaction);
        tr.dataset.index = index;
        DOM.transactionsContainer.appendChild(tr);
    },

    innerHTMLTransaction(transaction, index) {
        const cssClass = transaction.amount > 0 ? "income" : "expense";

        const amount = utils.formatCurrency(transaction.amount);

        const html = `
                            <td class="description">${transaction.description}</td>
                            <td class="${cssClass}">${amount}</td>
                            <td class="date">${transaction.date}</td>
                            <td>
                                <img onclick="transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
                            </td>
                    `

        return html
    },

    updateBalance() {
        incomeDisplay = document.getElementById("incomeDisplay");
        expenseDisplay = document.getElementById("expenseDisplay");
        totalDisplay = document.getElementById("totalDisplay");

        incomeDisplay.innerHTML = utils.formatCurrency(transaction.incomes());
        expenseDisplay.innerHTML = utils.formatCurrency(transaction.expenses());
        totalDisplay.innerHTML = utils.formatCurrency(transaction.total());
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = "";
    }
};

const utils = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "";

        value = String(value).replace(/\D/g,"");

        value = Number(value) / 100;

        value = value.toLocaleString("pt-BR", {style: "currency", currency: "BRL"});

        return signal + value;
    },

    formatAmount(value) {
        value = Number(value) * 100;

        return value;
    },

    formatDate(date) {
        const splittedDate = date.split("-");
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    }
};

const form = {
    description: document.querySelector("input#description"),
    amount: document.querySelector("input#amount"),
    date: document.querySelector("input#date"),

    getValues() {
        return {
            description: form.description.value,
            amount: form.amount.value,
            date: form.date.value
        }
    },

    validateFields() {
        const {description, amount, date} = form.getValues();
        const emptyField = description.trim() === "" || amount.trim() === "" || date.trim() === ""

        if (emptyField){
            throw new Error("Por favor preencha todos os campos");
        }
    },

    formatValues() {
        let { description, amount, date } = form.getValues();

        amount = utils.formatAmount(amount);
        date = utils.formatDate(date);

        return {
            description,
            amount,
            date 
        } 
    },


    clearFields() {
        form.description.value = "";
        form.amount.value = "";
        form.date.value = "";
    },

    submit(event) {
        event.preventDefault();

        try {
            form.validateFields();
            const trans = form.formatValues();
            transaction.add(trans);
            form.clearFields();
            modal.close();   
        } catch (error) {
            alert(error.message);
        }



    }
};


const app = {
    init(){
        transaction.all.forEach((transaction, index) => { 
            DOM.addTransaction(transaction, index);    
        })

        DOM.updateBalance();

        storage.set(transaction.all)
    },

    reload() {
        DOM.clearTransactions();
        app.init();
    }
};

app.init();
