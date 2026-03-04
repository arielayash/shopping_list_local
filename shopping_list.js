import { MesssageContext, INVALID_DEPARTMENT_ID } from "./imessage_storage.js";
import { LocalMessageStorage } from "./local_message_storage.js";
// import { MessageStorage } from "./message_storage.js";

const gMsgStorage = new LocalMessageStorage();
// const gMsgStorage = new MessageStorage();


// function dummyFill () {
//     const milkId = gMsgStorage.addDepartment("מוצרי חלב");
//     const meatId = gMsgStorage.addDepartment("בשר");
//     const drinkId = gMsgStorage.addDepartment("שתיה");

//     gMsgStorage.addMessage(new MesssageContext("חלב", milkId));
//     gMsgStorage.addMessage(new MesssageContext("יוגורט", milkId));
//     gMsgStorage.addMessage(new MesssageContext("פרגית", meatId));
//     gMsgStorage.addMessage(new MesssageContext("עוף", meatId));
//     gMsgStorage.addMessage(new MesssageContext("קולה", drinkId));

// }
//dummyFill();

let gProductIdOnEdit = null;

function setText(textDiv, msgId, text, textColor=null) {
    
    textDiv.appendChild(document.createTextNode(text));    
    if (textColor !== null) {
        textDiv.style.color = textColor;
    }

    const updateCallback = () => {

        if (gProductIdOnEdit !== null && gProductIdOnEdit != msgId) {
            _exitEditItemMode(gProductIdOnEdit);
        }

        gProductIdOnEdit = msgId;

        textDiv.removeEventListener("click", updateCallback);
        updateItem(msgId);        
    };

    textDiv.addEventListener("click", updateCallback);
}

function renderMessage(msgId, msg) {
    
    let productList = document.getElementById(`product_list_${msg.departmentId}`);
    if (productList === null) {
        productList = document.createElement("ul");
        productList.setAttribute("class", "product_list");
        productList.setAttribute("id", `product_list_${msg.departmentId}`);

        let liName = document.createElement("li");
        liName.setAttribute("class", "department_name_text");
        liName.setAttribute("id", `department_name_text_${msg.departmentId}`);
        liName.appendChild(document.createTextNode(gMsgStorage.getDepartment(msg.departmentId)));
        productList.appendChild(liName);
        document.getElementsByTagName("main")[0].appendChild(productList);        
    }
    
    let li = document.createElement("li");
    li.setAttribute("id", `product_elem_${msgId}`);
    li.setAttribute("class", `product_elem`);

    let textDiv = document.createElement('div');
    textDiv.setAttribute("id", `product_elem_${msgId}_text`);    
    textDiv.setAttribute("class", 'product_elem_text');    

    setText(textDiv, msgId, msg.content, msg.isPinned? "red" : "black");

    li.appendChild(textDiv);
    
    let checkBox = document.createElement("input");
    checkBox.setAttribute("type", "checkbox");
    checkBox.setAttribute("id", `product_elem_${msgId}_checkbox`);
    checkBox.setAttribute("class", 'product_elem_checkbox');
    checkBox.checked = msg.isChecked;

    const markCheckedProduct = () => {
        const line_decoration = checkBox.checked? "line-through" : "none";                        
        textDiv.style.textDecoration = line_decoration;            
    };
    markCheckedProduct();
    
    checkBox.addEventListener(
        'click', (event) => {            
                                    
            const msgCopy = gMsgStorage.getMessage(msgId).clone();
            msgCopy.isChecked = checkBox.checked;
            gMsgStorage.updateMessage(msgId, msgCopy);

            markCheckedProduct();
        }
    );
    li.appendChild(checkBox);
 
    productList.appendChild(li);    
}

async function addItem(productField, departmentId, departmentName=null) {

    if (INVALID_DEPARTMENT_ID === departmentId) {
        // Create new department 

        if (departmentName === null) {
            throw Error("Department name must be supplied if departmentId is invalid");
        }

        departmentId = await gMsgStorage.addDepartment(departmentName);        
    }
    
    const newMsg = new MesssageContext(productField, departmentId);    

    const newMsgId = await gMsgStorage.addMessage(newMsg);    
    // console.log(`Message: "${productField}" was added to storage with id ${newMsgId}`);
    
    renderMessage(newMsgId, newMsg);   
}

function _exitEditItemMode(itemId) {
    
    if (itemId === null) {
        return;
    }

    const textDiv = document.getElementById(`product_elem_${itemId}_text`);

    while (textDiv.firstChild) {
        textDiv.removeChild(textDiv.firstChild);        
    }
    
    const msg = gMsgStorage.getMessage(itemId);
    setText(textDiv, itemId, msg.content, msg.isPinned? "red" : "black");

    if (itemId === gProductIdOnEdit) {
        gProductIdOnEdit = null;
    }
}

function updateItem(itemId) {

    const textDiv = document.getElementById(`product_elem_${itemId}_text`);
    
    let text = textDiv.firstChild.wholeText;

    textDiv.removeChild(textDiv.firstChild);

    let editButtonsDiv = document.createElement('div');    
    editButtonsDiv.setAttribute("class", 'product_elem_edit_buttons_div');   
    textDiv.appendChild(editButtonsDiv);

    let trashImg = document.createElement("img");
    trashImg.setAttribute("src", "./trash-can-solid.svg");
    trashImg.setAttribute("id", `product_elem_${itemId}_del_button`);
    trashImg.setAttribute("class", 'product_elem_del_button');
    editButtonsDiv.appendChild(trashImg);

    trashImg.addEventListener(
        'click', (event) => {
            
            gMsgStorage.deleteMessage(itemId);
                        
            document.getElementById(`product_elem_${itemId}`).remove();

            if (gMsgStorage.getMessageIds().length < 1) {
                let clearBtn = document.getElementById('clear_button');        
                clearBtn.style.color = "gray";
                clearBtn.style.cursor = "default";
            }

            if (itemId === gProductIdOnEdit) {
                gProductIdOnEdit = null;
            }   
        }
    );
    
    

    // Add pin button
    let pinMark = document.createElement("img");    
    pinMark.setAttribute("src", "./thumbtack-solid.svg");
    pinMark.setAttribute("id", `product_elem_${itemId}_pin_button`);
    pinMark.setAttribute("class", 'product_elem_pin_button');
           
    pinMark.addEventListener(
        'click', (event) => {            
            const msgCopy = gMsgStorage.getMessage(itemId).clone();
            msgCopy.isPinned = ! msgCopy.isPinned;
            gMsgStorage.updateMessage(itemId, msgCopy);                        
                        
            setTimeout(
                () => {_exitEditItemMode(itemId);},
                0
            );           
        }
    );
    
    
    editButtonsDiv.appendChild(pinMark);

    let inputText = document.createElement('input');
    inputText.setAttribute("type", "text");
    inputText.setAttribute("value", text);
    inputText.setAttribute("id", `product_elem_${itemId}_edit_text`);
    inputText.setAttribute("class", "product_elem_edit_text");
    textDiv.appendChild(inputText);

    inputText.addEventListener(
        'keypress', ele => {
            if (ele.key == 'Enter') {                
                let newText = inputText.value;                    
                textDiv.removeChild(inputText);

                while (textDiv.firstChild) {
                    textDiv.removeChild(textDiv.firstChild);
                }

                const msgCopy = gMsgStorage.getMessage(itemId).clone();
                if (text !== newText) {                    
                    msgCopy.content = newText;                    
                    gMsgStorage.updateMessage(itemId, msgCopy);
                }

                setText(textDiv, itemId, newText, msgCopy.isPinned? "red" : "black");
            }
        }
    );
}

function _blurPage() {
    const blurElems = document.getElementsByClassName("enableBlur");    
    for (let elem of blurElems) {
        elem.style.filter = "blur(5px) grayscale(100%)"; 
    }
}

function _unblurPage() {
    const blurElems = document.getElementsByClassName("enableBlur");    
    for (let elem of blurElems) {
        elem.style.filter = "blur(0) grayscale(0)"; 
    }
}

function _openAddMenu() {

    _blurPage();
    
    const addMenu = document.getElementById("add_menu");
    addMenu.style.display = "block";      

    const productText = document.getElementById('add_prod_text');
    productText.focus();
}

function _closeAddMenu() {

    _unblurPage();
    
    const addMenu = document.getElementById("add_menu");
    addMenu.style.display = "none";    
    
    document.getElementById('add_prod_text').value = "";
    document.getElementById('add_prod_department').value = "";
}

function _openDeleteMenu() {

    _blurPage();

    const deleteMenu = document.getElementById("delete_menu");
    deleteMenu.style.display = "block";      
}

function _closeDeleteMenu() {

    _unblurPage();
    
    const deleteMenu = document.getElementById("delete_menu");
    deleteMenu.style.display = "none";          
}

function addNewItem() {

    const productText = document.getElementById('add_prod_text').value;
    if (productText === "") {
        alert("Product can't be empty - please insert a valid product");
        return false;        
    }

    const userDepartmentName = document.getElementById('add_prod_department').value;
    if (userDepartmentName === "") {
        alert("Department can't be empty - please select or insert a valid department");
        return false;        
    }
    
    let currDepId = INVALID_DEPARTMENT_ID;
    for (const [depId, depName] of Object.entries(gMsgStorage.getAllDepartments())) { 
        if (depName === userDepartmentName) {
            currDepId = depId;
            break;
        }
    }
    
    addItem(productText, currDepId, userDepartmentName);

    let clearBtn = document.getElementById('clear_button');        
    clearBtn.style.color = "black";
    clearBtn.style.cursor = "pointer";

    return true;
}

function clearAll() {

    if (gMsgStorage.getMessageIds().length < 1) {
        return;
    }
    
    if ( ! window.confirm("Confirm clearing list") ) {
        return;
    }
    
    for (let depId of gMsgStorage.getDepartmentIds()) {        

        const currList = document.getElementById(`product_list_${depId}`);        
        if (currList) {
            currList.remove();
        }
    }   
    
    gMsgStorage.deleteAllMessages();    

    let clearBtn = document.getElementById('clear_button');    
    clearBtn.style.color = "gray";
    clearBtn.style.cursor = "default";
}

function clearChecked() {
    if (gMsgStorage.getMessageIds().length < 1) {
        return;
    }
    
    let idsToDelete = []
    for (const [msgId, msg] of Object.entries(gMsgStorage.getAllMessages())) {        
        if (msg.isPinned || ! msg.isChecked) {
            continue;
        }  
        
        idsToDelete.push(msgId);
    }

    if (idsToDelete.length < 1) {
        return;
    }

    if ( ! window.confirm("Confirm clearing checked items") ) {
        return;
    }

    for (const msgId of idsToDelete) {
        gMsgStorage.deleteMessage(msgId);
        document.getElementById(`product_elem_${msgId}`).remove();        
    }
    
    if (gMsgStorage.getMessageIds().length < 1) {
        let clearBtn = document.getElementById('clear_button');        
        clearBtn.style.color = "gray";
        clearBtn.style.cursor = "default";
    }
}

function _drawMessages(msgs) {
        
    for (let depId of gMsgStorage.getDepartmentIds()) {        

        const currList = document.getElementById(`product_list_${depId}`);        
        if (currList) {
            currList.remove();
        }
    }

    for (const [msgId, msg] of Object.entries(msgs)) {
        renderMessage(msgId, msg);
    }    
}

function _onSeacrhEvent(event) {
    
    const searchQuery = document.getElementById('search_input').value;
        
    const allMsgs = gMsgStorage.getAllMessages();    

    let msgsToRender = {};
    for (const [msgId, msg] of Object.entries(allMsgs)) {        
        if (msg.content.startsWith(searchQuery)) {
            msgsToRender[msgId] = msg;            
        }
    } 

    _drawMessages(msgsToRender);
}

async function init() {


    await gMsgStorage.forceSync();

    const allMsgs = gMsgStorage.getAllMessages();
    console.log("allMsgs on init(): ", allMsgs);

    _drawMessages(allMsgs);
    
    if (Object.keys(allMsgs).length > 0) {
        let clearBtn = document.getElementById('clear_button');        
        clearBtn.style.color = "black";
        clearBtn.style.cursor = "pointer";
    }

    document.getElementById('add_button').addEventListener(
        'click', 
        () => {
            _exitEditItemMode(gProductIdOnEdit);            
            
            const departmentsOptions = document.getElementById("departments");
            while (departmentsOptions.firstChild) {
                departmentsOptions.removeChild(departmentsOptions.firstChild);
            }
            
            for (const [depId, depName] of Object.entries(gMsgStorage.getAllDepartments())) { 
                const option = document.createElement("option");
                option.setAttribute("value", depName);
                departmentsOptions.appendChild(option);
            }

            _openAddMenu();

            if (document.getElementById('search_input').value.length > 0) {
                document.getElementById('search_input').value = "";
                _onSeacrhEvent(null);
            }            
        }
             
    );

    document.getElementById('insert_button').addEventListener(
        'click', () => {
            if (addNewItem()) {
                _closeAddMenu();
            }
        }
    );

    document.getElementById('add_prod_text').addEventListener(
        'keypress', ele => {
            if (ele.key == 'Enter') {      
                if (addNewItem()) {
                    _closeAddMenu();
                }
            }
        }
    );
    

    document.getElementById('cancel_button').addEventListener('click', () => _closeAddMenu());

    // Add callback for search input box
    document.getElementById('search_input').addEventListener('input', _onSeacrhEvent);
    document.getElementById('search_input').addEventListener('click', () => {_exitEditItemMode(gProductIdOnEdit);});

    document.getElementById('clear_button').addEventListener(
        'click', 
        () => {                        
            if (gMsgStorage.getMessageIds().length < 1) {
                return;
            }            
            _exitEditItemMode(gProductIdOnEdit);
            _openDeleteMenu();
        }
             
    );
    document.getElementById('delete_marked_button').addEventListener(
        'click', () => {
            clearChecked();
            _closeDeleteMenu();
        }
    );
    document.getElementById('delete_all_button').addEventListener(
        'click', () => {
            clearAll();
            _closeDeleteMenu();
        }
    );
    document.getElementById('cancel_delete_button').addEventListener('click', () => _closeDeleteMenu());    
}


window.onload = () => { init(); }


