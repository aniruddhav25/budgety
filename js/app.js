//BUDGET CONTROLLER
var budgetController=(function () {

    var Expense= function(id,description,value) {
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage=-1;
    };

    var Income= function(id,description,value) {
        this.id=id;
        this.description=description;
        this.value=value;
    };
Expense.prototype.calcPercentage = function(totalIncome) {
    if(totalIncome>0)
    this.percentage=Math.round((this.value/totalIncome)*100)    ;

    else
    this.percentage=-1;
};

Expense.prototype.getPercentage =function () {
    return this.percentage;
}


    var data= {
        allItems : {
            exp:[],
            inc:[]
        },

        totals : {
            exp:0,
            inc:0
        },

        budget:0 ,
        percentage:-1,
    };

    var calculateTotal = function(type) {
        var sum=0;

        data.allItems[type].forEach(function(curr) {
                sum+=curr.value;
        })

        data.totals[type]=sum;
    };

    return {

            addItem:function (type,des,val) {

                var newItem,ID;
                //Create new ID
                if(data.allItems[type].length>0){
                ID=data.allItems[type][data.allItems[type].length-1].id+1;
                
                }
                else{
                ID=0;
                }
                //Create new item based on type
                if(type=='exp') {
                    newItem=new Expense(ID,des,val);
                }
                else if(type==='inc') {
                    newItem=new Income(ID,des,val);
                }
                //Push it into our data structure
                data.allItems[type].push(newItem);
                //return
                return newItem;
                
            },

             deleteItem : function (type,id)  {

                var ids,index;
        
                ids=data.allItems[type].map(function(curr) {
                    return curr.id;
                })
        
                index=ids.indexOf(id);
        
                if(index!==-1) {
                    data.allItems[type].splice(index,1);
                }
            },

            calculateBudget() {
                    //1.Calculate total exp and inc
                    calculateTotal('exp');
                    calculateTotal('inc');

                    //2.Calculate the budget:
                    data.budget=data.totals.inc-data.totals.exp;

                    //3.Calcualte Percentage
                    if(data.totals.inc>0){
                        data.percentage=Math.round((data.totals.exp*100)/data.totals.inc);
                    }

                    else {
                        data.percentage=-1;
                    }
            },

            calculatePercentages : function () {

                data.allItems.exp.forEach(function(cur) {
                    cur.calcPercentage(data.totals.inc);
                })

            },

            getPercentages : function () {
                    var allPerc=data.allItems.exp.map(function(curr) {
                        return curr.getPercentage();
                    })
                return allPerc;
            },

            getBudget() {
              return {
                  budget:data.budget,
                  totlaInc:data.totals.inc,
                  totalExp:data.totals.exp,
                  percentage:data.percentage
              }  ;
            },

            testing: function () {
                console.log(data);
            }

            
    }




})();


//UI CONTROLLER
var UIController =(function() {

        var DOMStrings=['.add__type','.add__description','.add__value','.add__btn','.income__list','.expenses__list','.budget__value','.budget__income--value','.budget__expenses--value','.budget__expenses--percentage','.container','.item__percentage'];
        //Some code here
        return {
            getInput: function() {
                return{
                     type:document.querySelector(DOMStrings[0]).value,//inc or exp
                     description:document.querySelector(DOMStrings[1]).value,
                     value:parseFloat(document.querySelector(DOMStrings[2]).value)

                };
                
            },

            getDOMStrings : function () {
                return DOMStrings;
            },

            displayBudget : function (obj) {

                document.querySelector(DOMStrings[6]).textContent=obj.budget;
                document.querySelector(DOMStrings[7]).textContent=obj.totlaInc;
                document.querySelector(DOMStrings[8]).textContent=obj.totalExp;             

                if(obj.percentage>0) {
                    document.querySelector(DOMStrings[9]).textContent=obj.percentage;

                }

                else {
                    document.querySelector(DOMStrings[9]).textContent='--';

                }

            },

            displayPercentages : function(percentages) {
                
                var fields=document.querySelectorAll(DOMStrings[11]);

                var nodeListForEach =function(list,callback) {
                        for(var i=0;i<list.length;i++) {
                            callback(list[i],i);
                        }
                };

                nodeListForEach(fields,function(current,index) {
                    if(percentages[index]>0)
                    {
                    current.textContent=percentages[index]+'%';
                    }
                    else{
                    current.textContent='--';
                    }
                });



            },

            addListItem:function(obj,type) {
                var html,newHTML,element;


                //Create HTML string with placeholdeer text
                if(type==='inc'){
                    element=DOMStrings[4];
            html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                }
                else {
                    element=DOMStrings[5];
            html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
                }
                //Replace placeholder
                newHTML=html.replace('%id%',obj.id);
                newHTML=newHTML.replace('%description%',obj.description);
                newHTML=newHTML.replace('%value%',obj.value);

                //console.log(newHTML);
                //return newHTML;

                //Insert HTML in DOM
                document.querySelector(element).insertAdjacentHTML('beforeend',newHTML);
                

            },

            deleteListItem : function (selectorID) {
                    var el=document.getElementById(selectorID);
                    //console.log(el);
                    el.parentNode.removeChild(el);
            },

            clearFields:function() {
                var fields,fieldsArr;
                fields=document.querySelectorAll(DOMStrings[1]+','+DOMStrings[2]);

                 fieldsArr=Array.prototype.slice.call(fields);

                 fieldsArr.forEach(function(current,index,array) {
                            current.value="";
                 });

                 //fieldsArr[0].focus();
            }
        };
})();


//APP CONTROLLLER
var controller = (function (budgetCtrl,UICtrl) {

    var setupEventListeners = function() {

        var DOM=UICtrl.getDOMStrings();

        document.querySelector(DOM[3]).addEventListener('click',addItem);
       

        document.addEventListener('keypress',function(event) {
           if(event.keyCode===13){
               addItem();
               event.preventDefault();
               return false;
               
           }

    });

    document.querySelector(DOM[10]).addEventListener('click',ctrlDeleteItem);
    };

    var updateBudget = function  () {
        //1.Calculate budget
        budgetCtrl.calculateBudget();

        //2.Return Budget
        var budget=budgetCtrl.getBudget();
        console.log(budget);
        //3.Display on UI

        UICtrl.displayBudget(budget);

    };

    var updatePercentages = function () {

        //1.Calcluate percentages
        budgetCtrl.calculatePercentages();

        //2.Read percentages
        var percentages=budgetCtrl.getPercentages();
        console.log(percentages);

        //3 Update UI
        UICtrl.displayPercentages(percentages);
    };
    

    var addItem =function () {
        //1.Get input data
        var data=UICtrl.getInput();

        if(data.description!=="" && !isNaN(data.value) && data.value>0){
        //2.Add item to budget controller
        var newItem=budgetCtrl.addItem(data.type,data.description,data.value);

        //3.Add item to UI and Clear the fields
        UICtrl.addListItem(newItem,data.type);
        UICtrl.clearFields();
        
        //4.Calculate budget and Update UI
        updateBudget();

        //5.Calculate and update percentages
        updatePercentages();

        //console.log('Working!');
        }
    };
    
    
    var ctrlDeleteItem=function(event) {
        var itemId,Id,type;
        
        itemId=event.target.parentNode.parentNode.parentNode.parentNode.id;
        //console.log(itemId);

        if(itemId) {
            splitId=itemId.split('-');
            type=splitId[0];
            Id=parseInt(splitId[1]);

            //1.delete item from DS
            budgetCtrl.deleteItem(type,Id);

            //2.Delete item from UI
            UICtrl.deleteListItem(itemId);

            //3.Update budget
            updateBudget();

            //5.Calculate and update percentages
             updatePercentages();
        }
    }

    return {
        init : function (){
            console.log('Application has started');
            UICtrl.displayBudget({
                budget:0,
                totlaInc:0,
                totalExp:0,
                percentage:-1
            });

            setupEventListeners();
        } 
    }
    
    
})(budgetController,UIController);



controller.init();