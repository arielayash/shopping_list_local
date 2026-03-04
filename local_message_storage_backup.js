import { IMessageStorage } from "./imessage_storage.js";


export class LocalMessageStorage extends IMessageStorage { 
    
    constructor() {

        super();

        this._messages = {};
        this._nextMsgId = 0;     
        
        this._departments = {};
        this._nextDepId = 0;
    }

    forceSync() {}

    addMessage(messageContext) {
        let currId = this._nextMsgId++;
        this._messages[currId] = messageContext;
        console.log(`Message "${messageContext.content}" with id ${currId} was added`);
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
        
        delete this._messages[id];
        console.log(`Message with id ${id} removed`);
    }

    updateMessage(id, messageContext) {

        if ( !(id in this._messages) ) {
            throw new Error(`Message with id ${id} is not exists in storage`);
        }

        this._messages[id] = messageContext;
        console.log(`Message with id ${id}  updated to "${messageContext.content}"`);
    }

    getMessageIds() {
        return Object.keys(this._messages);
    }


    addDepartment(departmentName) {
        let currId = this._nextDepId++;
        this._departments[currId] = departmentName;
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
        console.log(`Department with id ${id} updated to "${departmentName}"`);        
    }

    getDepartmentIds() {
        return Object.keys(this._departments);
    }
}
