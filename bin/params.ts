#!/usr/bin/env node
import "source-map-support/register";
import { App } from "aws-cdk-lib";
import { ParamsStack } from "../lib/params-stack.js";

const app = new App();
new ParamsStack(app, "ParamsStack", {});