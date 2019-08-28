import { SchemaDirectiveVisitor, AuthenticationError } from 'apollo-server';
import { defaultFieldResolver } from "graphql";

export class AdminDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field, details) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async function (...args) {

      const [, , context] = args;
      try {

        /********* ********* ********* ********* ********* ********* ********* ********* *********
         if user roles array has 'admin'
         ********* ********* ********* ********* ********* ********* ********* ********* *********/
        if (!context.user.roles.includes('admin')) {
          throw { userRoles: 'you are not administrator' }
        }
        return resolve.apply(this, args)
      } catch (err) {
        throw new AuthenticationError('permission denied')
      }
    }
  }
}
