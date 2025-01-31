export const schema = `#graphql

    type restaurante {

        id:ID!
        nombre:String!
        direccion:String!
        telefono:String!
        temperatura:String!
        hora:String!
    }

    type Query {

        getRestaurant(id:ID!):restaurante!
        getRestaurants(ciudad:String!):[restaurante!]!
    }

    type Mutation {

        deleteRestaurant(id:ID!):Boolean!
        addRestaurant(nombre:String!,direccion:String!,ciudad:String!,telefono:String!):restaurante!
    }

    

`