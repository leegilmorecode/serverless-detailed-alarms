import {
  DynamoDBClient,
  PutItemCommand,
  PutItemCommandInput,
} from '@aws-sdk/client-dynamodb';

import { OrderDto } from '@dto/order';
import { marshall } from '@aws-sdk/util-dynamodb';

const client: DynamoDBClient = new DynamoDBClient({
  region: process.env.REGION,
});

export async function createOrder(createOrderDto: OrderDto): Promise<OrderDto> {
  if (!process.env.TABLE_NAME) {
    throw new Error('no table name supplied');
  }

  const tableName = process.env.TABLE_NAME;

  const input: PutItemCommandInput = {
    TableName: tableName,
    Item: marshall(createOrderDto),
  };

  await client.send(new PutItemCommand(input));

  return createOrderDto;
}
