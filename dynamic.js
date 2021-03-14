//BUDGET CONTROLLER

var budgetController = (function(){
    
    //create a function declaration to declare the objects values

    var expenses = function(id, description, value){

        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    expenses.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        }
    };

    expenses.prototype.getPercentage = function(){
        return this.percentage;
    };

    var income = function(id, description, value){

        this.id = id;
        this.description = description;
        this.value = value;
    }
    var calculateTotal = function(type){
        sum = 0;
        data.allItem[type].forEach(function(cur){
            sum += cur.value;
        })
        data.totalItem[type] = sum;
    }

    //create a datastructure to store the items
    data = {
        allItem:{
            inc: [],
            exp: []
        },
        totalItem:{
            inc: 0,
            exp: 0
        },
        budget : 0,
        percentage : -1
    }

    return {

        addItem : function(type, desc, val){

            var newItem, ID;

            ID = 0;
            if (data.allItem[type].length > 0){
                ID = data.allItem[type][data.allItem[type].length - 1].id + 1;
            }else{
                ID = 0;
            }

            if(type ==='inc'){
                newItem = new income(ID, desc, val);
            }else if(type === 'exp'){
                newItem = new expenses(ID, desc, val)
            }
            data.allItem[type].push(newItem);
            return newItem;
        },
        deleteItem: function(type, id){
            var ids, index;
            // id = 6
            //data.allItem[type][id];
            //[1 2 3 4 6 8]
            //index = 3

            ids = data.allItem[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);
            if (index !== -1){
                data.allItem[type].splice(index, 1);
            }
        },

        calculateBudget: function(){
            //1. calculate the income and expense
            calculateTotal('inc');
            calculateTotal('exp');

            //2. calculate the budget: income - expences
            data.budget = (data.totalItem.inc - data.totalItem.exp);

            // calculate the percentage income that we spent
            if (data.totalItem.inc > 0){
                data.percentage = Math.round((data.totalItem.exp / data.totalItem.inc) * 100);
            }else{
                data.percentage = -1;
            }
            
        },

        calculatePecentage: function(){
            /*
            a = 20
            b = 10
            c = 40
            income = 100
            a = 20/100 = 20%
            b = 10/100 = 10%
            c = 40/100 = 40%
            */
           data.allItem.exp.forEach(function(cur){
               cur.calcPercentage(data.totalItem.inc);
           });
        },
        getPercentages: function(){
            var allPerc = data.allItem.exp.map(function(curr){
                return curr.getPercentage()
            });
            return allPerc;
        },

        getBudget: function(){
            return{
                budget: data.budget,
                totalinc: data.totalItem.inc,
                totalexp: data.totalItem.exp,
                percentage: data.percentage
            }
        },

        testing: function(){
            console.log(data);
        }
    }
})();

//UI CONTROLLER

var UIcontroller = (function(){
    var domString = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel:'.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container:'.container',
        expensesPerLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    var formatNumber = function(num, type){
        var splitNum, int, dec, type;
        /*
        + or - before number
        exactly 2 decimal points
        comma separating the thousends

        2310.4567 -> + 2, 310. 46
        2000 -> +2,000.00
        */

        num = Math.abs(num);
        num = num.toFixed(2);

        splitNum = num.split('.')
        int = splitNum[0];
        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = splitNum[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };
    var nodeListForEach = function(list, callback){
        for (var i = 0; i < list.length; i++){
            callback(list[i], i)
        }
    };

    return {
        getInput: function(){
            return {
                type: document.querySelector(domString.inputType).value,
                description: document.querySelector(domString.inputDescription).value,
                value: parseInt(document.querySelector(domString.inputValue).value)
            };
        
        },

        addListItem : function(obj, type){
            var html, newHTML, element
            //Create HTML string With placeholder text
            if(type === 'inc'){
                element = domString.incomeContainer
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }else if (type === 'exp'){
                element = domString.expensesContainer
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            //Replace the placeholder text with some actual data
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%',formatNumber(obj.value,type));

            //insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },
        clearField: function(){
            var field, fieldArr
            field = document.querySelectorAll(domString.inputDescription + "," + domString.inputValue);
            fieldArr = Array.prototype.slice.call(field);
            fieldArr.forEach(function(current, index, array){
                current.value = "";
            });
            fieldArr[0].focus();
        },
        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type ==='inc' : type=== 'exp';
            document.querySelector(domString.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(domString.incomeLabel).textContent = formatNumber(obj.totalinc,'inc');
            document.querySelector(domString.expensesLabel).textContent = formatNumber(obj.totalexp, 'exp');
            if(obj.percentage > 0){
                document.querySelector(domString.percentageLabel).textContent = obj.percentage + "%";
            }else{
                document.querySelector(domString.percentageLabel).textContent ="----"
            }
        },

        displayPercentage: function(percentages){
            
            var fields = document.querySelectorAll(domString.expensesPerLabel);

            nodeListForEach(fields, function(current, index){

                if (percentages[index] > 0){
                    current.textContent = percentages[index] + "%";
                }else {
                    current.textContent = "---"
                }
            });

        },
            
        deleteListItem: function(selectID){
            var el = document.getElementById(selectID)
            el.parentNode.removeChild(el)
        },
        getMonth: function(){
            var now, months, month, year;

            now = new Date();
            //var christmas = new Date(2016, 11,25)
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'Auguest', 'September', 'October', 'Nuvember', 'December']
            month =  now.getMonth();

            year = now.getFullYear();
            document.querySelector(domString.dateLabel).textContent = months[month] + ' ' + year;

        },
        changedType: function(){
            var fields = document.querySelectorAll(
                domString.inputType + ', ' +
                domString.inputDescription + ', '+
                domString.inputValue);  
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });
            document.querySelector(domString.inputButton).classList.toggle('red');
        },
        getDOMstring: function(){
            return domString;
    
    },

    }

})();

//GLOBAL APP CONTROLLER

var controller = (function(budgetCtrl, UIctrl){
    
    var setupEventListeners = function(){

        var DOM = UIctrl.getDOMstring();

        document.querySelector(DOM.inputButton).addEventListener('click',ctrlAddItem);
        document.addEventListener('keypress', function(event){

            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem()
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UIctrl.changedType);
    }

    var updateBudget = function(){

        //1. Calculate the budget.
        budgetCtrl.calculateBudget();

        //2. Return the budget
        var budget = budgetCtrl.getBudget()

        //3. Display the budget on the UI. 
        UIctrl.displayBudget(budget);
    }

    var updatePercentage = function(){
        //1. calculate percentage
        budgetCtrl.calculatePecentage();

        //2.read percentage from the budget controller
        var percentages = budgetCtrl.getPercentages();

        //3.update the UI with the new percentages
        UIctrl.displayPercentage(percentages);
    };

    var ctrlAddItem = function(){
        var input, newItem
        //1. Get the field input data.
        input = UIctrl.getInput();
        if(input.description !== "" && !isNaN(input.value)&& input.value > 0){

            //2. Add the item to the budget controller.
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            //3. Add the item to the UI.
            UIctrl.addListItem(newItem, input.type);
            //4.clear field and focus the UI
            UIctrl.clearField()
            //5.calculate the update budget
            updateBudget();
            //6. update percentages
            updatePercentage();
        }
    };

    var ctrlDeleteItem = function(event){
        var itemId,splitId, type, ID;
        itemId = (event.target.parentNode.parentNode.parentNode.parentNode.id);

        if(itemId){
            //inc-1
            splitId = itemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);

            //1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            //2. delete the item from the UI
            UIctrl.deleteListItem(itemId);

            //3. update and show the new budget
            updateBudget();

            //4.update percentages
            updatePercentage();

        }
    };

    return {
        init: function(){
            console.log('Initialization Done');
            UIctrl.getMonth();
            UIctrl.displayBudget({
                budget: 0,
                totalinc: 0,
                totalexp:0,
                percentage:-1
            });
            setupEventListeners();
        }
    }
})(budgetController, UIcontroller);
controller.init()





