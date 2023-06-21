import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

import { Construct } from 'constructs';

export class GilmoreCandlesStatefulStack extends cdk.Stack {
  public table: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // our dynamodb table to hold orders
    this.table = new dynamodb.Table(this, 'Table', {
      tableName: 'CandlesTable',
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
    });
    this.table.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
  }
}
