import { ApolloServer } from 'apollo-server'
import { mergeResolvers, mergeTypes, fileLoader } from 'merge-graphql-schemas'
import path from 'path'
import { mongooseConnect } from "./utils/mongooseConnect";
import { models } from "./models";
import { addUser } from "./utils/addUser";
import { schemaDirectives } from "./directives";
import { IN_PROD, REACT_CLIENT_ADDRESS, REACT_CLIENT_PORT, SERVER_PORT } from "../config";

(() => {
  const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './typeDefs')))
  const resolvers = mergeResolvers(fileLoader(path.join(__dirname, './resolvers')))

  const server = new ApolloServer({
    cors: {
      origin: `${REACT_CLIENT_ADDRESS}:${REACT_CLIENT_PORT}`,
      credentials: true,
    },
    typeDefs,
    resolvers,
    schemaDirectives,
    playground: IN_PROD ? false : {
      settings: {
        'request.credentials': 'include',
      }
    },
    context: async ({ req }) => {
      const user = await addUser(req) || ''
      return {
        req,
        models,
        user,
      }
    }
  })
  try {
    server.listen({ port: SERVER_PORT })
      .then(({ url }) => {
        console.log(`server ready at ${url}`);
      })
    mongooseConnect()
  } catch (err) {
    console.log(`server error: ${err}`);
  }
})()
