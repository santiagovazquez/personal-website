---
title: Build an email system with Serverless and NodeJS
date: 2019-12-24
description: Learn how to build a simple email system for your app using AWS Lambda, AWS SES, AWS SNS, Serverless Framework and some NodeJS libraries.
tags: ['post', 'javascript', 'serverless', 'node', 'aws-lambda', 'aws-ses']
---

Build an email system for your app could be challenging. 

Let's mention some of the things we would like:

 - **Easy to use** with an API to trigger mails from any of our services.
 - Easy to configure and deploy
 - Highly available 
 - **Scalable**
 - Email templates 
 - Avoid html boilerplate and inline-css. 
 - Simple usage of images on emails.
 - **Cheap** (be charged only per use).

### Architecture

My first attempt was to build a **NodeJS App** with a **REST API** to send emails. Good solution but not great. It doesn't make sense to have an app running all the time. 

**AWS Lambda** is a great fit to our use case. 

> **AWS Lambda** lets you run code without provisioning or managing servers. You pay only for the compute time you consume.

We can cross out **cheap** and **scalable** from the list.

#### How do we trigger Lambda Code?

We could use [AWS SDK](https://aws.amazon.com/es/sdk-for-node-js/) to call our Lambda Function (which sends an email). I don't like that option because:

- Our code must know that there's a lambda function behind the scenes.  
- If we change our lambda function, we must update all our calls.
- If we messed up with our lambda function, we will miss emails. 

It would be great to push an email event to some trusted pub/sub service. 

#### Amazon SNS

Some cool thing about cloud services is that they are easy to integrate.

We will introduce another great service by **AWS**:

> **Amazon Simple Notification Service (SNS)** is a highly available, durable, secure, fully managed pub/sub messaging service that enables you to decouple microservices, distributed systems, and serverless applications.
    
**AWS SNS** provide us a pub/sub service where we can send notifications from our code and have our lambda code executed when that happens. Learn more [here](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html).

Also if no one handled the notification, we can do something about it to avoid losing emails. See more [here](https://aws.amazon.com/about-aws/whats-new/2019/11/amazon-sns-adds-support-for-dead-letter-queues-dlq/).

The first step to start using **AWS SNS** is to create a new topic to which notifications can be published.  

Your code to send emails will look like:

```js
const aws = require('aws-sdk');
const sns = new aws.SNS({ /* ... aws params */ });
const sendMail = (to, template, locals) => 
  sns.publish({
    Message: JSON.stringify({ to, locals, template }),
    TopicArn: 'your-topic-arn',
  }).promise();
```

Simple, right? We can cross out **highly available** from the initial list.

### Sending emails

The last step is building out a mail function which will be executed whenever a new mail notification is received.

We would like: 
 - Use a CSS Sheet instead of inline-css.
 - Include images just like we include them on a website.
 - Use a template engine to render emails.
 - Avoid html boilerplate.

A great NodeJS library that let us have all of these is [**email-templates**](https://github.com/forwardemail/email-templates).

> **email-templates** let you create, preview, and send custom email templates for Node.js. Highly configurable and supports automatic inline CSS, stylesheets, embedded images and fonts, and much more!

In addition to ```email-templates```, we will use:
 - ```nodemailer``` which let us specify **AWS SES** as service to send emails. 
 - ```nodemailer-base64-to-s3``` automatically uploads images on our emails to **AWS S3** 
 - ```pug``` as our template engine, to avoid html boilerplate. 

#### Code

**```mailer.js```**

```js

/**
 * Mailing service. Use this function to send an email
 * @module util/mailing_service
 */
const Email = require('email-templates');
const { createTransport } = require('./aws');
const constants = require('./constants');

function send(to, { template, locals }) {
  const transport = createTransport();

  const email = new Email({
    message: {
      from: constants.EMAIL_FROM, // sender address
    },
    transport,
    juice: true,
    juiceResources: {
      preserveImportant: true,
      webResources: {
        images: true,
        //
        // this is the relative directory to your CSS/image assets
        // and its default path is `build/`:
        //
        // e.g. if you have the following in the `<head`> of your template:
        // `<link rel="stylesheet" href="style.css" data-inline="data-inline">`
        // then this assumes that the file `build/style.css` exists
        //
        relativeTo: `${constants.TEMPLATES_DIR}/assets`,
      },
    },
  });

  return email.send({
    message: {
      to, // list of receivers
      // subject, // Subject line
    },
    template: `${constants.TEMPLATES_DIR}/${template}`,
    locals,
  });
}

module.exports = { send };

```

**```aws.js```**

```js
// load aws sdk
const aws = require('aws-sdk');
const base64ToS3 = require('nodemailer-base64-to-s3');
const nodemailer = require('nodemailer');
const constants = require('./constants');

// load aws config
aws.config.apiVersions = "2010-12-01";

aws.config.update({
  region: constants.REGION,
  accessKeyId: constants.ACCESS_KEY_ID,
  secretAccessKey: constants.SECRET_ACCESS_KEY,
  sessionToken: constants.SESSION_TOKEN,
});

function createTransport() {
  const transport = nodemailer.createTransport({ SES: new aws.SES() });

  if (constants.NODE_ENV === 'production') {
    transport.use(
      'compile',
      base64ToS3({
        dir: '/mailing',
        aws: {
          accessKeyId: constants.ACCESS_KEY_ID,
          secretAccessKey: constants.SECRET_ACCESS_KEY,
          sessionToken: constants.SESSION_TOKEN,
          params: { Bucket: constants.S3_BUCKET }
        },
      }),
    );
  }

  return transport;
}

module.exports = { createTransport, aws };
```

See the rest of the code on [my repo](https://github.com/santiagovazquez/lambda-mailer).

#### Serverless

Finally to build our infrastructure, we will use Serverless Framework. See how to configure AWS Credentials [here](https://serverless.com/framework/docs/providers/aws/cli-reference/config-credentials/)

It let us create and deploy everything with a single command: 

```
sls deploy -v --stage prod
```

Also we can test locally our mails. See more on my repo's [README.md](https://github.com/santiagovazquez/lambda-mailer).
