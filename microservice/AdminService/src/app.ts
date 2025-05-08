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
      // console.log('AuthChecker called with roles:', roles);
      // console.log('Context headers:', context.headers);
      const authHeader = context.headers.authorization;

      if (!authHeader) {
        throw new Error('Unauthorized: Missing Authorization header');
      }

      // console.log(authHeader)

      try {
        // console.log("required roles is " + roles)
        // Make a call to the authChecker microservice
        const response = await fetch('http://localhost:3010/api/v0/auth/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
          body: JSON.stringify(roles),
        });

        if (response.status !== 200) {
          // console.error('AuthChecker Error:', response);
          throw new Error('Unauthorized123');
        }

        const user = await response.json();
        return !!user; // Return true if the user is authorized
      } catch {
        // console.error('AuthChecker Error:', error);
        throw new Error('Unauthorized312');
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