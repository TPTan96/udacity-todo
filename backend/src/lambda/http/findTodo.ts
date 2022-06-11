import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import * as middy from "middy"
import { cors } from "middy/middlewares"
import { findTodo } from "../../businessLogic/todos"
import { FindTodoRequest } from "../../requests/FindTodoRequest"
import { getUserId } from "../utils"

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
      const userId = getUserId(event)
      const rq: FindTodoRequest = JSON.parse(event.body)
      const todos = await findTodo(userId, rq.name)
  
      return {
        statusCode: 200,
        body: JSON.stringify({
          items: todos
        })
      }
    })
  
  handler.use(
    cors({
      credentials: true
    })
  )