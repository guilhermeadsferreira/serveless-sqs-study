import { SQSEvent } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient();

export async function handler(event: SQSEvent) {
  const records = event.Records;

  const commands = records.map((record) => {
    const body = JSON.parse(record.body);

    const command = new PutItemCommand({
      TableName: 'Payments',
      Item: {
        id: { S: body.orderId },
        message: { S: body.message },
      },
    });

    return client.send(command);
  });

  const responses = await Promise.allSettled(commands);
  const batchItemFailures = responses
    .map((res, index) => {
      if (res.status === 'rejected') {
        return {
          itemIdentifier: event.Records[index].messageId,
        };
      }
      return null;
    })
    .filter(Boolean);

  return {
    batchItemFailures,
  };
}
