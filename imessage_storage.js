export const INVALID_DEPARTMENT_ID = -1;


export class MesssageContext {
    
    constructor (content, departmentId, isChecked=false, isPinned=false) {        
        this.content = content;
        this.departmentId = departmentId;
        this.isChecked = isChecked;
        this.isPinned = isPinned;
        
    }

    clone() {
        return new MesssageContext(this.content, this.departmentId, this.isChecked, this.isPinned);
    }
}

export class IMessageStorage {

    constructor () {
        if (this.constructor === IMessageStorage) {
            throw new Error(`Can't instantiate abstarct class ${this.constructor.name}`);
        }
    }

    /**
     * 
     * @param {MesssageContext} messageContext context of message
     * @returns {int} id of message in storage
     */
    addMessage(messageContext) {
        throw new Error(`Class ${this.constructor.name} must implement abstract method addMessage()`);
    }

    /**
     * 
     * @param {int} id id of message to get
     * @returns {MesssageContext} Message in storage
     */
    getMessage(id) {
        throw new Error(`Class ${this.constructor.name} must implement abstract method getMessage()`);
    }
    
    /**
     * 
     * @param {int} id id of message to delete
     */
    deleteMessage(id) {
        throw new Error(`Class ${this.constructor.name} must implement abstract method deleteMessage()`);
    }

    /**
     * 
     * @param {int} id id of message to update 
     * @param {MesssageContext}  messsageContext new context of message
     */
    updateMessage(id, messsageContext) {
        throw new Error(`Class ${this.constructor.name} must implement abstract method updateMessage()`);
    }

    /**
     * @returns {List} Ids of all messages
     */
    getMessageIds() {
        throw new Error(`Class ${this.constructor.name} must implement abstract method getMessageIds()`);
    }
    
    deleteAllMessages() {
        for (let msgId of this.getMessageIds()) {
            this.deleteMessage(msgId);
        }
    }

    getAllMessages() {
        let all_messages = {};
        for (let msgId of this.getMessageIds()) {
            all_messages[msgId] = this.getMessage(msgId);
        }

        return all_messages;
    }
    
    /**
     * 
     * @param {string} departmentName name of department to add
     * @returns {int} id of department in storage
     */
    addDepartment(departmentName) {
        throw new Error(`Class ${this.constructor.name} must implement abstract method addDepartment()`);
    }

    /**
     * 
     * @param {int} id id of department to get
     * @returns {string} Department in storage
     */
    getDepartment(id) {
        throw new Error(`Class ${this.constructor.name} must implement abstract method getDepartment()`);
    }

    /**
     * 
     * @param {int} id id of department to update 
     * @param {string}  departmentName new name of department
     */
    updateDepartment(id, departmentName) {
        throw new Error(`Class ${this.constructor.name} must implement abstract method updateDepartment()`);
    }

    /**
     * @returns {List} Ids of all departments
     */
    getDepartmentIds() {
        throw new Error(`Class ${this.constructor.name} must implement abstract method getDepartmentIds()`);
    }

    getAllDepartments() {
        let all_departments = {};
        for (let depId of this.getDepartmentIds()) {
            all_departments[depId] = this.getDepartment(depId);
        }

        return all_departments;
    }


    forceSync() {
        throw new Error(`Class ${this.constructor.name} must implement abstract method forceSync()`);
    }
}
