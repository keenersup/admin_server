import { gql } from 'apollo-server'

export default gql`
    type User{
        id:ID!
        username: String!
        email: String!
        createdAt:String!
        accessToken: String
        roles:  [ String! ]
    }
    input RegisterInput{
        username: String!
        email: String!
        password: String!
        confirmPassword: String!
        clientId: String
    }
    input UpdateUserInput{
        email: String!
        currentPassword: String
        password: String
        confirmPassword: String
        clientId: String
    }
    input EditPasswordInput{
        currentPassword: String
        password: String
        confirmPassword: String
        clientId: String
    }

    type Token{
        accessToken: String!
    }

    type Query{
        # READ todo: @admin
        allUsers:[User]!
        #        todo: modified
        getUser(id:ID!):User!
    }
    type Mutation{
        # CREATE
        register(registerInput:RegisterInput):User! @guest
        # READ
        login(username: String!, password: String!, clientId:String!):User! @guest
        #        todo: put @auth or not
        logout(username: String!): Boolean!
        updateUser(updateUserInput: UpdateUserInput):User!
        editPassword(editPasswordInput: EditPasswordInput!):User!
        deleteUser(id:ID!):Boolean! @auth
        refreshToken(accessToken: String!, clientId: String!): Token!
    }
`