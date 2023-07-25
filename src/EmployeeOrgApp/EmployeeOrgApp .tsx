interface Employee {
    uniqueId: number;
    name: string;
    subordinates: Employee[];
}

interface IEmployeeOrgApp {
    ceo: Employee;
    move(employeeID: number, supervisorID: number): void;
    undo(): void;
    redo(): void;
}

export default class EmployeeOrgApp implements IEmployeeOrgApp {
    private actionStack: Array<{ employeeID: number; prevSupervisor: Employee }> = [];
    private redoStack: Array<{ employeeID: number; newSupervisor: Employee }> = [];

    constructor(public ceo: Employee) { }

    move(employeeID: number, supervisorID: number): void {
        const employee = this.findEmployee(this.ceo, employeeID);
        const supervisor = this.findEmployee(this.ceo, supervisorID);

        if (!employee || !supervisor) {
            console.error('Employee or supervisor not found.');
            return;
        }

        // Save the current supervisor of the employee for undo action
        this.actionStack.push({ employeeID, prevSupervisor: employee.subordinates[0] });

        // Remove the employee from the current supervisor's subordinates list
        if (employee.subordinates.length > 0) {
            const index = employee.subordinates[0].subordinates.findIndex(
                (subordinate) => subordinate.uniqueId === employeeID
            );
            if (index !== -1) {
                employee.subordinates[0].subordinates.splice(index, 1);
            }
        }

        // Add the employee as a subordinate of the new supervisor
        supervisor.subordinates.push(employee);
    }

    undo(): void {
        if (this.actionStack.length === 0) {
            console.error('No action to undo.');
            return;
        }

        const { employeeID, prevSupervisor } = this.actionStack.pop()!;
        const employee = this.findEmployee(this.ceo, employeeID);
        const currentSupervisor = employee!.subordinates[0];

        // Save the current supervisor for redo action
        this.redoStack.push({ employeeID, newSupervisor: currentSupervisor });

        // Remove the employee from the current supervisor's subordinates list
        const index = currentSupervisor.subordinates.findIndex(
            (subordinate) => subordinate.uniqueId === employeeID
        );
        if (index !== -1) {
            currentSupervisor.subordinates.splice(index, 1);
        }

        // Add the employee as a subordinate of the previous supervisor
        if (prevSupervisor) {
            prevSupervisor.subordinates.push(employee!);
        }
    }

    redo(): void {
        if (this.redoStack.length === 0) {
            console.error('No action to redo.');
            return;
        }

        const { employeeID, newSupervisor } = this.redoStack.pop()!;
        const employee = this.findEmployee(this.ceo, employeeID);
        const currentSupervisor = employee!.subordinates[0];

        // Save the current supervisor for undo action
        this.actionStack.push({ employeeID, prevSupervisor: currentSupervisor });

        // Remove the employee from the current supervisor's subordinates list
        const index = currentSupervisor.subordinates.findIndex(
            (subordinate) => subordinate.uniqueId === employeeID
        );
        if (index !== -1) {
            currentSupervisor.subordinates.splice(index, 1);
        }

        // Add the employee as a subordinate of the new supervisor
        newSupervisor.subordinates.push(employee!);
    }

    private findEmployee(root: Employee, employeeID: number): Employee | undefined {
        if (root.uniqueId === employeeID) {
            return root;
        }
        for (const subordinate of root.subordinates) {
            const foundEmployee = this.findEmployee(subordinate, employeeID);
            if (foundEmployee) {
                return foundEmployee;
            }
        }
        return undefined;
    }
}

// Example usage:
const ceo: Employee = {
    uniqueId: 1,
    name: 'John Smith',
    subordinates: [
        {
            uniqueId: 2,
            name: 'Margot Donald',
            subordinates: [
                { uniqueId: 5, name: 'Tina Teff', subordinates: [] },
                { uniqueId: 6, name: 'Will Turner', subordinates: [] },
            ],
        },
        {
            uniqueId: 3,
            name: 'Tyler Simpson',
            subordinates: [
                { uniqueId: 7, name: 'Ben Willis', subordinates: [] },
                { uniqueId: 8, name: 'Georgina Flangy', subordinates: [] },
                { uniqueId: 9, name: 'Sophie Turner', subordinates: [] },
            ],
        },
    ],
};

const app = new EmployeeOrgApp(ceo);

// Move Tina Teff to become subordinate of Georgina Flangy
app.move(5, 8);

// Undo the last move
app.undo();

// Redo the undone action
app.redo();