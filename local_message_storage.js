import { IMessageStorage, MesssageContext } from "./imessage_storage.js";


export class LocalMessageStorage extends IMessageStorage { 
    
    constructor() {

        super();

        this._init();
        
    }

    _init () {
        this._messages = {};    // Dict[int, MesssageContext]
        this._nextMsgId = 0;     
        
        this._departments = {}; // Dict[int, str]
        this._nextDepId = 0;
    }

    forceSync() {
        this._init();
        this._loadFromStorage();
    }

    addMessage(messageContext) {
        let currId = this._nextMsgId++;
        this._messages[currId] = messageContext;
        console.log(`Message "${messageContext.content}" with id ${currId} was added`);
        
        this._dumpToStorage();

        return currId;        
    }

    getMessage(id) {
        if ( !(id in this._messages) ) {
            throw new Error(`Message with id ${id} is not exists in storage`);
        }

        return this._messages[id];
    }

    deleteMessage(id) {
        if ( !(id in this._messages) ) {
            throw new Error(`Message with id ${id} is not exists in storage`);
        }
        
        const depId = this._messages[id].departmentId;

        delete this._messages[id];

        this._validateDepartments(depId);

        this._dumpToStorage();

        console.log(`Message with id ${id} removed`);
    }

    updateMessage(id, messageContext) {

        if ( !(id in this._messages) ) {
            throw new Error(`Message with id ${id} is not exists in storage`);
        }

        this._messages[id] = messageContext;

        this._dumpToStorage();

        console.log(`Message with id ${id}  updated to "${messageContext.content}"`);
    }

    getMessageIds() {
        return Object.keys(this._messages);
    }


    addDepartment(departmentName) {
        let currId = this._nextDepId++;
        this._departments[currId] = departmentName;

        this._dumpToStorage(true);

        console.log(`Department "${departmentName}" with id ${currId} was added`);
        return currId;                
    }

    getDepartment(id) {
        if ( !(id in this._departments) ) {
            throw new Error(`Department with id ${id} is not exists in storage`);
        }

        return this._departments[id];    
    }

    updateDepartment(id, departmentName) {
        if ( !(id in this._departments) ) {
            throw new Error(`Department with id ${id} is not exists in storage`);
        }

        this._departments[id] = departmentName;

        this._dumpToStorage(true);

        console.log(`Department with id ${id} updated to "${departmentName}"`);        
    }

    getDepartmentIds() {
        return Object.keys(this._departments);
    }

    _dumpToStorage(isSkipMessages = false) {

        if (Object.keys(this._departments).length < 1 && Object.keys(this._messages).length < 1) {
            console.log("No data to store - clear storage");
            window.localStorage.clear();
            return;
        }

        window.localStorage.setItem("departments", JSON.stringify(this._departments));

        if (isSkipMessages) {
            console.log("Departments data dumped to local storage");
            return;
        }

        window.localStorage.setItem("messages", JSON.stringify(this._messages));
        console.log("Departments and messaged data dumped to local storage");
    }

    _loadFromStorage () {
        
        let loadedDepartmentsJSON = window.localStorage.getItem("departments");
        if (loadedDepartmentsJSON === null) {
            console.log("No local storage was found");
            window.localStorage.clear();
            return;
        }

        let departments = JSON.parse(loadedDepartmentsJSON);
        if (departments === null) {
            console.log("Error while parsing stored departments data - clear the storage");
            window.localStorage.clear();
            return;
        }

        let messages = {};
        let loadedMessagesJSON = window.localStorage.getItem("messages");            
        if (loadedMessagesJSON != null) {
                    
            let messagesObj = JSON.parse(loadedMessagesJSON);
            if (messagesObj === null) {
                console.log("Error while parsing stored messages data - clear the storage");
                window.localStorage.clear();
                return;
            }
                        
            for (const [msgId, msg] of Object.entries(messagesObj) ) {                                                                                        
                messages[msgId] = Object.assign(new MesssageContext(), msg);
            }
            
            this._messages = messages;
            if (Object.keys(this._messages).length > 0){
                this._nextMsgId = Math.max(...Object.keys(messages)) + 1;        
            }                
        }
        else {
            console.log("No messages on local storage were found");
        }

        this._departments = departments;    
        this._validateDepartments();
        
        if (Object.keys(this._departments).length > 0){
            this._nextDepId = Math.max(...Object.keys(this._departments)) + 1;        
        }        

        console.log("Found valid storage");
        console.log(`this._nextDepId: ${this._nextDepId}\tthis._nextMsgId: ${this._nextMsgId}`);
    } 

    _validateDepartments (departmentId = null) {
        
        if (departmentId != null) {            
            if ( ! (departmentId in this._departments) ) {                
                return;
            }

            let isFound = false;
            for (const msg of Object.values(this._messages) ) {                
                if (departmentId === msg.departmentId) {                    
                    isFound = true;
                    break;
                }                
            }

            if ( ! isFound ) {                
                delete this._departments[departmentId];
            }

            return;
        }

        for (let currDepartmentId in Object.keys(this._departments)) {
            this._validateDepartments(Number(currDepartmentId));
        }
    }
}
