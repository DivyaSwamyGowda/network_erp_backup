// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import { NestExpressApplication } from '@nestjs/platform-express';
// import { join } from 'path';
// import * as bodyParser from 'body-parser';

// async function bootstrap() {
//   const app = await NestFactory.create<NestExpressApplication>(AppModule);

// app.use(bodyParser.json({ limit: '5000mb' }));
// app.use(bodyParser.urlencoded({ extended: true, limit: '5000mb' }))

// app.use((req, res, next) => {
//     req.setTimeout(60 * 60 * 1000); 
//     res.setTimeout(60 * 60 * 1000); 
//     next();
//   });

//   const config = new DocumentBuilder()
//     .setTitle('My API Documentation')
//     .setDescription('API documentation for my NestJS application')
//     .setVersion('1.0')
//     .addBearerAuth() // Adds authorization header for JWT
//     .build();

//   app.enableCors({
//     origin: '*', // Allow all origins
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP methods
//     allowedHeaders: 'Content-Type,Authorization', // Allowed headers
//     credentials: true, // Allow credentials (cookies, auth headers, etc.)
//   });

//   //✅ Serve static files from the 'assets' directory
//   // app.useStaticAssets(join(__dirname, '..', 'assets'), {
//   //   prefix: '/files/',
//   //   index: false,
//   // });


// app.useStaticAssets(join(__dirname, '../../assets'), { prefix: '/files/' });

//   // ✅ Set up Swagger docs
//   const document = SwaggerModule.createDocument(app, config);
//   SwaggerModule.setup('api/docs', app, document);

//   // ✅ Start the server
//   await app.listen(4001);
// }
// bootstrap();







import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

app.use(bodyParser.json({ limit: '5000mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '5000mb' }))

app.use((req, res, next) => {
    req.setTimeout(60 * 60 * 1000); 
    res.setTimeout(60 * 60 * 1000); 
    next();
  });

  const config = new DocumentBuilder()
    .setTitle('My API Documentation')
    .setDescription('API documentation for my NestJS application')
    .setVersion('1.0')
    .addBearerAuth() // Adds authorization header for JWT
    .build();

  app.enableCors({
    origin: '*', // Allow all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP methods
    allowedHeaders: 'Content-Type,Authorization', // Allowed headers
    credentials: true, // Allow credentials (cookies, auth headers, etc.)
  });

  //✅ Serve static files from the 'assets' directory
  // app.useStaticAssets(join(__dirname, '..', 'assets'), {
  //   prefix: '/files/',
  //   index: false,
  // });


app.useStaticAssets(join(__dirname, '../../assets'), { prefix: '/files/' });

  // ✅ Set up Swagger docs
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // ✅ Start the server
  await app.listen(4001);
}
bootstrap();







