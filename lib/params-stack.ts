import { Stack, type StackProps, CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import { Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class ParamsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const fnName = 'ParamsFn';
    const logGroup = new LogGroup(this, 'MyLogGroup', {
      logGroupName: `/aws/lambda/${fnName}`,
      removalPolicy: RemovalPolicy.DESTROY,
      retention: RetentionDays.ONE_DAY,
    });

    const myParameter = new StringParameter(this, 'MySsmParameter', {
      parameterName: '/my/custom/parameter.json',
      stringValue: JSON.stringify({
        key1: 'value1',
      }),
      // You can specify other properties like description, tier, etc.
    });
    const myOtherParameter = new StringParameter(this, 'MyOtherSsmParameter', {
      parameterName: '/my/custom/parameter2.json',
      stringValue: 'my-parameter-value',
      // You can specify other properties like description, tier, etc.
    });

    const fn = new NodejsFunction(this, 'MyFunction', {
      functionName: fnName,
      logGroup,
      runtime: Runtime.NODEJS_20_X,
      entry: './src/index.ts',
      handler: 'handler',
      tracing: Tracing.ACTIVE,
      environment: {
        SSM_PARAMETER_PREFIX: '/my/custom/',
        NODE_OPTIONS: '--enable-source-maps',
      },
      bundling: {
        minify: true,
        mainFields: ['module', 'main'],
        sourceMap: true,
        format: OutputFormat.ESM,
        banner:
          "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
      },
    });
    fn.addToRolePolicy(
      new PolicyStatement({
        actions: ['ssm:GetParametersByPath'],
        resources: ['*'],
        effect: Effect.ALLOW,
      })
    );

    /* myParameter.grantRead(fn);
    myOtherParameter.grantRead(fn); */

    new CfnOutput(this, 'FunctionArn', {
      value: fn.functionArn,
    });
  }
}
