import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../fileStorage/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { TodoUpdate } from '../models/TodoUpdate'
// import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'



// TODO: Implement businessLogic
const todosAccess = new TodosAccess();
const accessFile = new AttachmentUtils();

export async function createAttachmentPresignedUrl(userId: string, todoId: string): Promise<String> {
    const uploadUrl = await accessFile.getUploadUrl(todoId);
    const attachmentUrl = accessFile.getAttachmentUrl(todoId);
    await todosAccess.updateAttachmentUrl(userId, todoId, attachmentUrl);
    return uploadUrl;
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    return todosAccess.getTodosForUser(userId);
}

export async function createTodo(createTodoRequest: CreateTodoRequest, userId: string): Promise<TodoItem> {

    const todoId = uuid.v4();
    const timestamp = new Date().toISOString();

    return await todosAccess.createTodo({
        userId: userId,
        todoId: todoId,
        createdAt: timestamp,
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false
    });
}

export async function updateTodo(todoId: string, updateTodoRequest: UpdateTodoRequest, userId: string): Promise<TodoUpdate> {

    return await todosAccess.updateTodo({
        name: updateTodoRequest.name,
        dueDate: updateTodoRequest.dueDate,
        done: updateTodoRequest.done
    },
        todoId,
        userId);
}

export async function deleteTodo(todoId: string, userId: string) {
    await todosAccess.deleteTodo(todoId, userId)
}

export async function findTodo(userId: string, name: string): Promise<TodoItem[]> {
    return todosAccess.findTodo(userId, name);
}