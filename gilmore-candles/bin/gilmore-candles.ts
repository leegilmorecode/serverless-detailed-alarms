#!/usr/bin/env node

import 'source-map-support/register';

import * as cdk from 'aws-cdk-lib';

import { GilmoreCandlesStatefulStack } from '../stateful/stateful';
import { GilmoreCandlesStatelessStack } from '../stateless/stateless';

const app = new cdk.App();
const gilmoreCandlesStatefulStack = new GilmoreCandlesStatefulStack(
  app,
  'GilmoreCandlesStatefulStack',
  {}
);
new GilmoreCandlesStatelessStack(app, 'GilmoreCandlesStatelessStack', {
  table: gilmoreCandlesStatefulStack.table,
});
