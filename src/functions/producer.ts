import { response } from '@/utils/response';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { randomUUID } from 'node:crypto';

const client = new SQSClient();

export async function handler(event: APIGatewayProxyEventV2) {
  const body = JSON.parse(event.body ?? '');
  const message = {
    orderId: randomUUID(),
    message: body.message,
  };

  const command = new SendMessageCommand({
    QueueUrl: process.env.QUEUE_URL,
    MessageBody: JSON.stringify(message),
  });

  await client.send(command);

  return response(200, message);
}
