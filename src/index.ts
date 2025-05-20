import { getStringFromEnv } from '@aws-lambda-powertools/commons/utils/env';
import { getParameters } from '@aws-lambda-powertools/parameters/ssm';

const parameterPrefix = getStringFromEnv({
  key: 'SSM_PARAMETER_PREFIX',
});

const parameters = await getParameters(parameterPrefix, {
  transform: 'auto',
  throwOnTransformError: true,
});

export const handler = async () => {
  console.log('Parameters:', parameters);
  return {
    statusCode: 200,
    body: JSON.stringify(parameters),
  };
};
