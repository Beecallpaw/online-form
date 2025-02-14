import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
const URI = process.env.NEXT_PUBLIC_URI || 'https://online-form-sandy.vercel.app'

const client = new ApolloClient({
  link: new HttpLink({ uri: `${URI}/api/graphql`, fetch }),
  cache: new InMemoryCache(),
});

export default client;
