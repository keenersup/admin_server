import { SchemaDirectiveVisitor, AuthenticationError } from 'apollo-server';
import { defaultFieldResolver } from "graphql";

export class AuthDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field, details) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = function (...args) {

      const [, , context] = args;
      if (!context.user) {
        throw new AuthenticationError('You must be signed in.')
      }
      return resolve.apply(this, args)
    }
  }
}
