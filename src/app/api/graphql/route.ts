import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import axios from 'axios';
// Define GraphQL Schema
const typeDefs = `#graphql
  type Query {
    validateAddress(postcode: String, suburb: String, state: String): AddressResponse
  }

  type AddressResponse {
    success: Boolean!
    message: String!
  }
`;
type Locality = {
    category: string;
    id: number;
    latitude: number;
    location: string;
    longitude: number;
    postcode: number;
    state: string;
};
type Localities = {
    locality: Locality | Locality[]
}
export type AddressResponse = {
    localities: Localities | string
};

export type AddressRequest = {
    postcode?: string;
    suburb?: string;
    state?: string;
}
export const getErrorMessage = (req: AddressRequest) => {
    if(req.postcode && req.suburb && req.state) {
        return `The ${req.postcode} does not match the suburb ${req.suburb} or state ${req.state}`
    }
    if (req.postcode && req.suburb) {
        return `The ${req.postcode} does not match the suburb ${req.suburb}`
    }
    if (req.suburb && req.state) {
        return `The suburb ${req.suburb} does not exist in the state (${req.state})`
    }

    return `There is no data mathing this request`;
}

export const getSuccessMessage = (req: AddressRequest) => {
    if (req.postcode && req.state && req.suburb) {
        return `The postcode, suburb, and state input are valid.`
    }
    if (req.postcode && req.suburb) {
        return `The postcode ${req.postcode} match the suburb ${req.suburb}`
    }
    if (req.suburb && req.state) {
        return `The suburb ${req.suburb} exist in the state (${req.state})`
    }

    return `The response was successful`;
}

export const transformResponse = (data: AddressResponse, req: AddressRequest) => {
    if (data.localities === '') {
        return {
            success: false,
            message: getErrorMessage(req)
        }
    }
    if (data.localities && data.localities) {
        return {
            success: true,
            message: getSuccessMessage(req),
        };
    }

    return {
        success: false,
        message: "No valid locality found.",
    };
};


const resolvers = {
    Query: {
        validateAddress: async (_: any, { postcode, suburb, state }: AddressRequest) => {
            try {
                const { data } = await axios.get(`${process.env.API_URL}`, {
                    params: {
                        q: postcode || suburb,
                        state
                    },
                    headers: {
                        "Authorization": `Bearer ${process.env.TOKEN}`
                    }
                });
                return transformResponse(data, { postcode, suburb, state })
            } catch (error) {
                return { success: false, message: "Something went wrong." };
            }
        },
    },
};

const server = new ApolloServer({ typeDefs, resolvers });

const handler = startServerAndCreateNextHandler(server);

export { handler as GET, handler as POST }; 
