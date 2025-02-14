import { transformResponse } from "@/lib/utils";
import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import axios from 'axios';
import { NextRequest } from "next/server";


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

const resolvers = {
    Query: {
        validateAddress: async (_: unknown, { postcode, suburb, state }: AddressRequest) => {
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
            } catch {
                return { success: false, message: "Something went wrong." };
            }
        },
    },
};

const server = new ApolloServer({ typeDefs, resolvers });

const handler = startServerAndCreateNextHandler<NextRequest>(server, {
    context: async (req) => ({ req }),
});

export const POST = async (req: NextRequest) => {
    return handler(req);
};