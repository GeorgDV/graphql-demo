const express = require("express");
const app = express();
const port = 3000;

const { ApolloServer, gql } = require("apollo-server-express");

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Message {
    "this is a comment - below is message id"
    ID: ID!
    title: String!
    body(trim: Int): String
  }

  """
  This is a comment
  """
  type Query {
    messages(limit: Int): [Message]
  }

  type Mutation {
    addMessage(title: String!, body: String): Message
    getMessageById(ID: ID!) : Message
    clearAllMessages : Int 
    updateMessage(ID: ID, title: String, body: String) : Boolean
  }
`;

// var to save the message into
let messages = [];
// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    messages: (root, params) => {
      console.log("\n\nget_messages", messages);
      return [...messages].reverse().slice(0, params.limit);
    }
  },
  Mutation: {
    addMessage: (root, message) => {
      message.ID = messages.length;
      messages.push(message);
      console.log("add_message", message);
      return message;
    },
    getMessageById: (root, params) => {
      console.log("\nget message by id", params.ID, "\n", messages[params.ID]);
      return messages.find(message =>  message.ID == params.ID);
    },
    clearAllMessages: (root, params) => {
      var messagesCount = messages.length;
      console.log(messagesCount, " Messages cleared...");
      messages = [];
      return messagesCount;
    },
    updateMessage: (root, params) => {
      messages.find(msg, index => {
        if (msg.ID == params.ID) {
          if (params.title) {
            messages[index].title = params.title;
          }
          if (params.body) {
            messages[index].body = params.body;
          }
          console.log("\nmessage updated\n");
          return true;
        }
        else {
          return false;
        }
      });
    }
  },
  Message: {
    body: (root, params) => {
      if (!root.body || !params.trim || root.body.length < params.trim) {
        return root.body;
      }
      return root.body.substr(0, params.trim) + "...";
    }
  }
};

app.get("/", (req, res) => res.send("Hello World!!!"));

const server = new ApolloServer({ typeDefs, resolvers });
server.applyMiddleware({ app, path: "/graphql" });

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}/`);
});
