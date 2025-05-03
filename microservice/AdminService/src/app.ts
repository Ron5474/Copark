import express, { Express } from 'express';
import path from 'path';
import { createHandler } from 'graphql-http/lib/use/express';
import { renderPlaygroundPage } from 'graphql-playground-html';
import 'reflect-metadata'; // must come before buildSchema
import { buildSchema } from 'type-graphql';
import { resolvers } from './resolvers';
import fetch from 'node-fetch'; // Import fetch for HTTP calls

const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

async function bootstrap() {
  const schema = await buildSchema({
    resolvers: resolvers,
    validate: true,
    authChecker: async ({ context }, roles) => {
      console.log('AuthChecker called with roles:', roles);
      console.log('Context headers:', context.headers);
      const authHeader = context.headers.authorization;

      if (!authHeader) {
        throw new Error('Unauthorized: Missing Authorization header');
      }

      try {
        // Make a call to the authChecker microservice
        const response = await fetch('http://localhost:3010/api/v0/auth/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
          body: JSON.stringify({ scopes: roles }),
        });

        if (response.status !== 200) {
          throw new Error('Unauthorized');
        }

        const user = await response.json();
        return !!user; // Return true if the user is authorized
      } catch (error) {
        console.error('AuthChecker Error:', error);
        throw new Error('Unauthorized');
      }
    },
    emitSchemaFile: {
      path: path.resolve(__dirname, '../build/schema.gql'),
      sortedSchema: true,
    },
  });

  app.use(
    '/graphql',
    createHandler({
      schema: schema,
      context: (req) => ({
        headers: req.headers,
      }),
    })
  );

  // Updated /playground route
  app.get('/playground', (req, res) => {
    res.send(
      renderPlaygroundPage({
        endpoint: '/graphql',
      })
    );
  });
}

export { app, bootstrap };