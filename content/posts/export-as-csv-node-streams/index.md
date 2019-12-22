---
title: Export DB Data as CSV with Node streams, Gzip, Knex and AWS S3
date: 2019-07-01
description: Use NodeJS streams to upload CSV files to AWS S3.
tags: ['post', 'streams', 'node', 'aws-s3', 'knex']
---

In webapps, It's pretty common to be asked to have an **export as CSV** functionality. 

Let's be honest. It's **not the best feature to write**. It would be nice to get it done right away. 

I will share a way to do it quickly by: 
 - using **Javascript** (maybe AWS Lambdas)
 - using **NodeJS streams**
 - using **AWS S3** to save the file

### Why NodeJS Streams?

When we export db data, It's not possible to have all query results in memory and save them into a file. It's likely to be ran out of memory.  

Here is where **NodeJS Streams** comes into play. 

> Streams are a powerful way of piping data through as it comes in, rather than all at once. You can read more about streams [here at substack's stream handbook](https://github.com/substack/stream-handbook).

See official docs [here](https://nodejs.org/api/stream.html).

### DB Query

For the query, We will use [Knex.js](https://knexjs.org/), a pretty simple but powerful SQL query builder. It comes with built-in stream support.

Let's write some query:
```js
const getQueryStream = (organizationId) => 
  db.select('*')
    .from('users')
    .where('organization_id', organizationId)
    .stream();
```
```db``` is an abstraction of ```knex``` object. See more [here](https://gist.github.com/santiagovazquez/3c87610016acf47c87129c6018623000)

### S3 Upload

For uploading to ```AWS S3```, we will use [NodeJS AWS SDK](https://aws.amazon.com/es/sdk-for-node-js/).

**`code:`**

```js
const stream = require('stream');
const S3 = require('aws-sdk/clients/s3');

const uploadToS3 = (outputFile) => {
  const passT = new stream.PassThrough();
  const s3 = new S3({ apiVersion: '2006-03-01' });
  const params = {
    Body: passT,
    Bucket: YOUR_BUCKET, // put your bucket here
    Key: `exports/${outputFile}`, // saving file inside exports folder
    ACL: 'public-read',
    ContentType: 'text/csv',
    ContentEncoding: 'gzip',
  };

  return {
    promise: s3.upload(params).promise(),
    stream: passT,
  };
};
```

### From DB to CSV Row Transform

We need to take each query result row and transform it to CSV format. We could ask which fields we would like to be included on the result file.

**`code:`**

```js
const stream = require('stream');

const toCSVTransform = (fields) => new stream.Transform({
  objectMode: true,
  transform: (row, encoding, callback) => {
    let rowAsArr = [];

    for(let i = 0; i < fields.length; i++) {
      rowAsArr.push(row[fields[i]]);
    }

    callback(null, `${rowAsArr.join(',')}\n`);
  }
});
```

### Putting things together

We are almost there. 

Since our result is ```text```, We would like to use Gzip to make smaller files. Learn [more](https://nodejs.org/api/zlib.html).

Also, We will use ```uuid/v1``` library to generate a unique filenames every time our function is executed. Learn [more](https://github.com/kelektiv/node-uuid)

```js
const zlib = require('zlib');
const uuidv1 = require('uuid/v1');

const getExportFileLink = (organizationId) => {
  const gzip = zlib.createGzip();
  const dbStream = getQueryStream(organizationId);
  const { 
    stream: s3WritableStream, 
    promise: s3Upload 
  } = uploadToS3(`${uuidv1()}.csv`);
  
  dbStream
    .pipe(toCSVTransform(['first_name', 'last_name', 'email']))
    .pipe(gzip)
    .pipe(s3WritableStream);
  return s3Upload.then(({ Location: link }) => link ));
};
```

### Final comments

 - AWS Lambdas is awesome to run code like this. Be careful with concurrency. You do not want to reach maximum pool size on your db.
 - In my production code, I have a queue with task definitions and some lambda is consuming and executing elements from the queue.  
 - Also, my code ends sending an email with the link (obviously!).

If you have any questions, please contact me on [twitter](https://twitter.com/savazq).
