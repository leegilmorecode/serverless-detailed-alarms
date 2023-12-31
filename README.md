# Monitoring AWS CloudWatch Logs with CDK: Creating Alarms for Specific Error Conditions

An example of creating AWS CloudWatch alarms on filtered CloudWatch logs using the AWS CDK and TypeScript.

![image](./docs/images/header.png)

The article for this repo can be found here: https://medium.com/@leejamesgilmore/monitoring-aws-cloudwatch-logs-with-cdk-creating-alarms-for-specific-error-conditions-bae0c4e36f79

## Introduction

In the world of cloud computing, effective monitoring and alerting are crucial for maintaining the health and stability of your serverless applications and services. AWS CloudWatch is a powerful monitoring and observability service provided by AWS which we are going to use in this article.

One essential aspect of monitoring is keeping a close eye on logs generated by your applications and services. CloudWatch Logs allows you to gain insights from log data generated by AWS resources and your own applications.

In this code repo example, we will explore how to leverage the AWS CDK to create CloudWatch Alarms based on specific error conditions in CloudWatch Logs. We will walk through the process of configuring the necessary resources such as Log Groups and Metric Filters, and setting up CloudWatch Alarms to trigger actions when these error conditions are detected.

> Note: This is a basic example to discuss the features and is not production ready.
