import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as snsSubs from 'aws-cdk-lib/aws-sns-subscriptions';

import { Construct } from 'constructs';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';

interface GilmoreCandlesStatelessStackProps extends cdk.StackProps {
  table: dynamodb.Table;
}

export class GilmoreCandlesStatelessStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: GilmoreCandlesStatelessStackProps
  ) {
    super(scope, id, props);

    // constants for now since this is just a demo
    const serviceName = 'OrderService';
    const metricNamespace = 'GilmoreCandles';
    const emailAddress = 'your.email@email.com';

    // create order lambda handler
    const createOrderLambda: nodeLambda.NodejsFunction =
      new nodeLambda.NodejsFunction(this, 'CreateOrderLambda', {
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: path.join(
          __dirname,
          '../stateless/src/adapters/primary/create-order/create-order.adapter.ts'
        ),
        memorySize: 1024,
        handler: 'handler',
        bundling: {
          minify: true,
        },
        environment: {
          TABLE_NAME: props.table.tableName,
          POWERTOOLS_SERVICE_NAME: serviceName,
          POWERTOOLS_METRICS_NAMESPACE: metricNamespace,
        },
      });
    createOrderLambda.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    // allow the lambda to write to the table
    props.table.grantWriteData(createOrderLambda);

    // create the rest api
    const api: apigw.RestApi = new apigw.RestApi(this, 'CandlesApi', {
      description: 'An API for purchasing candles',
      endpointTypes: [apigw.EndpointType.REGIONAL],
      deploy: true,
      deployOptions: {
        stageName: 'api',
        loggingLevel: apigw.MethodLoggingLevel.INFO,
      },
    });

    // add our prod service resources
    const apiRoot: apigw.Resource = api.root.addResource('v1');
    const ordersResource: apigw.Resource = apiRoot.addResource('orders');

    // add the lambda proxy integration to the api resource (post on orders)
    ordersResource.addMethod(
      'POST',
      new apigw.LambdaIntegration(createOrderLambda, {
        proxy: true,
      })
    );

    // Create the Metric Filter for the lambda function logs specifically
    // i.e. for status code 400 and error type of 'OverAgreedLimit'
    const metricFilter = createOrderLambda.logGroup.addMetricFilter(
      'OverAgreedLimitErrorFilter',
      {
        filterPattern: logs.FilterPattern.literal(
          '{ $.statusCode = 400 && $.errorName = "OverAgreedLimit" }'
        ),
        metricName: 'OverAgreedLimitErrorMetric',
        metricNamespace: metricNamespace,
      }
    );

    // Create the CloudWatch Alarm based on the metric filter above
    const alarm = new cloudwatch.Alarm(this, 'CloudWatchAlarm', {
      alarmName: 'OverAgreedLimitErrorAlarm',
      alarmDescription: 'Error 400 with OverAgreedLimit Error',
      metric: metricFilter.metric(),
      threshold: 1,
      comparisonOperator:
        cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    // create our sns topic for our alarm
    const topic = new sns.Topic(this, 'AlarmTopic', {
      displayName: 'OverAgreedLimitErrorAlarmTopic',
      topicName: 'OverAgreedLimitErrorAlarmTopic',
    });

    // Add an action for the alarm which sends to our sns topic
    alarm.addAlarmAction(new SnsAction(topic));

    // send an email when a message drops into the topic
    topic.addSubscription(new snsSubs.EmailSubscription(emailAddress));
  }
}
