import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { typeDefs } from './schema'
import { resolvers } from './resolvers'
import { createDataLoaders } from './dataloader'
import { Express } from 'express'

export async function setupGraphQL(app: Express) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (error) => {
      console.error('GraphQL Error:', error)
      return {
        message: error.message,
        extensions: {
          code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
        },
      }
    },
  })

  await server.start()

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async () => ({
        loaders: createDataLoaders(),
      }),
    })
  )

  return server
}
