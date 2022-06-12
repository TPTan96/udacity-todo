import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS); // enabled X-Ray tracing

const logger = createLogger('TodosAccess data')

export class TodosAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE) {
    }

    async getTodosForUser(userId: string): Promise<TodoItem[]> {

        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: '#userId =:i',
            ExpressionAttributeNames: {
                '#userId': 'userId'
            },
            ExpressionAttributeValues: {
                ':i': userId
            }
        }).promise();

        const items = result.Items
        return items as TodoItem[]
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()
        return todo
    }

    async updateTodo(todo: TodoUpdate, userId: string, todoId: string): Promise<TodoUpdate> {
        const params = {
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            ExpressionAttributeNames: {
                '#todo_name': 'name',
            },
            ExpressionAttributeValues: {
                ':name': todo.name,
                ':dueDate': todo.dueDate,
                ':done': todo.done,
            },
            UpdateExpression: 'SET #todo_name = :name, dueDate = :dueDate, done = :done',
            ReturnValues: 'ALL_NEW',
        };

        const result = await this.docClient.update(params).promise();

        logger.info('Updating result:', { result: result });

        return result.Attributes as TodoUpdate;
    }

    async updateAttachmentUrl(userId: string, todoId: string, attachmentUrl: string) {
        const params = {
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            ExpressionAttributeNames: {
                '#todo_attachmentUrl': 'attachmentUrl'
            },
            ExpressionAttributeValues: {
                ':attachmentUrl': attachmentUrl
            },
            UpdateExpression: 'SET #todo_attachmentUrl = :attachmentUrl',
            ReturnValues: 'ALL_NEW',
        };

        const result = await this.docClient.update(params).promise();
        logger.info('Updating result:', { result: result });
    }

    async deleteTodo(todoId: string, userId: string) {

        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            }
        }).promise();

        logger.info(`Deleting TODO ${todoId} successfully`);
    }

    async findTodo(userId: string, name: string): Promise<TodoItem[]> {

        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: '#userId =:i',
            ExpressionAttributeNames: {
                '#userId': 'userId'
            },
            ExpressionAttributeValues: {
                ':i': userId
            }
        }).promise();

        let items = result.Items as TodoItem[]
        items = items.filter(item => item.name.includes(name))
        return items
    }
}

function createDynamoDBClient(): DocumentClient {
    const service = new XAWS.DynamoDB();
    const client = new AWS.DynamoDB.DocumentClient({
        service: service
    });
    // AWSXRay.captureAWSClient(service);
    return client;
}