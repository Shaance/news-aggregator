// import * as cdk from '@aws-cdk/core';
// import * as apigateway from "@aws-cdk/aws-apigateway";
// import * as lambda from "@aws-cdk/aws-lambda";

// export class CdkStack extends cdk.Stack {
//   constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
//     super(scope, id, props);

//     const layer = new lambda.LayerVersion(this, 'MyLayer', {
//       code: lambda.Code.fromAsset('../node_modules'),
//       compatibleRuntimes: [lambda.Runtime.NODEJS_12_X],
//     });
    
//     // { accountId: '*', organizationId }
//     // layer.addPermission('*', { accountId: '*'});

//     const handler = new lambda.Function(this, "infoSourceKeysHandler", {
//       runtime: lambda.Runtime.NODEJS_12_X,
//       code: lambda.Code.fromAsset("../lambda.zip"),
//       handler: "indexServerless.infoSourceKeys",
//       layers: [layer],
//     });

    // const api = new apigateway.RestApi(this, "infoSourceKeys-api", {
    //   restApiName: "InfoSourceKeys Service",
    //   description: "This service says hello."
    // });

    // const getInfoSourceKeysIntegration = new apigateway.LambdaIntegration(handler, {
    //   requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    // });

    // api.root.addMethod("GET", getInfoSourceKeysIntegration);
//   }
// }

import * as cdk from '@aws-cdk/core';
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const handler = new lambda.DockerImageFunction(this, 'AssetFunction', {
      code: lambda.DockerImageCode.fromImageAsset('..'),
    });
    
    const api = new apigateway.RestApi(this, "infoSourceKeys-api", {
      restApiName: "InfoSourceKeys Service",
      description: "This service says hello."
    });

    const getInfoSourceKeysIntegration = new apigateway.LambdaIntegration(handler, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    });

    api.root.addMethod("GET", getInfoSourceKeysIntegration);
  }
}

