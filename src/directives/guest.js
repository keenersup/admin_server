import { SchemaDirectiveVisitor, AuthenticationError } from 'apollo-server';
import { defaultFieldResolver } from "graphql";

export class GuestDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field, details) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = function (...args) {
      const [, , context] = args;

      /********* ********* ********* ********* ********* ********* ********* ********* *********
       todo: includes user change to admin
       ********* ********* ********* ********* ********* ********* ********* ********* *********/
      if (context.user) {
        if (context.user.roles.includes('admin')) {
          return resolve.apply(this, args)
        }
        throw new AuthenticationError('You are already signed out.')
      }
      return resolve.apply(this, args)
    }
  }
}
