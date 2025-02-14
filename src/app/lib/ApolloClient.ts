import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
const URI = process.env.NEXT_PUBLIC_URI || 'http://localhost:3000'

const client = new ApolloClient({
  link: new HttpLink({ uri: `${URI}/api/graphql`, fetch }),
  cache: new InMemoryCache(),
});

export default client;
